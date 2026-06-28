import {
  DEFAULT_BUILD_ORDER,
  type BuildOrder,
  type BuildOrderStage
} from "./build-order";
import { configKey, configsEqual, normalizeConfigs } from "./configs";
import { getBuildPositions } from "./commands";
import { TraversalAxis, TraversalDirection } from "./enums";
import { ShipShapeError } from "./errors";
import type { Blueprint, BlueprintCommand, BuildCommand, ConfigData } from "./types";

export interface StructureBuild {
  id: number;
  item: number;
  x: number;
  y: number;
  shape: number;
  configs: ConfigData[];
  priority: number;
}

export interface PlaceItemOptions {
  shape?: number;
  configs?: ConfigData[];
  priority?: number;
}

interface BuildGroup {
  item: number;
  shape: number;
}

interface BuildChain {
  baseX: number;
  y: number;
  bits: bigint;
}

interface GroupedBuildChain {
  group: BuildGroup;
  chain: BuildChain;
}

interface ConfigRun {
  configs: ConfigData[];
  builds: StructureBuild[];
}

interface BuildTraversal {
  direction: TraversalDirection;
  axis: TraversalAxis;
}

/**
 * Editable view of a Deep Space Airships blueprint.
 *
 * `Structure` expands build commands into individual placements, supports
 * programmatic edits, then compacts placements back into blueprint commands.
 */
export class Structure {
  private builds: StructureBuild[] = [];
  private buildsById = new Map<number, StructureBuild>();
  private serialId = 0;

  constructor(
    public readonly width: number,
    public readonly height: number
  ) {}

  /**
   * Creates an editable structure from decoded blueprint data.
   */
  static fromBlueprint(blueprint: Blueprint): Structure {
    const structure = new Structure(blueprint.width, blueprint.height);
    let currentConfigs: ConfigData[] = [];

    for (const command of blueprint.commands) {
      if (command.type === "configuration") {
        currentConfigs = [...command.configs];
        continue;
      }

      for (const x of getBuildPositions(command)) {
        structure.place(command.item, x, command.y, {
          shape: command.shape,
          configs: [...currentConfigs]
        });
      }
    }

    return structure;
  }

  /**
   * Places one item and returns its editing ID.
   */
  place(item: number, x: number, y: number, options: PlaceItemOptions = {}): number {
    if (x < -0.5 || x > this.width - 0.5 || y < -0.5 || y > this.height - 0.5) {
      throw new ShipShapeError("INVALID_BLUEPRINT", "Item placement out of bounds");
    }

    const build: StructureBuild = {
      id: this.nextId(),
      item,
      x,
      y,
      shape: options.shape ?? 0,
      configs: [...(options.configs ?? [])],
      priority: options.priority ?? 0
    };
    this.addBuild(build);
    return build.id;
  }

  /**
   * Removes a placed item by editing ID.
   */
  remove(id: number): boolean {
    const build = this.buildsById.get(id);
    if (!build) return false;

    this.buildsById.delete(id);
    this.builds = this.builds.filter((candidate) => candidate.id !== id);
    return true;
  }

  /**
   * Replaces the configuration list for a placed item.
   */
  config(id: number, configs: readonly ConfigData[]): void {
    const build = this.buildsById.get(id);
    if (build) build.configs = [...configs];
  }

  /**
   * Gets a copy of a placed item by editing ID.
   */
  get(id: number): StructureBuild | undefined {
    const build = this.buildsById.get(id);
    return build ? cloneBuild(build) : undefined;
  }

  /**
   * Gets copies of all placed items.
   */
  getAll(): StructureBuild[] {
    return this.builds.map(cloneBuild);
  }

  /**
   * Counts placed items with a matching item ID.
   */
  count(item: number): number {
    return this.builds.filter((build) => build.item === item).length;
  }

  /**
   * Replaces every placed item with the result of a mapper function.
   */
  map(mapper: (build: StructureBuild) => StructureBuild): void {
    this.builds = this.builds.map((build) => mapper(cloneBuild(build)));
    this.rebuildBuildIndex();
  }

  /**
   * Compacts placed items into blueprint commands.
   */
  toBlueprint(buildOrder: BuildOrder = DEFAULT_BUILD_ORDER): Blueprint {
    const commands: BlueprintCommand[] = [];
    const stages = buildOrder.toStages();
    const traversalByItem = getBuildOrderTraversals(stages);

    for (const stage of stages) {
      const stageBuilds = this.getBuildsForStage(stage);
      if (stageBuilds.length === 0) continue;

      const sortedStageBuilds = sortByTraversal(
        stageBuilds,
        stage.direction,
        stage.axis ?? TraversalAxis.HORIZONTAL
      );
      if (
        !buildOrder.followTraversalStrictly &&
        buildOrder.preserveSourceOrder
      ) {
        for (const configRun of getConfigRuns(stageBuilds)) {
          addConfiguration(commands, configRun.configs);
          this.processBuildsInGroup(configRun.builds, buildOrder, traversalByItem, commands);
        }
        continue;
      }

      const configGroupSource =
        !buildOrder.followTraversalStrictly
          ? stageBuilds
          : sortedStageBuilds;

      for (const configGroup of getConfigGroups(configGroupSource)) {
        addConfiguration(commands, configGroup.configs);
        this.processBuildsInGroup(configGroup.builds, buildOrder, traversalByItem, commands);
      }
    }

    return { version: 0, width: this.width, height: this.height, commands };
  }

  private processBuildsInGroup(
    builds: StructureBuild[],
    buildOrder: BuildOrder,
    traversalByItem: ReadonlyMap<number, BuildTraversal>,
    commands: BlueprintCommand[]
  ): void {
    if (buildOrder.followTraversalStrictly) {
      for (const chain of createStrictChains(builds)) addBuildCommand(commands, chain);
      return;
    }

    const first = builds[0];
    if (!first) return;
    const traversal = traversalByItem.get(first.item) ?? DEFAULT_TRAVERSAL;
    const sortedBuilds = sortByTraversal(builds, traversal.direction, traversal.axis);
    for (const chain of createDeferralChains(sortedBuilds, traversal.axis)) {
      addBuildCommand(commands, chain);
    }
  }

  private getBuildsForStage(stage: BuildOrderStage): StructureBuild[] {
    const stageItems = new Set(stage.items);
    if (stageItems.size === 0) return [];
    return this.builds.filter((build) => stageItems.has(build.item));
  }

  private addBuild(build: StructureBuild): void {
    if (this.buildsById.has(build.id)) {
      throw new ShipShapeError("INVALID_BLUEPRINT", `Duplicate build id: ${build.id}`);
    }

    this.builds.push(build);
    this.buildsById.set(build.id, build);
  }

  private rebuildBuildIndex(): void {
    this.buildsById.clear();
    for (const build of this.builds) {
      if (this.buildsById.has(build.id)) {
        throw new ShipShapeError("INVALID_BLUEPRINT", `Duplicate build id: ${build.id}`);
      }
      this.buildsById.set(build.id, build);
    }
  }

  private nextId(): number {
    this.serialId += 1;
    return this.serialId;
  }
}

function addConfiguration(commands: BlueprintCommand[], configs: readonly ConfigData[]): void {
  if (commands.length === 0 && configs.length === 0) return;
  commands.push({ type: "configuration", configs: [...configs] });
}

function addBuildCommand(commands: BlueprintCommand[], groupedChain: GroupedBuildChain): void {
  commands.push({
    type: "build",
    x: groupedChain.chain.baseX,
    y: groupedChain.chain.y,
    item: groupedChain.group.item,
    bits: groupedChain.chain.bits,
    shape: groupedChain.group.shape
  });
}

function getConfigGroups(builds: StructureBuild[]): ConfigRun[] {
  const groups = new Map<string, ConfigRun>();
  for (const build of builds) {
    const key = configKey(build.configs);
    const existing = groups.get(key);
    if (existing) existing.builds.push(build);
    else groups.set(key, { configs: normalizeConfigs(build.configs), builds: [build] });
  }
  return [...groups.values()].sort((a, b) =>
    Number(a.configs.length > 0) - Number(b.configs.length > 0)
  );
}

function getConfigRuns(builds: StructureBuild[]): ConfigRun[] {
  const runs: ConfigRun[] = [];
  let currentRun: StructureBuild[] = [];
  let currentConfig: ConfigData[] | undefined;

  for (const build of builds) {
    if (!currentConfig || !configsEqual(currentConfig, build.configs)) {
      if (currentRun.length > 0 && currentConfig) {
        runs.push({ configs: currentConfig, builds: currentRun });
      }
      currentConfig = normalizeConfigs(build.configs);
      currentRun = [];
    }
    currentRun.push(build);
  }

  if (currentRun.length > 0 && currentConfig) {
    runs.push({ configs: currentConfig, builds: currentRun });
  }

  return runs;
}

function createStrictChains(builds: StructureBuild[]): GroupedBuildChain[] {
  const chains: GroupedBuildChain[] = [];
  let currentChain: StructureBuild[] = [];

  for (const build of builds) {
    if (!canAppendPreservingCommandOrder(currentChain, build)) {
      chains.push(createGroupedChain(currentChain));
      currentChain = [];
    }
    currentChain.push(build);
  }

  if (currentChain.length > 0) chains.push(createGroupedChain(currentChain));
  return chains;
}

function createDeferralChains(builds: StructureBuild[], axis: TraversalAxis): GroupedBuildChain[] {
  if (axis === TraversalAxis.VERTICAL) return createStrictChains(builds);

  const chains: GroupedBuildChain[] = [];
  const remaining = [...builds];

  while (remaining.length > 0) {
    const currentChain = [remaining.shift()!];
    for (let i = 0; i < remaining.length; ) {
      const build = remaining[i]!;
      if (canAppendPreservingCommandOrder(currentChain, build)) {
        currentChain.push(build);
        remaining.splice(i, 1);
      } else {
        i += 1;
      }
    }
    chains.push(createGroupedChain(currentChain));
  }

  return chains;
}

function canAppendPreservingCommandOrder(currentChain: StructureBuild[], build: StructureBuild): boolean {
  if (currentChain.length === 0) return true;
  const baseX = Math.min(...currentChain.map((chainBuild) => chainBuild.x));
  return build.x >= baseX && canAppend(currentChain, build);
}

function canAppend(currentChain: StructureBuild[], build: StructureBuild): boolean {
  const first = currentChain[0];
  if (!first) return true;
  if (first.y !== build.y) return false;
  if (first.item !== build.item || first.shape !== build.shape) return false;

  const xValues = [...currentChain.map((chainBuild) => chainBuild.x), build.x];
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  return (
    maxX - minX < 64 &&
    xValues.every((x) => isValidBitOffset(x - minX))
  );
}

function createGroupedChain(builds: StructureBuild[]): GroupedBuildChain {
  const first = builds[0];
  if (!first) {
    throw new ShipShapeError("INVALID_BLUEPRINT", "Cannot create an empty build chain");
  }

  return {
    group: { item: first.item, shape: first.shape },
    chain: createChain(builds)
  };
}

function createChain(builds: StructureBuild[]): BuildChain {
  const first = builds[0];
  if (!first) {
    throw new ShipShapeError("INVALID_BLUEPRINT", "Cannot create an empty build chain");
  }

  const baseX = Math.min(...builds.map((build) => build.x));
  let bits = 0n;
  for (const build of builds) {
    bits |= 1n << BigInt(Math.round(build.x - baseX));
  }
  return { baseX, y: first.y, bits };
}

const DEFAULT_TRAVERSAL: BuildTraversal = {
  direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
  axis: TraversalAxis.HORIZONTAL
};

function getBuildOrderTraversals(stages: readonly BuildOrderStage[]): ReadonlyMap<number, BuildTraversal> {
  const traversals = new Map<number, BuildTraversal>();
  for (const stage of stages) {
    const traversal = {
      direction: stage.direction,
      axis: stage.axis ?? TraversalAxis.HORIZONTAL
    };
    for (const itemId of stage.items) {
      if (!traversals.has(itemId)) traversals.set(itemId, traversal);
    }
  }
  return traversals;
}

function sortByTraversal(
  builds: StructureBuild[],
  direction: TraversalDirection,
  axis: TraversalAxis
): StructureBuild[] {
  const sorted = [...builds];
  sorted.sort((a, b) => compareBuilds(a, b, direction, axis));
  return sorted;
}

function compareBuilds(
  a: StructureBuild,
  b: StructureBuild,
  direction: TraversalDirection,
  axis: TraversalAxis
): number {
  if (axis === TraversalAxis.VERTICAL) {
    return compareBuildsVertically(a, b, direction);
  }

  switch (direction) {
    case TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT:
      return compareNumber(b.y, a.y) || compareNumber(a.x, b.x);
    case TraversalDirection.BOTTOM_RIGHT_TO_TOP_LEFT:
      return compareNumber(a.y, b.y) || compareNumber(b.x, a.x);
    case TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT:
      return compareNumber(a.y, b.y) || compareNumber(a.x, b.x);
    case TraversalDirection.TOP_RIGHT_TO_BOTTOM_LEFT:
      return compareNumber(b.y, a.y) || compareNumber(b.x, a.x);
    case TraversalDirection.NONE:
      return 0;
  }
}

function compareBuildsVertically(a: StructureBuild, b: StructureBuild, direction: TraversalDirection): number {
  switch (direction) {
    case TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT:
      return compareNumber(a.x, b.x) || compareNumber(b.y, a.y);
    case TraversalDirection.BOTTOM_RIGHT_TO_TOP_LEFT:
      return compareNumber(b.x, a.x) || compareNumber(a.y, b.y);
    case TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT:
      return compareNumber(a.x, b.x) || compareNumber(a.y, b.y);
    case TraversalDirection.TOP_RIGHT_TO_BOTTOM_LEFT:
      return compareNumber(b.x, a.x) || compareNumber(b.y, a.y);
    case TraversalDirection.NONE:
      return 0;
  }
}

function compareNumber(a: number, b: number): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isValidBitOffset(offset: number): boolean {
  return offset >= 0 && offset < 64 && Math.abs(offset - Math.round(offset)) < 0.000001;
}

function cloneBuild(build: StructureBuild): StructureBuild {
  return {
    ...build,
    configs: [...build.configs]
  };
}

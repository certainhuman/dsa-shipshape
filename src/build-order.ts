import { ItemIds } from "./constants";
import {
  BuildChainMode,
  TraversalAxis,
  TraversalDirection
} from "./enums";

export type StageItems = Record<number, readonly number[]>;
export type StageDirections = Partial<Record<number, TraversalDirection>>;

export interface BuildOrder {
  stages: StageItems;
  stageDirections: StageDirections;
  traversalAxis: TraversalAxis;
  buildChainMode: BuildChainMode;
  preserveSourceOrder: boolean;
  respectTraversalOrderForBuildChains?: boolean;
}

export interface BuildOrderOptions {
  stages?: StageItems;
  stageDirections?: StageDirections;
  traversalAxis?: TraversalAxis;
  buildChainMode?: BuildChainMode;
  preserveSourceOrder?: boolean;
  respectTraversalOrderForBuildChains?: boolean;
}

export const DEFAULT_STAGE_ITEMS: StageItems = {
  1: [
    ItemIds.IRON_BLOCK,
    ItemIds.HYPER_ICE_BLOCK,
    ItemIds.HYPER_RUBBER_BLOCK,
    ItemIds.WALKWAY,
    ItemIds.ITEM_NET,
    ItemIds.LOGISTICS_RAIL,
    ItemIds.LADDER
  ],
  2: [
    ItemIds.TURRET_CONTROLLER_PACKAGED,
    ItemIds.THRUSTER_PACKAGED,
    ItemIds.THRUSTER_STARTER_PACKAGED,
    ItemIds.CANNON_PACKAGED,
    ItemIds.STARTER_CANNON_PACKAGED,
    ItemIds.BURST_CANNON_PACKAGED,
    ItemIds.MACHINE_CANNON_PACKAGED,
    ItemIds.OBTUSE_CANNON_PACKAGED,
    ItemIds.ACUTE_CANNON_PACKAGED,
    ItemIds.FABRICATOR_ENGINEERING_PACKAGED,
    ItemIds.FABRICATOR_EQUIPMENT_PACKAGED,
    ItemIds.FABRICATOR_MUNITIONS_PACKAGED,
    ItemIds.FABRICATOR_STARTER_PACKAGED,
    ItemIds.FABRICATOR_LEGACY_PACKAGED,
    ItemIds.HELM_PACKAGED,
    ItemIds.HELM_STARTER_PACKAGED,
    ItemIds.COMMS_STATION_PACKAGED,
    ItemIds.RECYCLER_PACKAGED,
    ItemIds.SHIELD_PROJECTOR,
    ItemIds.FLUID_TANK,
    ItemIds.MUNITIONS_SUPPLY_UNIT_PACKAGED
  ],
  3: [
    ItemIds.LOADER_PACKAGED,
    ItemIds.PUSHER_PACKAGED,
    ItemIds.SHIELD_GENERATOR,
    ItemIds.CARGO_EJECTOR_PACKAGED,
    ItemIds.NAVIGATION_UNIT_STARTER_PACKAGED
  ],
  4: [ItemIds.EXPANDO_BOX_PACKAGED],
  5: [ItemIds.CARGO_HATCH_PACKAGED, ItemIds.CARGO_HATCH_STARTER_PACKAGED]
};

export const DEFAULT_STAGE_DIRECTIONS: StageDirections = {
  4: TraversalDirection.NONE
};

/**
 * Creates a build order used by `Structure.toBlueprint()`.
 */
export function createBuildOrder(options: BuildOrderOptions = {}): BuildOrder {
  const buildChainMode = resolveBuildChainMode(options);
  const order: BuildOrder = {
    stages: cloneStages(options.stages ?? DEFAULT_STAGE_ITEMS),
    stageDirections: { ...DEFAULT_STAGE_DIRECTIONS, ...(options.stageDirections ?? {}) },
    traversalAxis: options.traversalAxis ?? TraversalAxis.HORIZONTAL,
    buildChainMode,
    preserveSourceOrder: options.preserveSourceOrder ?? false
  };

  if (options.respectTraversalOrderForBuildChains !== undefined) {
    order.respectTraversalOrderForBuildChains = options.respectTraversalOrderForBuildChains;
  }

  return order;
}

export const DEFAULT_BUILD_ORDER = createBuildOrder();

/**
 * Returns a copy of a build order with the given item IDs removed from all stages.
 */
export function withoutItems(order: BuildOrder, ...itemIds: number[]): BuildOrder {
  const remove = new Set(itemIds);
  const stages: StageItems = Object.fromEntries(
    Object.entries(order.stages).map(([stage, items]) => [
      stage,
      items.filter((itemId) => !remove.has(itemId))
    ])
  );
  return createBuildOrder({ ...order, stages, stageDirections: order.stageDirections });
}

/**
 * Returns a copy of a build order with item IDs added to a stage.
 */
export function withItems(order: BuildOrder, stage: number, ...itemIds: number[]): BuildOrder {
  const stages = cloneStages(order.stages);
  stages[stage] = [...(stages[stage] ?? []), ...itemIds];

  const stageDirections = { ...order.stageDirections };
  if (!stageDirections[stage]) {
    stageDirections[stage] = TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
  }

  return createBuildOrder({ ...order, stages, stageDirections });
}

/**
 * Returns a copy of a build order with a traversal direction assigned to a stage.
 */
export function withStageDirection(
  order: BuildOrder,
  stage: number,
  direction: TraversalDirection
): BuildOrder {
  return createBuildOrder({
    ...order,
    stageDirections: { ...order.stageDirections, [stage]: direction }
  });
}

/**
 * Gets the item IDs assigned to a build stage.
 */
export function getItemsInStage(order: BuildOrder, stage: number): readonly number[] {
  return order.stages[stage] ?? [];
}

/**
 * Gets the stage number for an item ID, or `-1` when the item is not staged.
 */
export function getBuildStageOfItem(order: BuildOrder, itemId: number): number {
  for (const stage of Object.keys(order.stages).map(Number)) {
    if ((order.stages[stage] ?? []).includes(itemId)) return stage;
  }
  return -1;
}

/**
 * Gets the traversal direction for a stage.
 */
export function getStageDirection(order: BuildOrder, stage: number): TraversalDirection {
  return order.stageDirections[stage] ?? TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
}

/**
 * Gets the highest stage number in a build order.
 */
export function numStages(order: BuildOrder): number {
  const stages = Object.keys(order.stages).map(Number);
  return stages.length === 0 ? 0 : Math.max(...stages);
}

function resolveBuildChainMode(options: BuildOrderOptions): BuildChainMode {
  if (options.respectTraversalOrderForBuildChains !== undefined) {
    return options.respectTraversalOrderForBuildChains
      ? BuildChainMode.STRICT_TRAVERSAL
      : BuildChainMode.ALLOW_DEFERRAL;
  }
  return options.buildChainMode ?? BuildChainMode.ALLOW_DEFERRAL;
}

function cloneStages(stages: StageItems): StageItems {
  return Object.fromEntries(
    Object.entries(stages).map(([stage, items]) => [stage, [...items]])
  );
}

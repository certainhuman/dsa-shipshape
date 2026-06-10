import { BuildableIds, RCD_COMPATIBLE_ITEM_IDS } from "./constants";
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
    BuildableIds.IRON_BLOCK,
    BuildableIds.ICE_BLOCK,
    BuildableIds.RUBBER_BLOCK,
    BuildableIds.WALKWAY,
    BuildableIds.ITEM_NET,
    BuildableIds.LOGISTICS_RAIL,
    BuildableIds.LADDER
  ],
  2: [
    BuildableIds.TURRET_CONTROLLER,
    BuildableIds.THRUSTER,
    BuildableIds.STARTER_THRUSTER,
    BuildableIds.CANNON,
    BuildableIds.STARTER_CANNON,
    BuildableIds.BURST_CANNON,
    BuildableIds.MACHINE_CANNON,
    BuildableIds.OBTUSE_CANNON,
    BuildableIds.ACUTE_CANNON,
    BuildableIds.ENGINEERING_FAB,
    BuildableIds.EQUIPMENT_FAB,
    BuildableIds.MUNITIONS_FAB,
    BuildableIds.STARTER_FAB,
    BuildableIds.LEGACY_FAB,
    BuildableIds.HELM,
    BuildableIds.STARTER_HELM,
    BuildableIds.COMMS_STATION,
    BuildableIds.RECYCLER,
    BuildableIds.PROJECTOR,
    BuildableIds.TANK,
    BuildableIds.MUNITION_SUPPLY_UNIT
  ],
  3: [
    BuildableIds.LOADER,
    BuildableIds.PUSHER,
    BuildableIds.GENERATOR,
    BuildableIds.CARGO_EJECTOR,
    BuildableIds.NAV_UNIT
  ],
  4: [BuildableIds.EXPANDO_BOX],
  5: [BuildableIds.CARGO_HATCH, BuildableIds.STARTER_CARGO_HATCH]
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
 * Returns a copy of a build order with compatible item IDs added to a stage.
 */
export function withItems(order: BuildOrder, stage: number, ...itemIds: number[]): BuildOrder {
  const stages = cloneStages(order.stages);
  const compatible = itemIds.filter((itemId) =>
    (RCD_COMPATIBLE_ITEM_IDS as readonly number[]).includes(itemId)
  );
  stages[stage] = [...(stages[stage] ?? []), ...compatible];

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
      : BuildChainMode.DEFAULT_ENCODER;
  }
  return options.buildChainMode ?? BuildChainMode.DEFAULT_ENCODER;
}

function cloneStages(stages: StageItems): StageItems {
  return Object.fromEntries(
    Object.entries(stages).map(([stage, items]) => [stage, [...items]])
  );
}

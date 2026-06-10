import { Item } from "./constants";
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
    Item.IRON_BLOCK,
    Item.HYPER_ICE_BLOCK,
    Item.HYPER_RUBBER_BLOCK,
    Item.WALKWAY,
    Item.ITEM_NET,
    Item.LOGISTICS_RAIL,
    Item.LADDER
  ],
  2: [
    Item.TURRET_CONTROLLER_PACKAGED,
    Item.THRUSTER_PACKAGED,
    Item.THRUSTER_STARTER_PACKAGED,
    Item.CANNON_PACKAGED,
    Item.STARTER_CANNON_PACKAGED,
    Item.BURST_CANNON_PACKAGED,
    Item.MACHINE_CANNON_PACKAGED,
    Item.OBTUSE_CANNON_PACKAGED,
    Item.ACUTE_CANNON_PACKAGED,
    Item.FABRICATOR_ENGINEERING_PACKAGED,
    Item.FABRICATOR_EQUIPMENT_PACKAGED,
    Item.FABRICATOR_MUNITIONS_PACKAGED,
    Item.FABRICATOR_STARTER_PACKAGED,
    Item.FABRICATOR_LEGACY_PACKAGED,
    Item.HELM_PACKAGED,
    Item.HELM_STARTER_PACKAGED,
    Item.COMMS_STATION_PACKAGED,
    Item.RECYCLER_PACKAGED,
    Item.SHIELD_PROJECTOR,
    Item.FLUID_TANK,
    Item.MUNITIONS_SUPPLY_UNIT_PACKAGED
  ],
  3: [
    Item.LOADER_PACKAGED,
    Item.PUSHER_PACKAGED,
    Item.SHIELD_GENERATOR,
    Item.CARGO_EJECTOR_PACKAGED,
    Item.NAVIGATION_UNIT_STARTER_PACKAGED
  ],
  4: [Item.EXPANDO_BOX_PACKAGED],
  5: [Item.CARGO_HATCH_PACKAGED, Item.CARGO_HATCH_STARTER_PACKAGED]
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
export function withoutItems(order: BuildOrder, ...Item: number[]): BuildOrder {
  const remove = new Set(Item);
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
export function withItems(order: BuildOrder, stage: number, ...Item: number[]): BuildOrder {
  const stages = cloneStages(order.stages);
  stages[stage] = [...(stages[stage] ?? []), ...Item];

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

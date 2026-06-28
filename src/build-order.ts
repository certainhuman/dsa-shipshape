import { Item } from "./constants";
import {
  TraversalAxis,
  TraversalDirection
} from "./enums";

export type StageItems = Record<number, readonly number[]>;
export type StageDirections = Partial<Record<number, TraversalDirection>>;
export type StageAxes = Partial<Record<number, TraversalAxis>>;

export interface BuildOrderOptions {
  stages?: StageItems;
  stageDirections?: StageDirections;
  stageAxes?: StageAxes;
  traversalAxis?: TraversalAxis;
  preserveSourceOrder?: boolean;
  followTraversalStrictly?: boolean;
}

export interface BuildOrderStage {
  readonly items: readonly number[];
  readonly direction: TraversalDirection;
  readonly axis?: TraversalAxis;
}

export interface BuildOrder {
  readonly preserveSourceOrder: boolean;
  readonly followTraversalStrictly: boolean;

  toStages(): readonly BuildOrderStage[];
}

export interface FlatBuildOrderOptions {
  direction?: TraversalDirection;
  axis?: TraversalAxis;
  preserveSourceOrder?: boolean;
  followTraversalStrictly?: boolean;
}

export interface SequentialBuildOrderOptions {
  direction?: TraversalDirection;
  stageDirections?: StageDirections;
  axis?: TraversalAxis;
  stageAxes?: StageAxes;
  preserveSourceOrder?: boolean;
  followTraversalStrictly?: boolean;
}

export const DEFAULT_STAGE_ITEMS: StageItems = {
  1: [
    Item.IRON_BLOCK,
    Item.ANNIHILATOR_TILE,
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
    Item.MUNITIONS_SUPPLY_UNIT_PACKAGED,
    Item.LOADER_PACKAGED,
    Item.PUSHER_PACKAGED,
    Item.SHIELD_GENERATOR,
    Item.CARGO_EJECTOR_PACKAGED,
    Item.NAVIGATION_UNIT_STARTER_PACKAGED
  ],
  3: [Item.EXPANDO_BOX_PACKAGED],
  4: [Item.CARGO_HATCH_PACKAGED, Item.CARGO_HATCH_STARTER_PACKAGED]
};

export const DEFAULT_STAGE_DIRECTIONS: StageDirections = {
  3: TraversalDirection.NONE
};

/**
 * Multi-stage build order with independent item sets and traversal directions per stage.
 */
export class StagedBuildOrder implements BuildOrder {
  static readonly DEFAULT = new StagedBuildOrder({
    stages: DEFAULT_STAGE_ITEMS,
    stageDirections: DEFAULT_STAGE_DIRECTIONS
  });

  public readonly stages: StageItems;
  public readonly stageDirections: StageDirections;
  public readonly stageAxes: StageAxes;
  public readonly traversalAxis: TraversalAxis;
  public readonly preserveSourceOrder: boolean;
  public readonly followTraversalStrictly: boolean;

  constructor(options: BuildOrderOptions = {}) {
    this.stages = cloneStages(options.stages ?? {});
    this.stageDirections = {
      ...(options.stageDirections ?? {})
    };
    this.stageAxes = {
      ...(options.stageAxes ?? {})
    };
    this.traversalAxis = options.traversalAxis ?? TraversalAxis.HORIZONTAL;
    this.preserveSourceOrder = options.preserveSourceOrder ?? false;
    this.followTraversalStrictly = options.followTraversalStrictly ?? false;
  }

  /**
   * Returns a copy with the given item IDs removed from every stage.
   */
  without(...itemIds: number[]): StagedBuildOrder {
    const remove = new Set(itemIds);
    const stages: StageItems = Object.fromEntries(
      Object.entries(this.stages).map(([stage, items]) => [
        stage,
        items.filter((itemId) => !remove.has(itemId))
      ])
    );
    return new StagedBuildOrder({ ...this.toOptions(), stages });
  }

  /**
   * Returns a copy with item IDs moved to the end of a stage, or added when not already staged.
   */
  with(stage: number, ...itemIds: number[]): StagedBuildOrder {
    const move = new Set(itemIds);
    const stages: StageItems = Object.fromEntries(
      Object.entries(this.stages).map(([stageKey, items]) => [
        stageKey,
        items.filter((itemId) => !move.has(itemId))
      ])
    );
    stages[stage] = unique([...(stages[stage] ?? []), ...itemIds]);

    const stageDirections = { ...this.stageDirections };
    if (!stageDirections[stage]) {
      stageDirections[stage] = TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    }

    return new StagedBuildOrder({ ...this.toOptions(), stages, stageDirections });
  }

  /**
   * Returns a copy with item IDs moved to a first stage, or added when not already staged.
   */
  first(...itemIds: number[]): StagedBuildOrder {
    if (itemIds.length === 0) return this;

    const stages = removeFromStages(this.stages, itemIds);
    const minStage = lowestStage(stages);
    const stage = minStage === undefined
      ? 1
      : (stages[minStage] ?? []).length === 0
        ? minStage
        : minStage - 1;
    const stageDirections = { ...this.stageDirections };
    if (!stageDirections[stage]) {
      stageDirections[stage] = TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    }

    return new StagedBuildOrder({
      ...this.toOptions(),
      stages: { ...stages, [stage]: unique([...(stages[stage] ?? []), ...itemIds]) },
      stageDirections
    });
  }

  /**
   * Returns a copy with item IDs moved to a last stage, or added when not already staged.
   */
  last(...itemIds: number[]): StagedBuildOrder {
    if (itemIds.length === 0) return this;

    const stages = removeFromStages(this.stages, itemIds);
    const maxStage = highestStage(stages);
    const stage = maxStage === undefined
      ? 1
      : (stages[maxStage] ?? []).length === 0
        ? maxStage
        : maxStage + 1;
    const stageDirections = { ...this.stageDirections };
    if (!stageDirections[stage]) {
      stageDirections[stage] = TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    }

    return new StagedBuildOrder({
      ...this.toOptions(),
      stages: { ...stages, [stage]: unique([...(stages[stage] ?? []), ...itemIds]) },
      stageDirections
    });
  }

  /**
   * Returns a copy with a traversal direction assigned globally or to a stage.
   */
  direction(direction: TraversalDirection): StagedBuildOrder;
  direction(stage: number, direction: TraversalDirection): StagedBuildOrder;
  direction(stageOrDirection: number | TraversalDirection, direction?: TraversalDirection): StagedBuildOrder {
    if (direction === undefined) {
      const stageDirections: StageDirections = {};
      for (const stage of stageNumbers(this.stages)) {
        stageDirections[stage] = stageOrDirection as TraversalDirection;
      }

      return new StagedBuildOrder({
        ...this.toOptions(),
        stageDirections
      });
    }

    return new StagedBuildOrder({
      ...this.toOptions(),
      stageDirections: { ...this.stageDirections, [stageOrDirection as number]: direction }
    });
  }

  /**
   * Returns a copy with a traversal axis assigned globally or to a stage.
   */
  axis(axis: TraversalAxis): StagedBuildOrder;
  axis(stage: number, axis: TraversalAxis): StagedBuildOrder;
  axis(stageOrAxis: number | TraversalAxis, axis?: TraversalAxis): StagedBuildOrder {
    if (axis === undefined) {
      return new StagedBuildOrder({
        ...this.toOptions(),
        traversalAxis: stageOrAxis as TraversalAxis
      });
    }

    return new StagedBuildOrder({
      ...this.toOptions(),
      stageAxes: { ...this.stageAxes, [stageOrAxis as number]: axis }
    });
  }

  /**
   * Returns a copy with strict traversal following enabled or disabled.
   */
  strict(value = true): StagedBuildOrder {
    return new StagedBuildOrder({
      ...this.toOptions(),
      followTraversalStrictly: value
    });
  }

  /**
   * Gets the item IDs assigned to a build stage.
   */
  items(stage: number): readonly number[] {
    return this.stages[stage] ?? [];
  }

  /**
   * Gets the stage number for an item ID, or `-1` when the item is not staged.
   */
  stageOf(itemId: number): number {
    for (const stage of Object.keys(this.stages).map(Number)) {
      if ((this.stages[stage] ?? []).includes(itemId)) return stage;
    }
    return -1;
  }

  /**
   * Gets the traversal direction for a stage.
   */
  directionOf(stage: number): TraversalDirection {
    return this.stageDirections[stage] ?? TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
  }

  /**
   * Gets the traversal axis for a stage.
   */
  axisOf(stage: number): TraversalAxis {
    return this.stageAxes[stage] ?? this.traversalAxis;
  }

  /**
   * Gets the highest numeric stage key, or `0` when there are no stages.
   */
  numStages(): number {
    const stages = Object.keys(this.stages).map(Number);
    return stages.length === 0 ? 0 : Math.max(...stages);
  }

  toStages(): readonly BuildOrderStage[] {
    return stageNumbers(this.stages).map((stage) => ({
      items: this.items(stage),
      direction: this.directionOf(stage),
      axis: this.axisOf(stage)
    }));
  }

  private toOptions(): BuildOrderOptions {
    const options: BuildOrderOptions = {
      stages: this.stages,
      stageDirections: this.stageDirections,
      stageAxes: this.stageAxes,
      traversalAxis: this.traversalAxis,
      preserveSourceOrder: this.preserveSourceOrder,
      followTraversalStrictly: this.followTraversalStrictly
    };

    return options;
  }
}

/**
 * Single-stage build order where all configured items are built together.
 */
export class FlatBuildOrder implements BuildOrder {
  static readonly DEFAULT = new FlatBuildOrder(defaultBuildItems());

  public readonly itemIds: readonly number[];
  public readonly traversalDirection: TraversalDirection;
  public readonly traversalAxis: TraversalAxis;
  public readonly preserveSourceOrder: boolean;
  public readonly followTraversalStrictly: boolean;

  constructor(itemIds: readonly number[] = [], options: FlatBuildOrderOptions = {}) {
    this.itemIds = unique(itemIds);
    this.traversalDirection = options.direction ?? TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    this.traversalAxis = options.axis ?? TraversalAxis.HORIZONTAL;
    this.preserveSourceOrder = options.preserveSourceOrder ?? false;
    this.followTraversalStrictly = options.followTraversalStrictly ?? false;
  }

  /**
   * Returns a copy with item IDs appended to the single stage.
   */
  with(...itemIds: number[]): FlatBuildOrder {
    return new FlatBuildOrder([...this.itemIds, ...itemIds], this.toOptions());
  }

  /**
   * Returns a copy with the given item IDs removed from the single stage.
   */
  without(...itemIds: number[]): FlatBuildOrder {
    const remove = new Set(itemIds);
    return new FlatBuildOrder(
      this.itemIds.filter((itemId) => !remove.has(itemId)),
      this.toOptions()
    );
  }

  /**
   * Returns a copy with a traversal direction assigned to the single stage.
   */
  direction(direction: TraversalDirection): FlatBuildOrder {
    return new FlatBuildOrder(this.itemIds, { ...this.toOptions(), direction });
  }

  /**
   * Returns a copy with a traversal axis assigned to the single stage.
   */
  axis(axis: TraversalAxis): FlatBuildOrder {
    return new FlatBuildOrder(this.itemIds, { ...this.toOptions(), axis });
  }

  /**
   * Returns a copy with strict traversal following enabled or disabled.
   */
  strict(value = true): FlatBuildOrder {
    return new FlatBuildOrder(this.itemIds, {
      ...this.toOptions(),
      followTraversalStrictly: value
    });
  }

  toStages(): readonly BuildOrderStage[] {
    if (this.itemIds.length === 0) return [];
    return [{
      items: this.itemIds,
      direction: this.traversalDirection,
      axis: this.traversalAxis
    }];
  }

  private toOptions(): FlatBuildOrderOptions {
    const options: FlatBuildOrderOptions = {
      direction: this.traversalDirection,
      axis: this.traversalAxis,
      preserveSourceOrder: this.preserveSourceOrder,
      followTraversalStrictly: this.followTraversalStrictly
    };

    return options;
  }
}

/**
 * Build order where each configured item is built in its own stage.
 */
export class SequentialBuildOrder implements BuildOrder {
  static readonly DEFAULT = new SequentialBuildOrder(defaultBuildItems());

  public readonly itemIds: readonly number[];
  public readonly stageDirections: StageDirections;
  public readonly stageAxes: StageAxes;
  public readonly traversalDirection: TraversalDirection;
  public readonly traversalAxis: TraversalAxis;
  public readonly preserveSourceOrder: boolean;
  public readonly followTraversalStrictly: boolean;

  constructor(
    itemIds: readonly number[] = [],
    options: SequentialBuildOrderOptions = {}
  ) {
    this.itemIds = unique(itemIds);
    this.stageDirections = { ...(options.stageDirections ?? {}) };
    this.stageAxes = { ...(options.stageAxes ?? {}) };
    this.traversalDirection = options.direction ?? TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    this.traversalAxis = options.axis ?? TraversalAxis.HORIZONTAL;
    this.preserveSourceOrder = options.preserveSourceOrder ?? false;
    this.followTraversalStrictly = options.followTraversalStrictly ?? false;
  }

  /**
   * Returns a copy with item IDs appended to the sequence.
   */
  append(...itemIds: number[]): SequentialBuildOrder {
    return this.insert(this.itemIds.length, ...itemIds);
  }

  /**
   * Returns a copy with item IDs prepended to the sequence.
   */
  prepend(...itemIds: number[]): SequentialBuildOrder {
    return this.insert(0, ...itemIds);
  }

  /**
   * Returns a copy with the given item IDs removed from the sequence.
   */
  without(...itemIds: number[]): SequentialBuildOrder {
    const remove = new Set(itemIds);
    const sequence = this.itemIds.filter((itemId) => !remove.has(itemId));
    return new SequentialBuildOrder(sequence, {
      ...this.toOptions(),
      stageDirections: remapStageValues(this.stageDirections, this.itemIds, sequence),
      stageAxes: remapStageValues(this.stageAxes, this.itemIds, sequence)
    });
  }

  /**
   * Returns a copy with item IDs inserted at an index in the sequence.
   */
  insert(index: number, ...itemIds: number[]): SequentialBuildOrder {
    const insert = unique(itemIds);
    const insertSet = new Set(insert);
    const sequence = this.itemIds.filter((itemId) => !insertSet.has(itemId));
    const boundedIndex = Math.max(0, Math.min(Math.round(index), sequence.length));
    const nextSequence = [
      ...sequence.slice(0, boundedIndex),
      ...insert,
      ...sequence.slice(boundedIndex)
    ];

    return new SequentialBuildOrder(nextSequence, {
      ...this.toOptions(),
      stageDirections: remapStageValues(this.stageDirections, this.itemIds, nextSequence),
      stageAxes: remapStageValues(this.stageAxes, this.itemIds, nextSequence)
    });
  }

  /**
   * Returns a copy with item IDs inserted before an existing item, or appended if the anchor is not present.
   */
  before(anchorItemId: number, ...itemIds: number[]): SequentialBuildOrder {
    const index = this.itemIds.filter((itemId) => !itemIds.includes(itemId)).indexOf(anchorItemId);
    return this.insert(index === -1 ? this.itemIds.length : index, ...itemIds);
  }

  /**
   * Returns a copy with item IDs inserted after an existing item, or appended if the anchor is not present.
   */
  after(anchorItemId: number, ...itemIds: number[]): SequentialBuildOrder {
    const index = this.itemIds.filter((itemId) => !itemIds.includes(itemId)).indexOf(anchorItemId);
    return this.insert(index === -1 ? this.itemIds.length : index + 1, ...itemIds);
  }

  /**
   * Returns a copy with a traversal direction assigned globally or to one or more items.
   */
  direction(direction: TraversalDirection, ...itemIds: number[]): SequentialBuildOrder {
    if (itemIds.length === 0) {
      return new SequentialBuildOrder(this.itemIds, {
        ...this.toOptions(),
        direction
      });
    }

    const stageDirections = { ...this.stageDirections };
    for (const itemId of itemIds) {
      const index = this.itemIds.indexOf(itemId);
      if (index !== -1) stageDirections[index + 1] = direction;
    }

    return new SequentialBuildOrder(this.itemIds, {
      ...this.toOptions(),
      stageDirections
    });
  }

  /**
   * Returns a copy with a traversal axis assigned globally or to one or more items.
   */
  axis(axis: TraversalAxis, ...itemIds: number[]): SequentialBuildOrder {
    if (itemIds.length === 0) {
      return new SequentialBuildOrder(this.itemIds, {
        ...this.toOptions(),
        axis
      });
    }

    const stageAxes = { ...this.stageAxes };
    for (const itemId of itemIds) {
      const index = this.itemIds.indexOf(itemId);
      if (index !== -1) stageAxes[index + 1] = axis;
    }

    return new SequentialBuildOrder(this.itemIds, {
      ...this.toOptions(),
      stageAxes
    });
  }

  /**
   * Returns a copy with strict traversal following enabled or disabled.
   */
  strict(value = true): SequentialBuildOrder {
    return new SequentialBuildOrder(this.itemIds, {
      ...this.toOptions(),
      followTraversalStrictly: value
    });
  }

  toStages(): readonly BuildOrderStage[] {
    return this.itemIds.map((itemId, index) => ({
      items: [itemId],
      direction: this.stageDirections[index + 1] ?? this.traversalDirection,
      axis: this.stageAxes[index + 1] ?? this.traversalAxis
    }));
  }

  private toOptions(): SequentialBuildOrderOptions {
    const options: SequentialBuildOrderOptions = {
      direction: this.traversalDirection,
      stageDirections: this.stageDirections,
      axis: this.traversalAxis,
      stageAxes: this.stageAxes,
      preserveSourceOrder: this.preserveSourceOrder,
      followTraversalStrictly: this.followTraversalStrictly
    };

    return options;
  }
}

export const BuildOrder = {
  GAME_DEFAULT: StagedBuildOrder.DEFAULT,
  Staged: StagedBuildOrder,
  Flat: FlatBuildOrder,
  Sequential: SequentialBuildOrder
} as const;

export const DEFAULT_BUILD_ORDER = BuildOrder.GAME_DEFAULT;

function cloneStages(stages: StageItems): StageItems {
  return Object.fromEntries(
    Object.entries(stages).map(([stage, items]) => [stage, [...items]])
  );
}

function removeFromStages(stages: StageItems, itemIds: readonly number[]): StageItems {
  const remove = new Set(itemIds);
  return Object.fromEntries(
    Object.entries(stages).map(([stage, items]) => [
      stage,
      items.filter((itemId) => !remove.has(itemId))
    ])
  );
}

function stageNumbers(stages: StageItems): readonly number[] {
  return Object.keys(stages)
    .map(Number)
    .sort((a, b) => a - b);
}

function lowestStage(stages: StageItems): number | undefined {
  return stageNumbers(stages)[0];
}

function highestStage(stages: StageItems): number | undefined {
  const stagesByNumber = stageNumbers(stages);
  return stagesByNumber[stagesByNumber.length - 1];
}

function defaultBuildItems(): readonly number[] {
  return Object.keys(DEFAULT_STAGE_ITEMS)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((stage) => DEFAULT_STAGE_ITEMS[stage] ?? []);
}

function unique(itemIds: readonly number[]): readonly number[] {
  return [...new Set(itemIds)];
}

function remapStageValues<T>(
  stageValues: Partial<Record<number, T>>,
  itemIds: readonly number[],
  nextItemIds: readonly number[]
): Partial<Record<number, T>> {
  const nextValues: Partial<Record<number, T>> = {};

  for (const [index, itemId] of nextItemIds.entries()) {
    const oldStage = itemIds.indexOf(itemId) + 1;
    const value = stageValues[oldStage];
    if (value !== undefined) nextValues[index + 1] = value;
  }

  return nextValues;
}

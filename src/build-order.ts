import { Item } from "./constants";
import {
  BuildChainMode,
  TraversalAxis,
  TraversalDirection
} from "./enums";

export type StageItems = Record<number, readonly number[]>;
export type StageDirections = Partial<Record<number, TraversalDirection>>;

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
 * Build staging and traversal rules used by `Structure.toBlueprint()`.
 */
export class BuildOrder {
  public readonly stages: StageItems;
  public readonly stageDirections: StageDirections;
  public readonly traversalAxis: TraversalAxis;
  public readonly buildChainMode: BuildChainMode;
  public readonly preserveSourceOrder: boolean;
  public readonly respectTraversalOrderForBuildChains?: boolean;

  constructor(options: BuildOrderOptions = {}) {
    this.stages = cloneStages(options.stages ?? DEFAULT_STAGE_ITEMS);
    this.stageDirections = {
      ...DEFAULT_STAGE_DIRECTIONS,
      ...(options.stageDirections ?? {})
    };
    this.traversalAxis = options.traversalAxis ?? TraversalAxis.HORIZONTAL;
    this.buildChainMode = resolveBuildChainMode(options);
    this.preserveSourceOrder = options.preserveSourceOrder ?? false;

    if (options.respectTraversalOrderForBuildChains !== undefined) {
      this.respectTraversalOrderForBuildChains = options.respectTraversalOrderForBuildChains;
    }
  }

  static create(options: BuildOrderOptions = {}): BuildOrder {
    return new BuildOrder(options);
  }

  /**
   * Returns a copy with the given item IDs removed from every stage.
   */
  without(...itemIds: number[]): BuildOrder {
    const remove = new Set(itemIds);
    const stages: StageItems = Object.fromEntries(
      Object.entries(this.stages).map(([stage, items]) => [
        stage,
        items.filter((itemId) => !remove.has(itemId))
      ])
    );
    return new BuildOrder({ ...this.toOptions(), stages });
  }

  /**
   * Returns a copy with item IDs appended to a stage.
   */
  with(stage: number, ...itemIds: number[]): BuildOrder {
    const stages = cloneStages(this.stages);
    stages[stage] = [...(stages[stage] ?? []), ...itemIds];

    const stageDirections = { ...this.stageDirections };
    if (!stageDirections[stage]) {
      stageDirections[stage] = TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT;
    }

    return new BuildOrder({ ...this.toOptions(), stages, stageDirections });
  }

  /**
   * Returns a copy with a traversal direction assigned to a stage.
   */
  direction(stage: number, direction: TraversalDirection): BuildOrder {
    return new BuildOrder({
      ...this.toOptions(),
      stageDirections: { ...this.stageDirections, [stage]: direction }
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
   * Gets the highest stage number in the build order.
   */
  numStages(): number {
    const stages = Object.keys(this.stages).map(Number);
    return stages.length === 0 ? 0 : Math.max(...stages);
  }

  private toOptions(): BuildOrderOptions {
    const options: BuildOrderOptions = {
      stages: this.stages,
      stageDirections: this.stageDirections,
      traversalAxis: this.traversalAxis,
      buildChainMode: this.buildChainMode,
      preserveSourceOrder: this.preserveSourceOrder
    };

    if (this.respectTraversalOrderForBuildChains !== undefined) {
      options.respectTraversalOrderForBuildChains = this.respectTraversalOrderForBuildChains;
    }

    return options;
  }
}

export const DEFAULT_BUILD_ORDER = new BuildOrder();

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

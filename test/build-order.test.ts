import { describe, expect, it } from "vitest";
import {
  BuildOrder,
  Item,
  Structure,
  TraversalAxis,
  TraversalDirection,
  type BuildOrder as BuildOrderContract
} from "../src";

describe("BuildOrder", () => {
  it("customizes staged orders with immutable stage-aware methods", () => {
    const baseOrder = BuildOrder.GAME_DEFAULT;
    const order = baseOrder
      .without(Item.EXPANDO_BOX_PACKAGED)
      .with(5, Item.EXPANDO_BOX_PACKAGED)
      .direction(5, TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);

    expect(baseOrder.items(4)).toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(baseOrder.directionOf(5)).toBe(TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT);

    expect(order.items(4)).not.toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(order.items(5)).toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(order.stageOf(Item.EXPANDO_BOX_PACKAGED)).toBe(5);
    expect(order.directionOf(5)).toBe(TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);
    expect(order.numStages()).toBe(5);
  });

  it("moves staged items instead of duplicating them across stages", () => {
    const order = BuildOrder.GAME_DEFAULT.with(5, Item.IRON_BLOCK);

    expect(order.items(1)).not.toContain(Item.IRON_BLOCK);
    expect(order.items(5)).toContain(Item.IRON_BLOCK);
    expect(order.stageOf(Item.IRON_BLOCK)).toBe(5);
  });

  it("moves staged items to the first stage", () => {
    const order = BuildOrder.GAME_DEFAULT
      .direction(1, TraversalDirection.NONE)
      .first(Item.CARGO_HATCH_PACKAGED);

    expect(order.items(0)).toEqual([Item.CARGO_HATCH_PACKAGED]);
    expect(order.items(1)).toContain(Item.IRON_BLOCK);
    expect(order.items(5)).not.toContain(Item.CARGO_HATCH_PACKAGED);
    expect(order.stageOf(Item.CARGO_HATCH_PACKAGED)).toBe(0);
    expect(order.directionOf(1)).toBe(TraversalDirection.NONE);
  });

  it("moves staged items to the last stage", () => {
    const order = BuildOrder.GAME_DEFAULT.last(Item.IRON_BLOCK, Item.LOADER_PACKAGED);

    expect(order.items(1)).not.toContain(Item.IRON_BLOCK);
    expect(order.items(2)).not.toContain(Item.LOADER_PACKAGED);
    expect(order.items(6)).toEqual([Item.IRON_BLOCK, Item.LOADER_PACKAGED]);
    expect(order.stageOf(Item.IRON_BLOCK)).toBe(6);
    expect(order.stageOf(Item.LOADER_PACKAGED)).toBe(6);
  });

  it("orders staged builds by numeric stage key", () => {
    const order = new BuildOrder.Staged({
      stages: {
        10: [Item.CARGO_HATCH_PACKAGED],
        [-10]: [Item.IRON_BLOCK],
        0: [Item.WALKWAY]
      },
      stageDirections: {
        [-10]: TraversalDirection.NONE,
        10: TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT
      }
    });

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.WALKWAY],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.CARGO_HATCH_PACKAGED],
        direction: TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT,
        axis: TraversalAxis.HORIZONTAL
      }
    ]);
  });

  it("adds first and last staged items without shifting existing stage keys", () => {
    const order = new BuildOrder.Staged({
      stages: {
        [-2]: [Item.IRON_BLOCK],
        3: [Item.WALKWAY]
      },
      stageDirections: {
        [-2]: TraversalDirection.NONE,
        3: TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT
      }
    })
      .first(Item.CARGO_HATCH_PACKAGED)
      .last(Item.LOADER_PACKAGED);

    expect(order.items(-3)).toEqual([Item.CARGO_HATCH_PACKAGED]);
    expect(order.items(-2)).toEqual([Item.IRON_BLOCK]);
    expect(order.items(3)).toEqual([Item.WALKWAY]);
    expect(order.items(4)).toEqual([Item.LOADER_PACKAGED]);
    expect(order.directionOf(-2)).toBe(TraversalDirection.NONE);
    expect(order.directionOf(3)).toBe(TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);
  });

  it("sets every staged direction when no stage is provided", () => {
    const order = BuildOrder.GAME_DEFAULT.direction(TraversalDirection.NONE);

    expect(order.directionOf(1)).toBe(TraversalDirection.NONE);
    expect(order.directionOf(2)).toBe(TraversalDirection.NONE);
    expect(order.directionOf(5)).toBe(TraversalDirection.NONE);
  });

  it("customizes staged traversal axes globally and per stage", () => {
    const order = BuildOrder.GAME_DEFAULT
      .axis(TraversalAxis.VERTICAL)
      .axis(4, TraversalAxis.HORIZONTAL);

    expect(order.axisOf(1)).toBe(TraversalAxis.VERTICAL);
    expect(order.axisOf(4)).toBe(TraversalAxis.HORIZONTAL);
    expect(order.toStages()[0]).toMatchObject({
      axis: TraversalAxis.VERTICAL
    });
  });

  it("keeps staged factory construction equivalent to direct construction", () => {
    const order = new BuildOrder.Staged({ followTraversalStrictly: true });

    expect(order.followTraversalStrictly).toBe(true);
  });

  it("creates empty build orders from no-argument constructors", () => {
    expect(new BuildOrder.Staged().toStages()).toEqual([]);
    expect(new BuildOrder.Flat().toStages()).toEqual([]);
    expect(new BuildOrder.Sequential().toStages()).toEqual([]);
  });

  it("customizes strict traversal with immutable methods", () => {
    const stagedOrder = BuildOrder.GAME_DEFAULT.strict();
    const flatOrder = new BuildOrder.Flat([Item.IRON_BLOCK]).strict();
    const sequentialOrder = new BuildOrder.Sequential([Item.IRON_BLOCK]).strict().strict(false);

    expect(stagedOrder.followTraversalStrictly).toBe(true);
    expect(flatOrder.followTraversalStrictly).toBe(true);
    expect(sequentialOrder.followTraversalStrictly).toBe(false);
  });

  it("creates flat orders with stage-less customization methods", () => {
    const order = new BuildOrder.Flat([Item.IRON_BLOCK, Item.WALKWAY])
      .with(Item.LOADER_PACKAGED, Item.IRON_BLOCK)
      .without(Item.WALKWAY)
      .direction(TraversalDirection.NONE);

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK, Item.LOADER_PACKAGED],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      }
    ]);
  });

  it("customizes flat traversal axis", () => {
    const order = new BuildOrder.Flat([Item.IRON_BLOCK])
      .axis(TraversalAxis.VERTICAL);

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.VERTICAL
      }
    ]);
  });

  it("does not expose staged lookup helpers on flat orders", () => {
    const order = new BuildOrder.Flat([Item.IRON_BLOCK]);

    expect("items" in order).toBe(false);
    expect("stageOf" in order).toBe(false);
    expect("directionOf" in order).toBe(false);
    expect("numStages" in order).toBe(false);
  });

  it("creates sequential orders with one item per stage", () => {
    const order = new BuildOrder.Sequential([
      Item.IRON_BLOCK,
      Item.WALKWAY,
      Item.CARGO_HATCH_PACKAGED
    ])
      .direction(TraversalDirection.NONE, Item.WALKWAY, Item.CARGO_HATCH_PACKAGED)
      .insert(2, Item.WALKWAY);

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.CARGO_HATCH_PACKAGED],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.WALKWAY],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      }
    ]);
  });

  it("sets a global sequential direction when no item ids are provided", () => {
    const order = new BuildOrder.Sequential([
      Item.IRON_BLOCK,
      Item.WALKWAY
    ]).direction(TraversalDirection.NONE);

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.WALKWAY],
        direction: TraversalDirection.NONE,
        axis: TraversalAxis.HORIZONTAL
      }
    ]);
  });

  it("customizes sequential traversal axes globally and per item", () => {
    const order = new BuildOrder.Sequential([
      Item.IRON_BLOCK,
      Item.WALKWAY,
      Item.CARGO_HATCH_PACKAGED
    ])
      .axis(TraversalAxis.VERTICAL)
      .axis(TraversalAxis.HORIZONTAL, Item.WALKWAY);

    expect(order.toStages()).toEqual([
      {
        items: [Item.IRON_BLOCK],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.VERTICAL
      },
      {
        items: [Item.WALKWAY],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.HORIZONTAL
      },
      {
        items: [Item.CARGO_HATCH_PACKAGED],
        direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        axis: TraversalAxis.VERTICAL
      }
    ]);
  });

  it("prepends and appends sequential order items", () => {
    const order = new BuildOrder.Sequential([Item.WALKWAY])
      .prepend(Item.IRON_BLOCK)
      .append(Item.CARGO_HATCH_PACKAGED);

    expect(order.toStages().map((stage) => stage.items[0])).toEqual([
      Item.IRON_BLOCK,
      Item.WALKWAY,
      Item.CARGO_HATCH_PACKAGED
    ]);
  });

  it("inserts sequential order items before and after anchors", () => {
    const order = new BuildOrder.Sequential([Item.IRON_BLOCK, Item.CARGO_HATCH_PACKAGED])
      .before(Item.CARGO_HATCH_PACKAGED, Item.WALKWAY)
      .after(Item.CARGO_HATCH_PACKAGED, Item.LOADER_PACKAGED);

    expect(order.toStages().map((stage) => stage.items[0])).toEqual([
      Item.IRON_BLOCK,
      Item.WALKWAY,
      Item.CARGO_HATCH_PACKAGED,
      Item.LOADER_PACKAGED
    ]);
  });

  it("does not expose staged lookup helpers on sequential orders", () => {
    const order = new BuildOrder.Sequential([Item.IRON_BLOCK]);

    expect("items" in order).toBe(false);
    expect("stageOf" in order).toBe(false);
    expect("directionOf" in order).toBe(false);
    expect("numStages" in order).toBe(false);
  });

  it("exposes constructors and defaults under BuildOrder", () => {
    expect(BuildOrder.GAME_DEFAULT).toBe(BuildOrder.Staged.DEFAULT);
    expect(BuildOrder.GAME_DEFAULT).toBeInstanceOf(BuildOrder.Staged);
    expect(BuildOrder.Staged.DEFAULT).toBeInstanceOf(BuildOrder.Staged);
    expect(BuildOrder.Flat.DEFAULT).toBeInstanceOf(BuildOrder.Flat);
    expect(BuildOrder.Sequential.DEFAULT).toBeInstanceOf(BuildOrder.Sequential);
    expect(new BuildOrder.Staged()).toBeInstanceOf(BuildOrder.Staged);
    expect(new BuildOrder.Flat([Item.IRON_BLOCK])).toBeInstanceOf(BuildOrder.Flat);
    expect(new BuildOrder.Sequential([Item.IRON_BLOCK])).toBeInstanceOf(BuildOrder.Sequential);
  });

  it("accepts plain objects that implement the BuildOrder interface", () => {
    const order: BuildOrderContract = {
      preserveSourceOrder: false,
      followTraversalStrictly: false,
      toStages: () => [
        {
          items: [Item.CARGO_HATCH_PACKAGED],
          direction: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT
        }
      ]
    };
    const structure = new Structure(10, 10);
    structure.place(Item.CARGO_HATCH_PACKAGED, 2, 2);

    expect(structure.toBlueprint(order).commands).toContainEqual({
      type: "build",
      x: 2,
      y: 2,
      item: Item.CARGO_HATCH_PACKAGED,
      bits: 1n,
      shape: 0
    });
  });
});

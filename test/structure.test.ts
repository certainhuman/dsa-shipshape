import { describe, expect, it } from "vitest";
import {
  BuildOrder,
  Item,
  FilterType,
  PusherAction,
  Structure,
  TraversalAxis,
  TraversalDirection,
  pusherConfig,
  type BuildCommand
} from "../src";

describe("Structure", () => {
  it("chains compatible builds within a configuration group", () => {
    const structure = new Structure(50, 16);
    structure.place(Item.CARGO_HATCH_PACKAGED, 2, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.place(Item.CARGO_HATCH_PACKAGED, 3, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.place(Item.CARGO_HATCH_PACKAGED, 5, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });

    const blueprint = structure.toBlueprint();
    expect(blueprint.commands).toEqual([
      {
        type: "configuration",
        configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
      },
      {
        type: "build",
        x: 2,
        y: 2,
        item: Item.CARGO_HATCH_PACKAGED,
        bits: 0b1011n,
        shape: 0
      }
    ]);
  });

  it("can preserve strict traversal order for build chains", () => {
    const structure = new Structure(50, 16);
    structure.place(Item.CARGO_HATCH_PACKAGED, 2, 2);
    structure.place(Item.CARGO_HATCH_STARTER_PACKAGED, 3, 2);
    structure.place(Item.CARGO_HATCH_PACKAGED, 4, 2);

    const order = BuildOrder.GAME_DEFAULT.strict();
    const hatchCommands = structure
      .toBlueprint(order)
      .commands.filter((command): command is BuildCommand =>
        command.type === "build" && command.item === Item.CARGO_HATCH_PACKAGED
      );

    expect(hatchCommands).toHaveLength(2);
    expect(hatchCommands[0]).toMatchObject({
      x: 2,
      y: 2,
      bits: 1n
    });
  });

  it("keeps compatible source rows chained when deferral is allowed", () => {
    const structure = new Structure(50, 16);
    structure.place(Item.LOADER_PACKAGED, 19, 9);
    structure.place(Item.LOADER_PACKAGED, 21, 9);
    structure.place(Item.LOADER_PACKAGED, 23, 9);
    structure.place(Item.LOADER_PACKAGED, 25, 9);
    structure.place(Item.LOADER_PACKAGED, 27, 9);

    const loaderCommand = structure
      .toBlueprint()
      .commands.find((command) => command.type === "build" && command.item === Item.LOADER_PACKAGED);

    expect(loaderCommand).toMatchObject({
      x: 19,
      y: 9,
      bits: 0b101010101n
    });
  });

  it("groups default configs with no config first", () => {
    const structure = new Structure(10, 10);
    structure.place(Item.PUSHER_PACKAGED, 4, 2, {
      configs: [pusherConfig({ defaultAction: PusherAction.PUSH })]
    });
    structure.place(Item.PUSHER_PACKAGED, 1, 2);
    structure.place(Item.PUSHER_PACKAGED, 2, 2, {
      configs: [pusherConfig()]
    });

    const blueprint = structure.toBlueprint(new BuildOrder.Flat([Item.PUSHER_PACKAGED]));

    expect(blueprint.commands).toEqual([
      {
        type: "build",
        x: 1,
        y: 2,
        item: Item.PUSHER_PACKAGED,
        bits: 0b11n,
        shape: 0
      },
      {
        type: "configuration",
        configs: [pusherConfig({ defaultAction: PusherAction.PUSH })]
      },
      {
        type: "build",
        x: 4,
        y: 2,
        item: Item.PUSHER_PACKAGED,
        bits: 1n,
        shape: 0
      }
    ]);
  });

  it("can traverse builds vertically by column", () => {
    const structure = new Structure(10, 10);
    structure.place(Item.CARGO_HATCH_PACKAGED, 2, 1);
    structure.place(Item.CARGO_HATCH_PACKAGED, 1, 2);
    structure.place(Item.CARGO_HATCH_PACKAGED, 2, 3);

    const order = new BuildOrder.Flat([Item.CARGO_HATCH_PACKAGED])
      .direction(TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT)
      .axis(TraversalAxis.VERTICAL)
      .strict();
    const hatchCommands = structure
      .toBlueprint(order)
      .commands.filter((command): command is BuildCommand =>
        command.type === "build" && command.item === Item.CARGO_HATCH_PACKAGED
      );

    expect(hatchCommands.map((command) => [command.x, command.y])).toEqual([
      [1, 2],
      [2, 3],
      [2, 1]
    ]);
  });

  it("does not defer vertical traversal into row chains", () => {
    const structure = new Structure(10, 10);
    for (const x of [1, 2, 3]) {
      for (const y of [1, 2, 3]) {
        structure.place(Item.IRON_BLOCK, x, y);
      }
    }

    const order = new BuildOrder.Flat([Item.IRON_BLOCK])
      .direction(TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT)
      .axis(TraversalAxis.VERTICAL);
    const ironCommands = structure
      .toBlueprint(order)
      .commands.filter((command): command is BuildCommand =>
        command.type === "build" && command.item === Item.IRON_BLOCK
      );

    expect(ironCommands.map((command) => [command.x, command.y])).toEqual([
      [1, 3],
      [1, 2],
      [1, 1],
      [2, 3],
      [2, 2],
      [2, 1],
      [3, 3],
      [3, 2],
      [3, 1]
    ]);
    expect(ironCommands.map((command) => command.bits)).toEqual([
      1n,
      1n,
      1n,
      1n,
      1n,
      1n,
      1n,
      1n,
      1n
    ]);
  });

  it("chains vertical traversal row builds only when chain order matches traversal order", () => {
    const structure = new Structure(10, 10);
    structure.place(Item.IRON_BLOCK, 1, 2);
    structure.place(Item.IRON_BLOCK, 2, 2);
    structure.place(Item.IRON_BLOCK, 3, 2);

    const leftToRight = new BuildOrder.Flat([Item.IRON_BLOCK])
      .direction(TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT)
      .axis(TraversalAxis.VERTICAL);
    const leftToRightCommands = structure
      .toBlueprint(leftToRight)
      .commands.filter((command): command is BuildCommand =>
        command.type === "build" && command.item === Item.IRON_BLOCK
      );

    expect(leftToRightCommands).toEqual([
      {
        type: "build",
        x: 1,
        y: 2,
        item: Item.IRON_BLOCK,
        bits: 0b111n,
        shape: 0
      }
    ]);

    const rightToLeft = new BuildOrder.Flat([Item.IRON_BLOCK])
      .direction(TraversalDirection.TOP_RIGHT_TO_BOTTOM_LEFT)
      .axis(TraversalAxis.VERTICAL);
    const rightToLeftCommands = structure
      .toBlueprint(rightToLeft)
      .commands.filter((command): command is BuildCommand =>
        command.type === "build" && command.item === Item.IRON_BLOCK
      );

    expect(rightToLeftCommands.map((command) => [command.x, command.y, command.bits])).toEqual([
      [3, 2, 1n],
      [2, 2, 1n],
      [1, 2, 1n]
    ]);
  });

  it("traverses mixed-item staged builds across rows, columns, and stages", () => {
    const structure = new Structure(10, 10);
    structure.place(Item.LOADER_PACKAGED, 4, 5);
    structure.place(Item.IRON_BLOCK, 2, 2);
    structure.place(Item.WALKWAY, 3, 3);
    structure.place(Item.LOADER_PACKAGED, 1, 5);
    structure.place(Item.WALKWAY, 1, 1);
    structure.place(Item.IRON_BLOCK, 2, 3);
    structure.place(Item.LOADER_PACKAGED, 2, 5);

    const order = new BuildOrder.Staged({
      stages: {
        1: [Item.IRON_BLOCK, Item.WALKWAY],
        2: [Item.LOADER_PACKAGED]
      },
      stageDirections: {
        1: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT,
        2: TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT
      },
      stageAxes: {
        1: TraversalAxis.VERTICAL
      }
    }).strict();
    const buildCommands = structure
      .toBlueprint(order)
      .commands.filter((command): command is BuildCommand => command.type === "build");

    expect(buildCommands.map((command) => [command.item, command.x, command.y, command.bits])).toEqual([
      [Item.WALKWAY, 1, 1, 1n],
      [Item.IRON_BLOCK, 2, 3, 1n],
      [Item.IRON_BLOCK, 2, 2, 1n],
      [Item.WALKWAY, 3, 3, 1n],
      [Item.LOADER_PACKAGED, 1, 5, 0b1011n]
    ]);
  });
  it("sanitizes shape data from structure tiles", () => {
    const structure = new Structure(10, 10);
    const iron = structure.place(Item.IRON_BLOCK, 1, 1, { shape: 2 });
    const loader = structure.place(Item.LOADER_PACKAGED, 2, 1, { shape: 3 });
    const ladder = structure.place(Item.LADDER, 3, 1, { shape: 4 });

    structure.sanitize();

    expect(structure.get(iron)?.shape).toBe(2);
    expect(structure.get(loader)?.shape).toBe(0);
    expect(structure.get(ladder)?.shape).toBe(0);

    structure.map((build) => ({ ...build, shape: build.id + 1 }));
    structure.sanitize({ onlyStrictlyUnsupportedShapes: true });

    expect(structure.get(iron)?.shape).toBe(iron + 1);
    expect(structure.get(loader)?.shape).toBe(loader + 1);
    expect(structure.get(ladder)?.shape).toBe(0);
  });
});

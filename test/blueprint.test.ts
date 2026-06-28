import { describe, expect, it } from "vitest";
import {
  Item,
  FilterType,
  Blueprint,
  filterConfig
} from "../src";

describe("blueprint encoding", () => {
  it("roundtrips decoded blueprint data", () => {
    const blueprint = Blueprint.create(10, 10, [
      {
        type: "configuration",
        configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
      },
      {
        type: "build",
        x: 2,
        y: 3,
        item: Item.CARGO_HATCH_PACKAGED,
        bits: 0b101n,
        shape: 0
      }
    ]);

    expect(Blueprint.decode(Blueprint.encode(blueprint))).toEqual(blueprint);
  });

  it("builds blueprint commands sequentially", () => {
    const blueprint = Blueprint.builder(10, 10)
      .config([filterConfig(FilterType.ALLOW_FILTER_ONLY)])
      .place(2, 3, Item.CARGO_HATCH_PACKAGED, [4], 0)
      .toBlueprint();

    expect(blueprint).toEqual({
      version: 0,
      width: 10,
      height: 10,
      commands: [
        {
          type: "configuration",
          configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
        },
        {
          type: "build",
          x: 2,
          y: 3,
          item: Item.CARGO_HATCH_PACKAGED,
          bits: 0b101n,
          shape: 0
        }
      ]
    });
  });

  it("copies commands added to the blueprint builder", () => {
    const command = {
      type: "configuration" as const,
      configs: [filterConfig(FilterType.ALLOW_FILTER_ONLY)]
    };

    const builder = Blueprint.builder(10, 10).command(command);
    command.configs.length = 0;

    expect(builder.toBlueprint().commands).toEqual([
      {
        type: "configuration",
        configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
      }
    ]);
  });
  it("sanitizes shape data from blueprint commands", () => {
    const build = (item: number, shape: number) => ({
      type: "build" as const,
      x: 1,
      y: 1,
      item,
      bits: 1n,
      shape
    });
    const blueprint = Blueprint.create(10, 10, [
      build(Item.IRON_BLOCK, 2),
      build(Item.LOADER_PACKAGED, 3),
      build(Item.LADDER, 4)
    ]);

    expect(Blueprint.sanitize(blueprint).commands.map((command) => command.type === "build" && command.shape)).toEqual([
      2,
      0,
      0
    ]);
    expect(Blueprint.sanitize(blueprint, { onlyStrictlyUnsupportedShapes: true }).commands).toMatchObject([
      { shape: 2 },
      { shape: 3 },
      { shape: 0 }
    ]);
    expect(blueprint.commands).toMatchObject([{ shape: 2 }, { shape: 3 }, { shape: 4 }]);
  });
});

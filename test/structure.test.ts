import { describe, expect, it } from "vitest";
import {
  ItemIds,
  createBuildOrder,
  FilterType,
  Structure
} from "../src";

describe("Structure", () => {
  it("chains compatible builds within a configuration group", () => {
    const structure = new Structure(50, 16);
    structure.place(ItemIds.CARGO_HATCH_PACKAGED, 2, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.place(ItemIds.CARGO_HATCH_PACKAGED, 3, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.place(ItemIds.CARGO_HATCH_PACKAGED, 5, 2, {
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
        item: ItemIds.CARGO_HATCH_PACKAGED,
        bits: 0b1011n,
        shape: 0
      }
    ]);
  });

  it("can preserve strict traversal order for build chains", () => {
    const structure = new Structure(50, 16);
    structure.place(ItemIds.CARGO_HATCH_PACKAGED, 2, 2);
    structure.place(ItemIds.CARGO_HATCH_STARTER_PACKAGED, 3, 2);
    structure.place(ItemIds.CARGO_HATCH_PACKAGED, 4, 2);

    const order = createBuildOrder({ respectTraversalOrderForBuildChains: true });
    const hatchCommands = structure
      .toBlueprint(order)
      .commands.filter((command) => command.type === "build" && command.item === ItemIds.CARGO_HATCH_PACKAGED);

    expect(hatchCommands).toHaveLength(2);
    expect(hatchCommands[0]).toMatchObject({
      x: 2,
      y: 2,
      bits: 1n
    });
  });

  it("keeps compatible source rows chained when deferral is allowed", () => {
    const structure = new Structure(50, 16);
    structure.place(ItemIds.LOADER_PACKAGED, 19, 9);
    structure.place(ItemIds.LOADER_PACKAGED, 21, 9);
    structure.place(ItemIds.LOADER_PACKAGED, 23, 9);
    structure.place(ItemIds.LOADER_PACKAGED, 25, 9);
    structure.place(ItemIds.LOADER_PACKAGED, 27, 9);

    const loaderCommand = structure
      .toBlueprint()
      .commands.find((command) => command.type === "build" && command.item === ItemIds.LOADER_PACKAGED);

    expect(loaderCommand).toMatchObject({
      x: 19,
      y: 9,
      bits: 0b101010101n
    });
  });
});

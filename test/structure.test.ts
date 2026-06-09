import { describe, expect, it } from "vitest";
import {
  BuildableIds,
  createBuildOrder,
  FilterType,
  Structure
} from "../src";

describe("Structure", () => {
  it("chains compatible builds within a configuration group", () => {
    const structure = new Structure(50, 16);
    structure.placeItem(BuildableIds.CARGO_HATCH, 2, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.placeItem(BuildableIds.CARGO_HATCH, 3, 2, {
      configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
    });
    structure.placeItem(BuildableIds.CARGO_HATCH, 5, 2, {
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
        item: BuildableIds.CARGO_HATCH,
        bits: 0b1011n,
        shape: 0
      }
    ]);
  });

  it("can preserve strict traversal order for build chains", () => {
    const structure = new Structure(50, 16);
    structure.placeItem(BuildableIds.CARGO_HATCH, 2, 2);
    structure.placeItem(BuildableIds.STARTER_CARGO_HATCH, 3, 2);
    structure.placeItem(BuildableIds.CARGO_HATCH, 4, 2);

    const order = createBuildOrder({ respectTraversalOrderForBuildChains: true });
    const hatchCommands = structure
      .toBlueprint(order)
      .commands.filter((command) => command.type === "build" && command.item === BuildableIds.CARGO_HATCH);

    expect(hatchCommands).toHaveLength(2);
    expect(hatchCommands[0]).toMatchObject({
      x: 2,
      y: 2,
      bits: 1n
    });
  });

  it("keeps compatible source rows chained in default encoder mode", () => {
    const structure = new Structure(50, 16);
    structure.placeItem(BuildableIds.LOADER, 19, 9);
    structure.placeItem(BuildableIds.LOADER, 21, 9);
    structure.placeItem(BuildableIds.LOADER, 23, 9);
    structure.placeItem(BuildableIds.LOADER, 25, 9);
    structure.placeItem(BuildableIds.LOADER, 27, 9);

    const loaderCommand = structure
      .toBlueprint()
      .commands.find((command) => command.type === "build" && command.item === BuildableIds.LOADER);

    expect(loaderCommand).toMatchObject({
      x: 19,
      y: 9,
      bits: 0b101010101n
    });
  });
});

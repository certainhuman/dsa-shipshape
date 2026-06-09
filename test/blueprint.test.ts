import { describe, expect, it } from "vitest";
import {
  BuildableIds,
  decodeBlueprint,
  encodeBlueprint,
  FilterType,
  createBlueprint
} from "../src";

describe("blueprint encoding", () => {
  it("roundtrips decoded blueprint data", () => {
    const blueprint = createBlueprint(10, 10, [
      {
        type: "configuration",
        configs: [{ type: "filter_config", filterType: FilterType.ALLOW_FILTER_ONLY }]
      },
      {
        type: "build",
        x: 2,
        y: 3,
        item: BuildableIds.CARGO_HATCH,
        bits: 0b101n,
        shape: 0
      }
    ]);

    expect(decodeBlueprint(encodeBlueprint(blueprint))).toEqual(blueprint);
  });
});

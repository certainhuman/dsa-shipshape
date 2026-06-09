import { describe, expect, it } from "vitest";
import {
  AdjacentPosition,
  FilterType,
  NavDestinationIds,
  Priority,
  filterConfig,
  filterItemsConfig,
  loaderConfig,
  navDestinationId,
  navDestinationName,
  navUnitConfig
} from "../src";

describe("public helpers", () => {
  it("creates plain config objects with defaults", () => {
    expect(loaderConfig({
      pickPosition: AdjacentPosition.TOP_LEFT,
      placePosition: AdjacentPosition.BOTTOM_RIGHT
    })).toEqual({
      type: "config_loader",
      pickPosition: AdjacentPosition.TOP_LEFT,
      placePosition: AdjacentPosition.BOTTOM_RIGHT,
      priority: Priority.NORMAL,
      maxStack: 16,
      cycleTime: 20,
      requireOutputInventory: false,
      waitForStackLimit: false
    });

    expect(filterConfig(FilterType.ALLOW_FILTER_ONLY)).toEqual({
      type: "filter_config",
      filterType: FilterType.ALLOW_FILTER_ONLY
    });

    expect(filterItemsConfig(123)).toEqual({
      type: "filter_items",
      items: [123, 0, 0]
    });
  });

  it("maps known nav destination ids and names", () => {
    expect(navUnitConfig({ destinationIndex: NavDestinationIds.HUMMINGBIRD })).toMatchObject({
      type: "config_nav_unit",
      destinationIndex: 10,
      warpActive: true
    });
    expect(navDestinationName(10)).toBe("HUMMINGBIRD");
    expect(navDestinationId("FALCON")).toBe(50);
    expect(navDestinationName(999)).toBeUndefined();
  });
});

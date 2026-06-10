import { describe, expect, it } from "vitest";
import {
  AdjacentPosition,
  FilterType,
  NavDestinationIds,
  Priority,
  ItemIds,
  ITEM_IDS,
  createBuildCommand,
  filterConfig,
  filterItemsConfig,
  loaderConfig,
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

    expect(filterItemsConfig(ItemIds.IRON)).toEqual({
      type: "filter_items",
      items: [ItemIds.IRON, 0, 0]
    });
  });

  it("exposes all known item ids from the item schema", () => {
    expect(ItemIds.IRON).toBe(1);
    expect(ItemIds.CARGO_HATCH_PACKAGED).toBe(221);
    expect(ItemIds.BETA_SLUG_AMMO).toBe(405);
    expect(ITEM_IDS).toHaveLength(141);
  });

  it("exposes known nav destination ids", () => {
    expect(navUnitConfig({ destinationIndex: NavDestinationIds.HUMMINGBIRD })).toMatchObject({
      type: "config_nav_unit",
      destinationIndex: 10,
      warpActive: false
    });
    expect(NavDestinationIds.FALCON).toBe(50);
  });

  it("creates build commands from a starting x and additional x positions", () => {
    expect(createBuildCommand(4, 3, ItemIds.IRON_BLOCK, [5, 6])).toEqual({
      type: "build",
      x: 4,
      y: 3,
      item: ItemIds.IRON_BLOCK,
      bits: 0b111n,
      shape: 0
    });
  });
});

# Recipes

These examples cover the common ways to use `dsa-shipshape`.

## Decode a Blueprint

```ts
import { decodeBlueprint } from "dsa-shipshape";

// `code` may be raw base64 or include the `DSA:` prefix.
const blueprint = decodeBlueprint(code);

console.log(blueprint.width, blueprint.height);
console.log(blueprint.commands.length);
```

## Encode With the `DSA:` Prefix

```ts
import { encodeBlueprint } from "dsa-shipshape";

// Include the prefix when you want a complete shareable DSA string.
const code = encodeBlueprint(blueprint, { prefix: true });
```

## Create a Blueprint From Scratch

```ts
import {
  ItemIds,
  Structure,
  encodeBlueprint
} from "dsa-shipshape";

const ship = new Structure(16, 10);

// Place individual items at x/y blueprint coordinates.
ship.placeItem(ItemIds.IRON_BLOCK, 2, 2);
ship.placeItem(ItemIds.IRON_BLOCK, 3, 2);
ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 4, 2);

// Convert placements into blueprint commands, then encode them.
const code = encodeBlueprint(ship.toBlueprint(), { prefix: true });
```

## Add a Row of Blocks

```ts
import {
  ItemIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(30, 12);

// Add iron blocks from x = 2 through x = 12 on row y = 5.
for (let x = 2; x <= 12; x += 1) {
  ship.placeItem(ItemIds.IRON_BLOCK, x, 5);
}
```

## Place a Shaped Block

```ts
import {
  BlockShape,
  ItemIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(ItemIds.IRON_BLOCK, 8, 5, {
  // Use named shape IDs instead of hard-coding numbers.
  shape: BlockShape.Half.Top
});
```

## Configure a Loader

```ts
import {
  AdjacentPosition,
  ItemIds,
  Priority,
  Structure,
  loaderConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(ItemIds.LOADER_PACKAGED, 6, 4, {
  // Configs apply to the placed loader.
  configs: [
    loaderConfig({
      pickPosition: AdjacentPosition.LEFT_MIDDLE,
      placePosition: AdjacentPosition.RIGHT_MIDDLE,
      priority: Priority.NORMAL,
      maxStack: 16,
      cycleTime: 20
    })
  ]
});
```

## Configure a Filtered Item

```ts
import {
  ItemIds,
  FilterType,
  Structure,
  filterConfig,
  filterItemsConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 8, 4, {
  configs: [
    // Allow only the listed filter item.
    filterConfig(FilterType.ALLOW_FILTER_ONLY),
    filterItemsConfig(ItemIds.IRON_BLOCK)
  ]
});
```

## Configure a Nav Unit

```ts
import {
  ItemIds,
  NavDestinationIds,
  Structure,
  navUnitConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(ItemIds.NAVIGATION_UNIT_STARTER_PACKAGED, 10, 5, {
  configs: [
    navUnitConfig({
      // Destination constants avoid relying on raw overworld IDs.
      destinationIndex: NavDestinationIds.FALCON,
      warpActive: true
    })
  ]
});
```

## Remove Items

```ts
import {
  ItemIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);

// placeItem returns an editing ID that can be used later.
const id = ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 5, 5);
ship.removeItem(id);
```

## Transform Every Placement

```ts
import {
  ItemIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);
ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 5, 5);

// Return a complete build object. Spread keeps id, item, y, shape, configs, and priority.
ship.mapBuilds((build) => ({
  ...build,
  x: build.x + 1
}));
```

## Preserve Build Traversal More Strictly

```ts
import {
  BuildChainMode,
  ItemIds,
  Structure,
  createBuildOrder
} from "dsa-shipshape";

const ship = new Structure(20, 12);
ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 2, 2);
ship.placeItem(ItemIds.CARGO_HATCH_STARTER_PACKAGED, 3, 2);
ship.placeItem(ItemIds.CARGO_HATCH_PACKAGED, 4, 2);

const order = createBuildOrder({
  // Prefer traversal order over compacting compatible commands together.
  buildChainMode: BuildChainMode.STRICT_TRAVERSAL
});

const blueprint = ship.toBlueprint(order);
```

## Catch Blueprint Errors

```ts
import {
  DsaBpError,
  decodeBlueprint
} from "dsa-shipshape";

try {
  decodeBlueprint(code);
} catch (error) {
  // Known parse/validation failures use DsaBpError.
  if (error instanceof DsaBpError) {
    console.error(error.code);
  } else {
    throw error;
  }
}
```

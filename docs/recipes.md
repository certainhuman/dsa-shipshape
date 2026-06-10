# Recipes

These examples cover the common ways to use `dsa-shipshape`.

## Decode a Blueprint

```ts
import { Blueprint } from "dsa-shipshape";

// `code` may be raw base64 or include the `DSA:` prefix.
const blueprint = Blueprint.decode(code);

console.log(blueprint.width, blueprint.height);
console.log(blueprint.commands.length);
```

## Encode With the `DSA:` Prefix

```ts
import { Blueprint } from "dsa-shipshape";

// Include the prefix when you want a complete shareable DSA string.
const code = Blueprint.encode(blueprint, { prefix: true });
```

## Create a Blueprint From Scratch

```ts
import {
  ItemIds,
  Structure,
  Blueprint
} from "dsa-shipshape";

const ship = new Structure(16, 10);

// Place individual items at x/y blueprint coordinates.
ship.place(ItemIds.IRON_BLOCK, 2, 2);
ship.place(ItemIds.IRON_BLOCK, 3, 2);
ship.place(ItemIds.CARGO_HATCH_PACKAGED, 4, 2);

// Convert placements into blueprint commands, then encode them.
const code = Blueprint.encode(ship.toBlueprint(), { prefix: true });
```

## Build Raw Commands Sequentially

```ts
import {
  Blueprint,
  FilterType,
  ItemIds,
  filterConfig
} from "dsa-shipshape";

const blueprint = Blueprint.builder(20, 12)
  // Config commands apply to following build commands.
  .config([filterConfig(FilterType.ALLOW_FILTER_ONLY)])
  // Place cargo hatches at x = 4 and x = 6 on row y = 3.
  .place(4, 3, ItemIds.CARGO_HATCH_PACKAGED, [6])
  .toBlueprint();

const code = Blueprint.encode(blueprint, { prefix: true });
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
  ship.place(ItemIds.IRON_BLOCK, x, 5);
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

ship.place(ItemIds.IRON_BLOCK, 8, 5, {
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

ship.place(ItemIds.LOADER_PACKAGED, 6, 4, {
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

ship.place(ItemIds.CARGO_HATCH_PACKAGED, 8, 4, {
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

ship.place(ItemIds.NAVIGATION_UNIT_STARTER_PACKAGED, 10, 5, {
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

// place returns an editing ID that can be used later.
const id = ship.place(ItemIds.CARGO_HATCH_PACKAGED, 5, 5);
ship.remove(id);
```

## Transform Every Placement

```ts
import {
  ItemIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);
ship.place(ItemIds.CARGO_HATCH_PACKAGED, 5, 5);

// Return a complete build object. Spread keeps id, item, y, shape, configs, and priority.
ship.map((build) => ({
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
ship.place(ItemIds.CARGO_HATCH_PACKAGED, 2, 2);
ship.place(ItemIds.CARGO_HATCH_STARTER_PACKAGED, 3, 2);
ship.place(ItemIds.CARGO_HATCH_PACKAGED, 4, 2);

const order = createBuildOrder({
  // Prefer traversal order over compacting compatible commands together.
  buildChainMode: BuildChainMode.STRICT_TRAVERSAL
});

const blueprint = ship.toBlueprint(order);
```

## Catch Blueprint Errors

```ts
import {
  ShipShapeError,
  Blueprint
} from "dsa-shipshape";

try {
  Blueprint.decode(code);
} catch (error) {
  // Known parse/validation failures use ShipShapeError.
  if (error instanceof ShipShapeError) {
    console.error(error.code);
  } else {
    throw error;
  }
}
```

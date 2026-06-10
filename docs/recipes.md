# Recipes

These examples cover the common ways to use `dsa-shipshape`.

## Decode a Blueprint

```ts
import { decodeBlueprint } from "dsa-shipshape";

const blueprint = decodeBlueprint(code);

console.log(blueprint.width, blueprint.height);
console.log(blueprint.commands.length);
```

## Encode With the `DSA:` Prefix

```ts
import { encodeBlueprint } from "dsa-shipshape";

const code = encodeBlueprint(blueprint, { prefix: true });
```

## Create a Blueprint From Scratch

```ts
import {
  BuildableIds,
  Structure,
  encodeBlueprint
} from "dsa-shipshape";

const ship = new Structure(16, 10);

ship.placeItem(BuildableIds.IRON_BLOCK, 2, 2);
ship.placeItem(BuildableIds.IRON_BLOCK, 3, 2);
ship.placeItem(BuildableIds.CARGO_HATCH, 4, 2);

const code = encodeBlueprint(ship.toBlueprint(), { prefix: true });
```

## Add a Row of Blocks

```ts
import {
  BuildableIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(30, 12);

for (let x = 2; x <= 12; x += 1) {
  ship.placeItem(BuildableIds.IRON_BLOCK, x, 5);
}
```

## Place a Shaped Block

```ts
import {
  BlockShape,
  BuildableIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(BuildableIds.IRON_BLOCK, 8, 5, {
  shape: BlockShape.Half.Top
});
```

## Configure a Loader

```ts
import {
  AdjacentPosition,
  BuildableIds,
  Priority,
  Structure,
  loaderConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(BuildableIds.LOADER, 6, 4, {
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
  BuildableIds,
  FilterType,
  Structure,
  filterConfig,
  filterItemsConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(BuildableIds.CARGO_HATCH, 8, 4, {
  configs: [
    filterConfig(FilterType.ALLOW_FILTER_ONLY),
    filterItemsConfig(BuildableIds.IRON_BLOCK)
  ]
});
```

## Configure a Nav Unit

```ts
import {
  BuildableIds,
  NavDestinationIds,
  Structure,
  navUnitConfig
} from "dsa-shipshape";

const ship = new Structure(20, 12);

ship.placeItem(BuildableIds.NAV_UNIT, 10, 5, {
  configs: [
    navUnitConfig({
      destinationIndex: NavDestinationIds.FALCON,
      warpActive: true
    })
  ]
});
```

## Map Nav Destination Names and IDs

```ts
import {
  navDestinationId,
  navDestinationName
} from "dsa-shipshape";

const falconId = navDestinationId("FALCON");
const name = navDestinationName(10);
```

## Remove Items

```ts
import {
  BuildableIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);

const id = ship.placeItem(BuildableIds.CARGO_HATCH, 5, 5);
ship.removeItem(id);
```

## Transform Every Placement

```ts
import {
  BuildableIds,
  Structure
} from "dsa-shipshape";

const ship = new Structure(20, 12);
ship.placeItem(BuildableIds.CARGO_HATCH, 5, 5);

ship.mapBuilds((build) => ({
  ...build,
  x: build.x + 1
}));
```

## Preserve Build Traversal More Strictly

```ts
import {
  BuildChainMode,
  BuildableIds,
  Structure,
  createBuildOrder
} from "dsa-shipshape";

const ship = new Structure(20, 12);
ship.placeItem(BuildableIds.CARGO_HATCH, 2, 2);
ship.placeItem(BuildableIds.STARTER_CARGO_HATCH, 3, 2);
ship.placeItem(BuildableIds.CARGO_HATCH, 4, 2);

const order = createBuildOrder({
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
  if (error instanceof DsaBpError) {
    console.error(error.code);
  } else {
    throw error;
  }
}
```

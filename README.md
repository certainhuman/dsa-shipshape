# dsa-shipshape

TypeScript utilities for parsing, editing, and encoding Deep Space Airships blueprint strings for [drednot.io](https://drednot.io).

Use this package when you want to read an existing DSA blueprint, generate a new one, or make programmatic edits without handling the compressed binary blueprint format yourself.

## Install

```sh
npm install dsa-shipshape
```

## Quick Start

Create a small blueprint and encode it back to a DSA string:

```ts
import {
  Item,
  Structure,
  Blueprint
} from "dsa-shipshape";

const ship = new Structure(10, 10);

ship.place(Item.CARGO_HATCH_PACKAGED, 2, 3);
ship.place(Item.IRON_BLOCK, 4, 3);

const blueprint = ship.toBlueprint();
const code = Blueprint.encode(blueprint, { prefix: true });

console.log(code);
```

Decode, edit, and re-encode an existing blueprint:

```ts
import {
  Item,
  Structure,
  Blueprint
} from "dsa-shipshape";

const blueprint = Blueprint.decode(inputCode);
const ship = Structure.fromBlueprint(blueprint);

ship.place(Item.LOADER_PACKAGED, 5, 5);

const outputCode = Blueprint.encode(ship.toBlueprint(), { prefix: true });
```

## Common Workflows

### Work With Raw Blueprint Commands

Use `Blueprint.builder()` when you want to add raw blueprint commands in order.

```ts
import {
  Item,
  Blueprint,
  createBuildCommand
} from "dsa-shipshape";

const blueprint = Blueprint.builder(20, 12)
  .command(createBuildCommand(2, 3, Item.CARGO_HATCH_PACKAGED))
  .command(createBuildCommand(4, 3, Item.IRON_BLOCK, [5, 6]))
  .toBlueprint();

const code = Blueprint.encode(blueprint, { prefix: true });
```

### Edit With `Structure`

`Structure` is the higher-level editing API. It expands build chains into individual placed items, lets you add/remove/configure them, then compacts the result back into blueprint commands.

```ts
import {
  Item,
  Structure,
  Blueprint
} from "dsa-shipshape";

const ship = Structure.fromBlueprint(Blueprint.decode(inputCode));

const id = ship.place(Item.CARGO_HATCH_PACKAGED, 12, 4);
ship.config(id, []);
ship.remove(id);

console.log(ship.count(Item.CARGO_HATCH_PACKAGED));
```

### Configure Items

Configuration helpers create the plain config objects expected by blueprint commands.

```ts
import {
  AdjacentPosition,
  Item,
  FilterType,
  Priority,
  Structure,
  filterConfig,
  filterItemsConfig,
  loaderConfig
} from "dsa-shipshape";

const ship = new Structure(20, 20);

ship.place(Item.LOADER_PACKAGED, 10, 10, {
  configs: [
    loaderConfig({
      pickPosition: AdjacentPosition.TOP_LEFT,
      placePosition: AdjacentPosition.BOTTOM_RIGHT,
      priority: Priority.HIGH
    }),
    filterConfig(FilterType.ALLOW_FILTER_ONLY),
    filterItemsConfig(Item.CARGO_HATCH_PACKAGED)
  ]
});
```

### Use Block Shapes

Use `Shape` instead of hard-coding known block shape IDs.

```ts
import {
  Shape,
  Item,
  Structure
} from "dsa-shipshape";

const ship = new Structure(12, 12);

ship.place(Item.IRON_BLOCK, 4, 4, {
  shape: Shape.Ramp.TopLeft
});
```

### Customize Build Order

`Structure.toBlueprint()` uses a default stage order that matches common Deep Space Airships build expectations. You can customize it when a generated blueprint needs a different traversal or staging strategy.

```ts
import {
  BuildChainMode,
  Structure,
  TraversalDirection,
  createBuildOrder,
  withStageDirection
} from "dsa-shipshape";

const ship = new Structure(20, 20);

const order = withStageDirection(
  createBuildOrder({
    buildChainMode: BuildChainMode.STRICT_TRAVERSAL
  }),
  5,
  TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT
);

const blueprint = ship.toBlueprint(order);
```

## Error Handling

Parsing and encoding errors throw `ShipShapeError`.

```ts
import { ShipShapeError, Blueprint } from "dsa-shipshape";

try {
  Blueprint.decode(code);
} catch (error) {
  if (error instanceof ShipShapeError) {
    console.error(error.code, error.message);
  } else {
    throw error;
  }
}
```

## Limits

The library validates blueprint bounds before returning decoded data or encoded strings:

- Blueprint dimensions must be between `1` and `100`.
- Encoded wrappers are limited by `MAX_WRAPPER_SIZE`.
- Decompressed blueprint data is limited by `MAX_DECOMPRESSED_SIZE`.
- Blueprints are limited by `MAX_BUILD_COMMANDS`.
- `Structure.place()` accepts positions from `-0.5` through `width - 0.5` and `height - 0.5`, matching DSA coordinate behavior.

## More Docs

- [Concepts](docs/concepts.md)
- [API Guide](docs/api-guide.md)

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

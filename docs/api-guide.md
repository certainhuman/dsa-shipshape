# API Guide

This guide documents the main structures exposed by `dsa-shipshape` and when to use each one.

## Blueprint

`Blueprint` is both a plain data shape and a namespace of helpers for working with that data.

Blueprint data is the closest public representation of the encoded DSA blueprint format:

```ts
interface Blueprint {
  version: number;
  width: number;
  height: number;
  commands: BlueprintCommand[];
}
```

Use `Blueprint.decode(code)` to parse a blueprint string. The input may be raw base64 or prefixed with `DSA:`.

Use `Blueprint.encode(blueprint, { prefix: true })` to serialize blueprint data into prefixed base64 string.

Use `Blueprint.create(width, height, commands)` when you already have a complete command array and want to assemble plain blueprint data directly.

```ts
import { Blueprint } from "dsa-shipshape";

const blueprint = Blueprint.decode(code);
const output = Blueprint.encode(blueprint, { prefix: true });
```

`Blueprint.decode()` validates wrapper size, decompressed size, blueprint version, dimensions, and build-command count and throws `ShipShapeError`.

## BlueprintBuilder

`Blueprint.builder(width, height)` creates a chainable builder for raw command streams. Use it if you want to build a blueprint command list manually.

```ts
import {
  Blueprint,
  FilterType,
  Item,
  filterConfig
} from "dsa-shipshape";

const blueprint = Blueprint.builder(20, 12)
  .config([filterConfig(FilterType.ALLOW_FILTER_ONLY)])
  .place(4, 3, Item.CARGO_HATCH_PACKAGED, [6])
  .toBlueprint();
```

Methods:

- `command(command)`: appends a raw `BlueprintCommand`.
- `config(configs)`: appends a configuration command. Following build commands use this config until another config command is added.
- `place(x, y, item, additionalPositions?, shape?)`: appends a build command. The first `x` is always included; `additionalPositions` are extra x coordinates on the same row.
- `toBlueprint()`: returns plain blueprint data.

`BlueprintBuilder` does not run the higher-level stage ordering used by `Structure`. It preserves the order in which commands are added.

## BlueprintCommand

Blueprint commands are either build commands or configuration commands.

```ts
type BlueprintCommand = BuildCommand | ConfigurationCommand;
```

### BuildCommand

```ts
interface BuildCommand {
  type: "build";
  x: number;
  y: number;
  item: number;
  bits: bigint;
  shape: number;
}
```

A build command places one item type on one row. Multiple x positions are represented by the `bits` mask. Use `createBuildCommand()` or `Blueprint.builder().place()` instead of constructing this mask manually.

```ts
import {
  Item,
  createBuildCommand
} from "dsa-shipshape";

const command = createBuildCommand(4, 3, Item.IRON_BLOCK, [5, 6]);
```

This command places iron blocks at `(4, 3)`, `(5, 3)`, and `(6, 3)`.

Use `getBuildPositions(command)` to expand a command's bit mask back into x positions.

Build-command bitmasks have a few important limits:

- All positions in one command are on the same `y` row.
- All positions in one command use the same `item` and `shape`.
- The smallest x position becomes the command's base `x`.
- Other positions are stored as integer offsets from that base x.
- Offsets must be from `0` through `63`, so one command can cover at most a 64-wide horizontal span.
- Fractional x offsets cannot be represented.
- Duplicate x positions collapse to the same bit; they do not create duplicate placements.

For example, this is valid because `73 - 10 = 63`:

```ts
createBuildCommand(10, 3, Item.IRON_BLOCK, [73]);
```

This is invalid because `74 - 10 = 64`:

```ts
createBuildCommand(10, 3, Item.IRON_BLOCK, [74]);
```

If an additional position is smaller than the first x argument, it becomes the base x:

```ts
createBuildCommand(10, 3, Item.IRON_BLOCK, [8, 9]);
```

That command uses base x `8` and places blocks at `8`, `9`, and `10`.

### ConfigurationCommand

```ts
interface ConfigurationCommand {
  type: "configuration";
  configs: ConfigData[];
}
```

A configuration command sets the set of configurations that apply to following build commands until another configuration command appears.

## Structure

`Structure` is the higher-level editable model. It expands the blueprint command stream into individual placements, lets you edit those placements, then allows you to collapse them back into commands.

```ts
import {
  Blueprint,
  Item,
  Structure
} from "dsa-shipshape";

const structure = Structure.fromBlueprint(Blueprint.decode(code));
const id = structure.place(Item.CARGO_HATCH_PACKAGED, 5, 5);

structure.config(id, []);

const newBase64 = Blueprint.encode(structure.toBlueprint(), { prefix: true });
```

Constructor:

- `new Structure(width, height)`: creates an empty editable structure.

Static methods:

- `Structure.fromBlueprint(blueprint)`: expands decoded blueprint commands into editable placements.

Instance methods:

- `place(item, x, y, options?)`: places one item and returns an internal editing ID.
- `remove(id)`: removes one placement by editing ID.
- `config(id, configs)`: replaces the config list for one placement.
- `get(id)`: returns a copy of one placement.
- `getAll()`: returns copies of all placements.
- `count(item)`: counts placements matching an item ID.
- `map(mapper)`: replaces every placement with the mapper result.
- `toBlueprint(buildOrder?)`: compacts placements into blueprint commands.

`Structure` currently allows multiple placements at the same coordinate. It does not perform occupancy checks.

## StructureBuild

`Structure` stores placements as `StructureBuild` objects:

```ts
interface StructureBuild {
  id: number;
  item: number;
  x: number;
  y: number;
  shape: number;
  configs: ConfigData[];
  priority: number;
}
```

The `id` is only a per-`Structure` editing handle; it is not encoded into the blueprint anywhere.

When using `map()`, return a complete `StructureBuild`:

```ts
structure.map((build) => ({
  ...build,
  x: build.x + 1
}));
```

The spread (`...build`) re-adds fields such as `id`, `item`, `y`, `shape`, `configs`, and `priority` so they are kept.

## ConfigData

`ConfigData` is the union of supported item config payloads:

- `LoaderConfig`
- `PusherConfig`
- `NavUnitConfig`
- `FixedAngleConfig`
- `AngleConfig`
- `FilterConfig`
- `FilterItemsConfig`

Use helper functions to create config objects with defaults:

```ts
import {
  AdjacentPosition,
  FilterType,
  Item,
  Priority,
  filterConfig,
  filterItemsConfig,
  loaderConfig
} from "dsa-shipshape";

const configs = [
  loaderConfig({
    pickPosition: AdjacentPosition.LEFT_MIDDLE,
    placePosition: AdjacentPosition.RIGHT_MIDDLE,
    priority: Priority.NORMAL
  }),
  filterConfig(FilterType.ALLOW_FILTER_ONLY),
  filterItemsConfig(Item.IRON)
];
```

## BuildOrder

`Structure.toBlueprint()` uses a `BuildOrder` to decide which items are emitted in which stage, how each stage is traversed, and how placements are compacted into build chains.

Use `createBuildOrder()` to create a customized order:

```ts
import {
  BuildChainMode,
  TraversalDirection,
  createBuildOrder,
  withStageDirection
} from "dsa-shipshape";

const order = withStageDirection(
  createBuildOrder({
    buildChainMode: BuildChainMode.STRICT_TRAVERSAL
  }),
  5,
  TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT
);
```

Helpers:

- `createBuildOrder(options?)`: creates a build order from defaults plus overrides.
- `withItems(order, stage, ...Item)`: returns a copy with item IDs added to a stage.
- `withoutItems(order, ...Item)`: returns a copy with item IDs removed from all stages.
- `withStageDirection(order, stage, direction)`: returns a copy with a stage traversal direction.
- `getItemsInStage(order, stage)`: reads stage item IDs.
- `getBuildStageOfItem(order, itemId)`: returns the item's stage, or `-1`.
- `getStageDirection(order, stage)`: reads a stage traversal direction.
- `numStages(order)`: returns the highest stage number.

`BuildChainMode` values:

- `STRICT_TRAVERSAL`: preserve traversal order strictly, even when that creates more commands.
- `ALLOW_DEFERRAL`: allows passing over builds that are next in the build traversal direction and deferring them to the next chain to allow chaining valid builds that are past them. It still follows traversal order between chains and will not chain if traversal order forbids it, such as when traversing right to left or in columns.
- `GROUP_BY_ITEM`: group placements by item and shape before creating build chains. This disregards traversal direction entirely in exchange for reducing the number of build commands.

## Constants

`Item` contains known item IDs from Drednot's production item schema. Use these IDs for both build commands and configuration values such as filter slots.

```ts
import { Item } from "dsa-shipshape";

Item.IRON_BLOCK;
Item.CARGO_HATCH_PACKAGED;
Item.IRON;
```

`ITEMS` is the array of all known item IDs.

`NavDestinationIds` contains known overworld destination IDs for nav unit config. These are internal game constants and may change if the game changes its destination IDs.

## Shape

`Shape` contains known block shape IDs grouped by readable names.

```ts
import {
  Shape,
  Item,
  Structure
} from "dsa-shipshape";

const structure = new Structure(20, 12);

structure.place(Item.IRON_BLOCK, 8, 5, {
  shape: Shape.Half.Top
});
```

Use `KNOWN_SHAPE_IDS` and `isKnownShapeId(shape)` when validating user input.

## ShipShapeError

Known parsing, validation, and encoding failures throw `ShipShapeError`.

```ts
import {
  Blueprint,
  ShipShapeError
} from "dsa-shipshape";

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

Check `error.code` to distinguish failure categories such as invalid blueprints, invalid configs, unexpected tokens, and size limits.

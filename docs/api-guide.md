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

Build-command bitmasks have limits due to the way they are encoded in the blueprint schema:

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

`BuildOrder` is both the encoder-facing interface and the namespace for build-order constructors and defaults:

```ts
import {
  BuildOrder,
  Item,
  TraversalAxis,
  TraversalDirection
} from "dsa-shipshape";

const order = new BuildOrder.Staged({
  followTraversalStrictly: true
})
  .without(Item.EXPANDO_BOX_PACKAGED)
  .with(5, Item.EXPANDO_BOX_PACKAGED)
  .direction(5, TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);
```

#### Constructors:
- `new BuildOrder.Staged(options?)`: creates a staged build order. Unless contents are specified, it is empty.
- `new BuildOrder.Flat(itemIds?, options?)`: creates a flat build order. Unless contents are specified, it is empty.
- `new BuildOrder.Sequential(itemIds?, options?)`: creates a sequential build order. Unless contents are specified, it is empty.


#### Presets:
- `BuildOrder.GAME_DEFAULT`: a staged build order that mimics the in-game encoder as closely as possible.
- `BuildOrder.Staged.DEFAULT`: the same staged build order as `BuildOrder.GAME_DEFAULT`.
- `BuildOrder.Flat.DEFAULT`: the same default items flattened into one stage.
- `BuildOrder.Sequential.DEFAULT`: the same default items flattened into one item per stage.

The preset item order is:

- Stage 1: `Item.IRON_BLOCK`, `Item.ANNIHILATOR_TILE`, `Item.HYPER_ICE_BLOCK`, `Item.HYPER_RUBBER_BLOCK`, `Item.WALKWAY`, `Item.ITEM_NET`, `Item.LOGISTICS_RAIL`, `Item.LADDER`.
- Stage 2: `Item.TURRET_CONTROLLER_PACKAGED`, `Item.THRUSTER_PACKAGED`, `Item.THRUSTER_STARTER_PACKAGED`, `Item.CANNON_PACKAGED`, `Item.STARTER_CANNON_PACKAGED`, `Item.BURST_CANNON_PACKAGED`, `Item.MACHINE_CANNON_PACKAGED`, `Item.OBTUSE_CANNON_PACKAGED`, `Item.ACUTE_CANNON_PACKAGED`, `Item.FABRICATOR_ENGINEERING_PACKAGED`, `Item.FABRICATOR_EQUIPMENT_PACKAGED`, `Item.FABRICATOR_MUNITIONS_PACKAGED`, `Item.FABRICATOR_STARTER_PACKAGED`, `Item.FABRICATOR_LEGACY_PACKAGED`, `Item.HELM_PACKAGED`, `Item.HELM_STARTER_PACKAGED`, `Item.COMMS_STATION_PACKAGED`, `Item.RECYCLER_PACKAGED`, `Item.SHIELD_PROJECTOR`, `Item.FLUID_TANK`, `Item.MUNITIONS_SUPPLY_UNIT_PACKAGED`, `Item.LOADER_PACKAGED`, `Item.PUSHER_PACKAGED`, `Item.SHIELD_GENERATOR`, `Item.CARGO_EJECTOR_PACKAGED`, `Item.NAVIGATION_UNIT_STARTER_PACKAGED`.
- Stage 4: `Item.EXPANDO_BOX_PACKAGED`.
- Stage 5: `Item.CARGO_HATCH_PACKAGED`, `Item.CARGO_HATCH_STARTER_PACKAGED`.

Stage 4 uses `TraversalDirection.NONE`; all other preset stages use `TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT`. All preset stages use `TraversalAxis.HORIZONTAL`.

The `BuildOrder` interface is the encoder-facing contract. It exposes `toStages()` plus build-chain settings so `Structure.toBlueprint()` can read a staged plan. The concrete implementations expose their own customization methods instead of sharing one broad editing API.

### BuildOrder.Staged

Use `BuildOrder.Staged` for multi-stage ordering with separate item sets and traversal directions per stage. This is the default build-order implementation.

```ts
const order = new BuildOrder.Staged({
  followTraversalStrictly: true
})
  .without(Item.EXPANDO_BOX_PACKAGED)
  .with(5, Item.EXPANDO_BOX_PACKAGED)
  .direction(5, TraversalDirection.NONE);
```

Stage indexes are numeric ordering keys. They do not need to be contiguous or positive; stages are encoded in ascending numeric order.

Traversal axis controls the major coordinate sort axis within a stage. `TraversalAxis.HORIZONTAL` is row-major and matches the default encoder behavior. `TraversalAxis.VERTICAL` is column-major. Build commands still use horizontal blueprint bitmasks.

Customization methods:

- `order.with(stage, ...itemIds)`: returns a copy with item IDs moved to the target stage, or added when not already staged.
- `order.first(...itemIds)`: returns a copy with item IDs moved to a new or empty lowest-index stage, or added when not already staged. Existing stage indexes are not shifted.
- `order.last(...itemIds)`: returns a copy with item IDs moved to a new or empty highest-index stage, or added when not already staged. Existing stage indexes are not shifted.
- `order.without(...itemIds)`: returns a copy with item IDs removed from all stages.
- `order.direction(direction)`: returns a copy with a traversal direction assigned to all stages.
- `order.direction(stage, direction)`: returns a copy with a traversal direction assigned to one stage.
- `order.axis(axis)`: returns a copy with a traversal axis assigned to all stages.
- `order.axis(stage, axis)`: returns a copy with a traversal axis assigned to one stage.
- `order.strict(value?)`: returns a copy with strict traversal following enabled or disabled. `value` defaults to `true`.

```ts
const order = BuildOrder.GAME_DEFAULT
  .axis(TraversalAxis.VERTICAL)
  .axis(4, TraversalAxis.HORIZONTAL);
```

### BuildOrder.Flat

Use `BuildOrder.Flat` when all configured items should be built together.

```ts
const order = new BuildOrder.Flat([
  Item.IRON_BLOCK,
  Item.WALKWAY,
  Item.CARGO_HATCH_PACKAGED
]);
```

Customization methods:

- `order.with(...itemIds)`: returns a copy with item IDs added.
- `order.without(...itemIds)`: returns a copy with item IDs removed.
- `order.direction(direction)`: returns a copy with the traversal direction.
- `order.axis(axis)`: returns a copy with the traversal axis.
- `order.strict(value?)`: returns a copy with strict traversal following enabled or disabled. `value` defaults to `true`.

```ts
const order = new BuildOrder.Flat([
  Item.IRON_BLOCK,
  Item.WALKWAY
]).axis(TraversalAxis.VERTICAL);
```

### BuildOrder.Sequential

Use `BuildOrder.Sequential` when each configured item should be built completely before the next item starts.

```ts
const order = new BuildOrder.Sequential([
  Item.IRON_BLOCK,
  Item.WALKWAY,
  Item.CARGO_HATCH_PACKAGED
]);
```

Customization methods:

- `order.append(...itemIds)`: returns a copy with item IDs appended to the sequence.
- `order.prepend(...itemIds)`: returns a copy with item IDs prepended to the sequence.
- `order.insert(index, ...itemIds)`: returns a copy with item IDs inserted at an index in the sequence.
- `order.without(...itemIds)`: returns a copy with item IDs removed from the sequence.
- `order.before(anchorItemId, ...itemIds)`: returns a copy with item IDs inserted before an existing item, or appended if the anchor is not present.
- `order.after(anchorItemId, ...itemIds)`: returns a copy with item IDs inserted after an existing item, or appended if the anchor is not present.
- `order.direction(direction, ...itemIds)`: returns a copy with a traversal direction assigned globally, or to specific items when item IDs are provided.
- `order.axis(axis, ...itemIds)`: returns a copy with a traversal axis assigned globally, or to specific items when item IDs are provided.
- `order.strict(value?)`: returns a copy with strict traversal following enabled or disabled. `value` defaults to `true`.

```ts
const order = new BuildOrder.Sequential([
  Item.IRON_BLOCK,
  Item.WALKWAY
])
  .axis(TraversalAxis.VERTICAL)
  .axis(TraversalAxis.HORIZONTAL, Item.WALKWAY);
```

Build-chain traversal options:

- `followTraversalStrictly: true`: preserve traversal order strictly, even when that creates more build commands.
- `followTraversalStrictly: false`: allow compatible placements later in traversal order to be chained together, while still preserving traversal order between chains. This can reduce command count.

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

Check `error.code` to distinguish failure categories such as invalid blueprints, invalid configs, unexpected tokens, and size limits. Compression and decompression failures use `ENCODE_FAILED` and `DEFLATE_FAILED`, with the original error available on `error.cause`.

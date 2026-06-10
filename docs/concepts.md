# Concepts

This package models Deep Space Airships blueprints at two levels:

- `Blueprint`: the decoded command stream that can be encoded back into a DSA string.
- `Structure`: a higher-level editable structure made of individual placed items.

Use `Blueprint` when you need exact command-level control. Use `Structure` when you want to add, remove, count, or configure items without manually managing build chains.

## Blueprint Strings

`Blueprint.decode(input)` accepts a raw base64 blueprint string or a string with the `DSA:` prefix. It inflates and parses the encoded blueprint into a `Blueprint` object.

`Blueprint.encode(blueprint)` serializes a `Blueprint` object back into the compressed base64 format. Pass `{ prefix: true }` to include the `DSA:` prefix in the returned string.

`Blueprint.create(width, height, commands)` creates plain blueprint data from dimensions and raw commands.

`Blueprint.builder(width, height)` creates a chainable builder for adding raw configuration commands with `.config(...)` and placement commands with `.place(...)`.

## Blueprint

A blueprint contains:

- `version`: currently emitted as `0`.
- `width`: blueprint width.
- `height`: blueprint height.
- `commands`: build and configuration commands.

```ts
interface Blueprint {
  version: number;
  width: number;
  height: number;
  commands: BlueprintCommand[];
}
```

## Build Commands

A build command places one item type on one row. The command can represent more than one x position through the `bits` field.

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

Use `createBuildCommand()` to create these safely. The `x` argument is always included, and any additional x positions are compacted into the same command bit mask.

## Configuration Commands

Configuration commands apply a list of config objects to the following build commands until another configuration command appears.

```ts
interface ConfigurationCommand {
  type: "configuration";
  configs: ConfigData[];
}
```

The helpers in `configs.ts` create supported configuration objects:

- `loaderConfig()`
- `pusherConfig()`
- `navUnitConfig()`
- `fixedAngleConfig()`
- `angleConfig()`
- `filterConfig()`
- `filterItemsConfig()`

## Structure

`Structure` expands blueprint commands into editable item placements.

```ts
const structure = Structure.fromBlueprint(blueprint);
const id = structure.place(ItemIds.CARGO_HATCH_PACKAGED, 2, 3);
structure.config(id, []);
const nextBlueprint = structure.toBlueprint();
```

Placed items have stable IDs inside a `Structure` instance. These IDs are editing handles only; they are not encoded into the DSA blueprint format.

## Items

Use `ItemIds` for game item IDs for configs such as filters. These values are generated from Drednot's live item schema and may need updates if the game schema changes.

The package also exports:

- `ITEM_IDS`: all known item IDs from `ItemIds`.

Unknown numeric item IDs can still be used where the API accepts `number`, but the default build order only includes known buildable item IDs from `ItemIds`.

## Shapes

`BlockShape` contains known block shape IDs grouped by readable names, such as `BlockShape.Full`, `BlockShape.Ramp.TopLeft`, and `BlockShape.Half.Bottom`.

Use `isKnownBlockShapeId(shape)` to check whether a number is in the known shape list.

## Build Order

`Structure.toBlueprint()` groups placed items into staged build commands. The default order is intended to match the game's default build order:

1. Tiled blocks.
2. Cannons, fabs, helm, comms, recycler, projector, tank, and MSU.
3. Loader, pusher, generator, cargo ejector, and nav unit.
4. Expando box.
5. Cargo hatch.

Use `createBuildOrder()` and helpers such as `withItems()`, `withoutItems()`, and `withStageDirection()` to customize staging.

`BuildChainMode` controls how placed items are compacted into build commands:

- `ALLOW_DEFERRAL`: allows passing over builds that are next in the build traversal direction and deferring them to the next chain to allow chaining valid builds that are past them. It still follows traversal order between chains and will not chain if traversal order forbids it, such as when traversing right to left or in columns.
- `STRICT_TRAVERSAL`: preserve traversal order more strictly, even if it creates more commands.
- `GROUP_BY_ITEM`: group by item and shape before creating chains.

## Navigation Destinations

`NavDestinationIds` exposes known overworld navigation destination IDs for nav unit configs. These values come from the game and may need updates if Deep Space Airships changes its destination IDs.

## Errors

The library throws `ShipShapeError` for known validation and serialization failures. Check `error.code` to distinguish size limits, invalid blueprints, and invalid config payloads.

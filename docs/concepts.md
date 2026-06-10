# Concepts

This package models Deep Space Airships blueprints at two levels:

- `Blueprint`: the decoded command stream that can be encoded back into a DSA string.
- `Structure`: a higher-level editable structure made of individual placed items.

Use `Blueprint` when you need exact command-level control. Use `Structure` when you want to add, remove, count, or configure items without manually managing build chains.

## Blueprint Strings

`decodeBlueprint(input)` accepts a raw base64 blueprint string or a string with the `DSA:` prefix. It inflates and parses the encoded blueprint into a `Blueprint` object.

`encodeBlueprint(blueprint)` serializes a `Blueprint` object back into the compressed base64 format. Pass `{ prefix: true }` to include the `DSA:` prefix in the returned string.

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
const id = structure.placeItem(BuildableIds.CARGO_HATCH, 2, 3);
structure.configureItem(id, []);
const nextBlueprint = structure.toBlueprint();
```

Placed items have stable IDs inside a `Structure` instance. These IDs are editing handles only; they are not encoded into the DSA blueprint format.

## Items

Use `BuildableIds` for known Deep Space Airships item IDs. The package also exports:

- `BUILDABLE_ITEM_IDS`: item IDs known to be buildable.
- `RCD_COMPATIBLE_ITEM_IDS`: items commonly compatible with RCD-style building.

Unknown numeric item IDs can still be used where the API accepts `number`, but helper lists and default build order only include known IDs.

## Shapes

`BlockShape` contains known block shape IDs grouped by readable names, such as `BlockShape.Full`, `BlockShape.Ramp.TopLeft`, and `BlockShape.Half.Bottom`.

Use `isKnownBlockShapeId(shape)` to check whether a number is in the known shape list.

## Build Order

`Structure.toBlueprint()` groups placed items into staged build commands. The default order is intended to produce practical DSA build sequences:

1. Blocks and basic structure.
2. Weapons, fabs, helm, comms, recycler, projector, tank, and MSU.
3. Loader, pusher, generator, cargo ejector, and nav unit.
4. Expando box.
5. Cargo hatch.

Use `createBuildOrder()` and helpers such as `withItems()`, `withoutItems()`, and `withStageDirection()` to customize staging.

`BuildChainMode` controls how placed items are compacted into build commands:

- `ALLOW_DEFERRAL`: follow traversal order between chains, while allowing compatible later placements to be deferred into the current chain when possible.
- `STRICT_TRAVERSAL`: preserve traversal order more strictly, even if it creates more commands.
- `GROUP_BY_ITEM`: group by item and shape before creating chains.

## Navigation Destinations

`NavDestinationIds`, `navDestinationId()`, and `navDestinationName()` map known overworld navigation destination names and IDs. These values come from the game and may need updates if Deep Space Airships changes its destination IDs.

## Errors

The library throws `DsaBpError` for known validation and serialization failures. Check `error.code` to distinguish size limits, invalid blueprints, and invalid config payloads.

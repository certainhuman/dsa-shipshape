# dsa-shipshape

Shipshape is a TypeScript library for parsing, editing, and encoding Deep Space Airships ([drednot.io](https://drednot.io)) blueprint strings.

## Install

```sh
npm install dsa-shipshape
```

Or load the browser bundle directly from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/dsa-shipshape/dist/browser/dsa-shipshape.global.js"></script>
<script>
  const ship = new DSAShipshape.Structure(12, 8); // Create an empty 12x8 structure.
  ship.place(DSAShipshape.Item.IRON_BLOCK, 4, 3); // Place one iron block.

  const blueprint = ship.toBlueprint(); // Compact placements into blueprint commands.
  const code = DSAShipshape.Blueprint.encode(blueprint, { prefix: true }); // Encode for DSA.

  console.log(code); // Print the encoded string.
</script>
```

## Quick Start

Create a small blueprint and encode it back to a DSA string:

```ts
import {
  Blueprint, // Encode and decode DSA blueprint strings.
  Item, // Known DSA item IDs.
  Shape, // Known DSA block shape IDs.
  Structure // Editable ship model.
} from "dsa-shipshape";

const ship = new Structure(12, 8); // Create an empty 12x8 structure.

ship.place(Item.CARGO_HATCH_PACKAGED, 2, 3); // Place a cargo hatch at x=2, y=3.
ship.place(Item.IRON_BLOCK, 4, 3); // Place a full iron block at x=4, y=3.
ship.place(Item.IRON_BLOCK, 5, 3, {
  shape: Shape.Ramp.TopLeft // Give this iron block a non-default shape.
});

const blueprint = ship.toBlueprint(); // Compact placements into blueprint commands.
const code = Blueprint.encode(blueprint, { prefix: true }); // Encode to a base64 string with the DSA: prefix.

console.log(code); // Print the encoded string.
```

Decode, edit, and re-encode an existing blueprint:

```ts
import {
  AdjacentPosition, // Loader input/output position constants.
  Blueprint, // Encode and decode DSA blueprint strings.
  Item, // Known DSA item IDs.
  Priority, // Item configuration priority constants.
  Structure, // Editable ship model.
  loaderConfig // Helper for loader configuration objects.
} from "dsa-shipshape";

const blueprint = Blueprint.decode(inputCode); // Parse a raw or DSA:-prefixed string.
const ship = Structure.fromBlueprint(blueprint); // Expand commands into editable placements.

const loaderId = ship.place(Item.LOADER_PACKAGED, 5, 5); // Add a loader and keep its editing ID.
ship.config(loaderId, [
  loaderConfig({
    pickPosition: AdjacentPosition.LEFT_MIDDLE, // Pick up from the tile to the left.
    placePosition: AdjacentPosition.RIGHT_MIDDLE, // Place onto the tile to the right.
    priority: Priority.NORMAL // Use the default priority.
  })
]);
ship.place(Item.IRON_BLOCK, 6, 5); // Add another placement to the structure.

const outputBlueprint = ship.toBlueprint(); // Rebuild to a Blueprint (command representation).
const outputCode = Blueprint.encode(outputBlueprint, { prefix: true }); // Encode
```

_Further docs are available in the [API Guide](docs/api-guide.md)._

## Dev Setup

```sh
npm install # Install dependencies
npm run typecheck # Check for type errors
npm test # Run tests
npm run build # Build
```

Shortcuts are available with [`just`](https://github.com/casey/just):

```sh
just check # Run typecheck and tests
just build # Build package outputs
just pack # Preview the npm package contents
```

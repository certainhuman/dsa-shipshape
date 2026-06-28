import { deflateSync, inflateSync } from "fflate";
import { BinaryReader, BinaryWriter } from "./binary";
import {
  MAX_BUILD_COMMANDS,
  MAX_DECOMPRESSED_SIZE,
  MAX_WRAPPER_SIZE,
  SHAPE_REJECTING_TILE_ITEMS,
  SHAPE_SUPPORTING_TILE_ITEMS
} from "./constants";
import { createBuildCommand, parseCommand, serializeCommand } from "./commands";
import { ShipShapeError } from "./errors";
import type { Blueprint as BlueprintData, BlueprintCommand, ConfigData } from "./types";

export interface BlueprintBuilder {
  /**
   * Adds a raw blueprint command.
   */
  command(command: BlueprintCommand): BlueprintBuilder;

  /**
   * Adds a configuration command. Following build commands use this config until
   * another configuration command is added.
   */
  config(configs: readonly ConfigData[]): BlueprintBuilder;

  /**
   * Adds a build command for one or more x positions on the same row.
   */
  place(
    x: number,
    y: number,
    item: number,
    additionalPositions?: readonly number[],
    shape?: number
  ): BlueprintBuilder;

  /**
   * Returns the accumulated plain blueprint data.
   */
  toBlueprint(): BlueprintData;
}

/**
 * Decodes a Deep Space Airships blueprint string into command data.
 *
 * The input may be raw base64 or prefixed with `DSA:`.
 */
function decode(input: string): BlueprintData {
  const base64 = input.startsWith("DSA:") ? input.slice(4) : input;
  if (base64.length > MAX_WRAPPER_SIZE) {
    throw new ShipShapeError("SIZE_LIMIT", "Base64 wrapper exceeds maximum size");
  }

  const compressed = base64ToBytes(base64);
  const decompressed = inflateBlueprint(compressed);
  if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
    throw new ShipShapeError("SIZE_LIMIT", "Decompressed data exceeds maximum size");
  }

  const reader = new BinaryReader(decompressed);
  reader.beginArray();

  const version = reader.nextNumberAsNumber();
  if (version !== -1 && version !== 0) {
    throw new ShipShapeError("INVALID_BLUEPRINT", "Invalid blueprint version");
  }

  const width = reader.nextNumberAsNumber();
  const height = reader.nextNumberAsNumber();
  if (width < 1 || width > 100 || height < 1 || height > 100) {
    throw new ShipShapeError("INVALID_BLUEPRINT", "Invalid blueprint dimensions");
  }

  const commands: BlueprintCommand[] = [];
  reader.beginArray();
  while (reader.peek() !== "array_end") {
    commands.push(parseCommand(reader));
  }
  reader.endArray();
  reader.endArray();

  const buildCount = commands.filter((command) => command.type === "build").length;
  if (buildCount === 0) {
    throw new ShipShapeError("INVALID_BLUEPRINT", "No build commands found");
  }
  if (buildCount > MAX_BUILD_COMMANDS) {
    throw new ShipShapeError("SIZE_LIMIT", "Too many build commands");
  }

  return { version, width, height, commands };
}

/**
 * Encodes command data into a compressed Deep Space Airships blueprint string.
 *
 * Pass `{ prefix: true }` to include the `DSA:` prefix.
 */
function encode(blueprint: BlueprintData, options: { prefix?: boolean } = {}): string {
  const writer = new BinaryWriter();
  writer.beginArray();
  writer.writeInt(blueprint.version);
  writer.writeInt(blueprint.width);
  writer.writeInt(blueprint.height);
  writer.beginArray();
  for (const command of blueprint.commands) {
    serializeCommand(command, writer);
  }
  writer.endArray();
  writer.endArray();

  const compressed = deflateBlueprint(writer.toBytes());
  const base64 = bytesToBase64(compressed);
  if (base64.length > MAX_WRAPPER_SIZE) {
    throw new ShipShapeError("SIZE_LIMIT", "Resulting Base64 string exceeds maximum size");
  }

  return options.prefix ? `DSA:${base64}` : base64;
}

/**
 * Creates a blueprint object from dimensions and commands.
 */
function create(width: number, height: number, commands: readonly BlueprintCommand[]): BlueprintData {
  return {
    version: 0,
    width,
    height,
    commands: [...commands]
  };
}

/**
 * Returns blueprint data with easily-correctable issues fixed.
 */
function sanitize(
  blueprint: BlueprintData,
  options: { onlyStrictlyUnsupportedShapes?: boolean } = {}
): BlueprintData {
  return {
    version: blueprint.version,
    width: blueprint.width,
    height: blueprint.height,
    commands: blueprint.commands.map((command): BlueprintCommand => {
      if (command.type === "configuration") {
        return { type: "configuration", configs: [...command.configs] };
      }

      const shouldRemoveShape = options.onlyStrictlyUnsupportedShapes
        ? SHAPE_REJECTING_TILE_ITEMS.includes(command.item)
        : !SHAPE_SUPPORTING_TILE_ITEMS.includes(command.item);
      return {
        ...command,
        shape: shouldRemoveShape ? 0 : command.shape
      };
    })
  };
}
/**
 * Creates a sequential builder for raw blueprint commands.
 */
function builder(width: number, height: number): BlueprintBuilder {
  const commands: BlueprintCommand[] = [];

  const api: BlueprintBuilder = {
    command(command) {
      commands.push(cloneCommand(command));
      return api;
    },
    config(configs) {
      commands.push({ type: "configuration", configs: [...configs] });
      return api;
    },
    place(x, y, item, additionalPositions = [], shape = 0) {
      commands.push(createBuildCommand(x, y, item, additionalPositions, shape));
      return api;
    },
    toBlueprint() {
      return create(width, height, commands);
    }
  };

  return api;
}

/**
 * Blueprint helpers for creating, decoding, and encoding plain blueprint data.
 */
export const Blueprint = {
  /**
   * Decodes a Deep Space Airships blueprint string into command data.
   *
   * The input may be raw base64 or prefixed with `DSA:`.
   */
  decode,

  /**
   * Encodes command data into a compressed Deep Space Airships blueprint string.
   *
   * Pass `{ prefix: true }` to include the `DSA:` prefix.
   */
  encode,

  /**
   * Creates a blueprint object from dimensions and commands.
   */
  create,

  /**
   * Returns blueprint data with easily-correctable issues fixed.
   */
  sanitize,

  /**
   * Creates a sequential builder for raw blueprint commands.
   */
  builder
} as const;

function cloneCommand(command: BlueprintCommand): BlueprintCommand {
  if (command.type === "configuration") {
    return { type: "configuration", configs: [...command.configs] };
  }

  return { ...command };
}

function inflateBlueprint(compressed: Uint8Array): Uint8Array {
  try {
    return inflateSync(compressed);
  } catch (cause) {
    throw new ShipShapeError("DEFLATE_FAILED", "Failed to decompress blueprint data", cause);
  }
}

function deflateBlueprint(decompressed: Uint8Array): Uint8Array {
  try {
    return deflateSync(decompressed, { level: 9 });
  } catch (cause) {
    throw new ShipShapeError("ENCODE_FAILED", "Failed to compress blueprint data", cause);
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const globals = globalThis as unknown as {
    Buffer?: { from(value: string, encoding: "base64"): Uint8Array };
    atob?: (value: string) => string;
  };

  if (globals.Buffer) {
    return new Uint8Array(globals.Buffer.from(base64, "base64"));
  }
  if (globals.atob) {
    const binary = globals.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  throw new ShipShapeError("INVALID_BLUEPRINT", "No base64 decoder is available");
}

function bytesToBase64(bytes: Uint8Array): string {
  const globals = globalThis as unknown as {
    Buffer?: { from(value: Uint8Array): { toString(encoding: "base64"): string } };
    btoa?: (value: string) => string;
  };

  if (globals.Buffer) {
    return globals.Buffer.from(bytes).toString("base64");
  }
  if (globals.btoa) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return globals.btoa(binary);
  }

  throw new ShipShapeError("INVALID_BLUEPRINT", "No base64 encoder is available");
}

import { deflateSync, inflateSync } from "fflate";
import { BinaryReader, BinaryWriter } from "./binary";
import { MAX_BUILD_COMMANDS, MAX_DECOMPRESSED_SIZE, MAX_WRAPPER_SIZE } from "./constants";
import { parseCommand, serializeCommand } from "./commands";
import { DsaBpError } from "./errors";
import type { Blueprint, BlueprintCommand } from "./types";

/**
 * Decodes a Deep Space Airships blueprint string into command data.
 *
 * The input may be raw base64 or prefixed with `DSA:`.
 */
export function decodeBlueprint(input: string): Blueprint {
  const base64 = input.startsWith("DSA:") ? input.slice(4) : input;
  if (base64.length > MAX_WRAPPER_SIZE) {
    throw new DsaBpError("SIZE_LIMIT", "Base64 wrapper exceeds maximum size");
  }

  const compressed = base64ToBytes(base64);
  const decompressed = inflateSync(compressed);
  if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
    throw new DsaBpError("SIZE_LIMIT", "Decompressed data exceeds maximum size");
  }

  const reader = new BinaryReader(decompressed);
  reader.beginArray();

  const version = reader.nextNumberAsNumber();
  if (version !== -1 && version !== 0) {
    throw new DsaBpError("INVALID_BLUEPRINT", "Invalid blueprint version");
  }

  const width = reader.nextNumberAsNumber();
  const height = reader.nextNumberAsNumber();
  if (width < 1 || width > 100 || height < 1 || height > 100) {
    throw new DsaBpError("INVALID_BLUEPRINT", "Invalid blueprint dimensions");
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
    throw new DsaBpError("INVALID_BLUEPRINT", "No build commands found");
  }
  if (buildCount > MAX_BUILD_COMMANDS) {
    throw new DsaBpError("SIZE_LIMIT", "Too many build commands");
  }

  return { version, width, height, commands };
}

/**
 * Encodes command data into a compressed Deep Space Airships blueprint string.
 *
 * Pass `{ prefix: true }` to include the `DSA:` prefix.
 */
export function encodeBlueprint(blueprint: Blueprint, options: { prefix?: boolean } = {}): string {
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

  const compressed = deflateSync(writer.toBytes(), { level: 9 });
  const base64 = bytesToBase64(compressed);
  if (base64.length > MAX_WRAPPER_SIZE) {
    throw new DsaBpError("SIZE_LIMIT", "Resulting Base64 string exceeds maximum size");
  }

  return options.prefix ? `DSA:${base64}` : base64;
}

/**
 * Creates a blueprint object from dimensions and commands.
 */
export function createBlueprint(width: number, height: number, commands: readonly BlueprintCommand[]): Blueprint {
  return {
    version: 0,
    width,
    height,
    commands: [...commands]
  };
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

  throw new DsaBpError("INVALID_BLUEPRINT", "No base64 decoder is available");
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

  throw new DsaBpError("INVALID_BLUEPRINT", "No base64 encoder is available");
}

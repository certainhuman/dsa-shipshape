import { BinaryReader, BinaryWriter } from "./binary";
import {
  parseConfigurationPayload,
  serializeConfigurationPayload
} from "./configs";
import { DsaBpError } from "./errors";
import type {
  BlueprintCommand,
  BuildCommand,
  ConfigurationCommand
} from "./types";

export function parseCommand(reader: BinaryReader): BlueprintCommand {
  reader.beginArray();
  const commandType = reader.nextNumberAsNumber();
  const command = parseCommandBody(commandType, reader);
  reader.endArray();
  return command;
}

export function serializeCommand(command: BlueprintCommand, writer: BinaryWriter): void {
  writer.beginArray();
  if (command.type === "build") {
    writer.writeInt(0);
    writer.writeDouble(command.x);
    writer.writeDouble(command.y);
    writer.writeInt(command.item);
    if (command.shape !== 0 || command.bits !== 1n) {
      writer.writeLong(command.bits);
      if (command.shape !== 0) writer.writeInt(command.shape);
    }
  } else {
    writer.writeInt(1);
    if (command.configs.length === 0) {
      writer.writeNull();
    } else {
      writer.writeByteArray(serializeConfigurationPayload(command.configs));
    }
  }
  writer.endArray();
}

/**
 * Expands a build command bit mask into its concrete x positions.
 */
export function getBuildPositions(command: BuildCommand): number[] {
  const positions: number[] = [];
  for (let i = 0n; i < 64n; i++) {
    if ((command.bits & (1n << i)) !== 0n) {
      positions.push(command.x + Number(i));
    }
  }
  return positions;
}

/**
 * Creates a build command for one or more positions on the same row.
 *
 * The `x` position is always included. Additional positions may be supplied
 * to compact multiple placements into one command.
 */
export function createBuildCommand(
  x: number,
  y: number,
  item: number,
  additionalPositions: readonly number[] = [],
  shape = 0
): BuildCommand {
  const positions = [x, ...additionalPositions];

  const baseX = Math.min(...positions);
  let bits = 0n;
  for (const position of positions) {
    const offset = position - baseX;
    if (!isValidBitOffset(offset)) {
      throw new DsaBpError("INVALID_BLUEPRINT", `Invalid build bit offset: ${offset}`);
    }
    bits |= 1n << BigInt(Math.round(offset));
  }

  return { type: "build", x: baseX, y, item, bits, shape };
}

function parseCommandBody(commandType: number, reader: BinaryReader): BlueprintCommand {
  switch (commandType) {
    case 0:
      return parseBuildCommand(reader);
    case 1:
      return parseConfigurationCommand(reader);
    default:
      throw new DsaBpError("INVALID_BLUEPRINT", `Unknown command type: ${commandType}`);
  }
}

function parseBuildCommand(reader: BinaryReader): BuildCommand {
  const x = reader.nextNumberAsNumber();
  const y = reader.nextNumberAsNumber();
  const item = reader.nextNumberAsNumber();
  let bits = 1n;
  let shape = 0;

  if (reader.peek() !== "array_end") {
    bits = reader.nextNumberAsBigInt();
    if (bits === 0n) {
      throw new DsaBpError("INVALID_BLUEPRINT", "Invalid BITS value in build command");
    }
  }

  if (reader.peek() !== "array_end") {
    shape = reader.nextNumberAsNumber();
  }

  return { type: "build", x, y, item, bits, shape };
}

function parseConfigurationCommand(reader: BinaryReader): ConfigurationCommand {
  if (reader.peek() === "null") {
    reader.nextNull();
    return { type: "configuration", configs: [] };
  }

  return {
    type: "configuration",
    configs: parseConfigurationPayload(reader.nextBytes())
  };
}

function isValidBitOffset(offset: number): boolean {
  return offset >= 0 && offset < 64 && Math.abs(offset - Math.round(offset)) < 0.000001;
}

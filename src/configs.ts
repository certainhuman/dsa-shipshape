import { BinaryReader, BinaryWriter } from "./binary";
import {
  AdjacentPosition,
  Direction,
  FilterType,
  Priority,
  PusherAction
} from "./enums";
import { DsaBpError } from "./errors";
import type {
  AngleConfig,
  ConfigData,
  FilterConfig,
  FilterItemsConfig,
  FixedAngleConfig,
  LoaderConfig,
  NavUnitConfig,
  PusherConfig
} from "./types";

export interface LoaderConfigOptions {
  pickPosition: AdjacentPosition;
  placePosition: AdjacentPosition;
  priority?: Priority;
  maxStack?: number;
  cycleTime?: number;
  requireOutputInventory?: boolean;
  waitForStackLimit?: boolean;
}

export interface PusherConfigOptions {
  defaultAction?: PusherAction;
  filterAction?: PusherAction;
  angle?: number;
  targetSpeed?: number;
  filterByInventory?: boolean;
  maxBeamLength?: number;
}

export interface NavUnitConfigOptions {
  destinationIndex?: number;
  page?: number;
  warpActive?: boolean;
  warpOnCritical?: boolean;
  warpOnNoCaptains?: boolean;
}

export function loaderConfig(options: LoaderConfigOptions): LoaderConfig {
  return {
    type: "config_loader",
    pickPosition: options.pickPosition,
    placePosition: options.placePosition,
    priority: options.priority ?? Priority.NORMAL,
    maxStack: options.maxStack ?? 16,
    cycleTime: options.cycleTime ?? 20,
    requireOutputInventory: options.requireOutputInventory ?? false,
    waitForStackLimit: options.waitForStackLimit ?? false
  };
}

export function pusherConfig(options: PusherConfigOptions = {}): PusherConfig {
  return {
    type: "config_pusher",
    defaultAction: options.defaultAction ?? PusherAction.DO_NOTHING,
    filterAction: options.filterAction ?? PusherAction.PULL,
    angle: options.angle ?? 0,
    targetSpeed: options.targetSpeed ?? 20,
    filterByInventory: options.filterByInventory ?? false,
    maxBeamLength: options.maxBeamLength ?? 1000
  };
}

export function navUnitConfig(options: NavUnitConfigOptions = {}): NavUnitConfig {
  return {
    type: "config_nav_unit",
    destinationIndex: options.destinationIndex ?? 10,
    page: options.page ?? 0,
    warpActive: options.warpActive ?? false,
    warpOnCritical: options.warpOnCritical ?? true,
    warpOnNoCaptains: options.warpOnNoCaptains ?? true
  };
}

export function fixedAngleConfig(direction: Direction): FixedAngleConfig {
  return { type: "angle_fixed", direction };
}

export function angleConfig(angle: number): AngleConfig {
  return { type: "angle", angle };
}

export function filterConfig(filterType: FilterType): FilterConfig {
  return { type: "filter_config", filterType };
}

export function filterItemsConfig(
  item1 = 0,
  item2 = 0,
  item3 = 0
): FilterItemsConfig {
  return { type: "filter_items", items: [item1, item2, item3] };
}

export function parseConfigurationPayload(bytes: Uint8Array): ConfigData[] {
  const reader = new BinaryReader(bytes);
  const configs: ConfigData[] = [];

  reader.beginArray();
  reader.expectNumber(0);
  reader.expectNumber(0);

  while (reader.peek() !== "array_end") {
    const configName = reader.nextString();
    reader.expectNumber(0);

    if (configName === "maze_puzzle") {
      reader.beginArray();
      reader.nextString();
      reader.nextBoolean();
      reader.endArray();
      continue;
    }

    configs.push(parseConfig(configName, reader));
  }

  reader.endArray();
  return configs;
}

export function serializeConfigurationPayload(configs: readonly ConfigData[]): Uint8Array {
  const writer = new BinaryWriter();
  writer.beginArray();
  writer.writeInt(0);
  writer.writeInt(0);

  for (const config of configs) {
    serializeConfig(config, writer);
  }

  writer.endArray();
  return writer.toBytes();
}

export function configKey(configs: readonly ConfigData[]): string {
  return JSON.stringify(configs);
}

export function configsEqual(a: readonly ConfigData[], b: readonly ConfigData[]): boolean {
  return configKey(a) === configKey(b);
}

function parseConfig(configName: string, reader: BinaryReader): ConfigData {
  switch (configName) {
    case "config_loader":
      return parseLoaderConfig(reader);
    case "config_pusher":
      return parsePusherConfig(reader);
    case "config_nav_unit":
      return parseNavUnitConfig(reader);
    case "angle_fixed":
      return parseFixedAngleConfig(reader);
    case "angle":
      return parseAngleConfig(reader);
    case "filter_config":
      return parseFilterConfig(reader);
    case "filter_items":
      return parseFilterItemsConfig(reader);
    default:
      throw new DsaBpError("INVALID_CONFIG", `Unexpected config: ${configName}`);
  }
}

function serializeConfig(config: ConfigData, writer: BinaryWriter): void {
  writer.writeString(config.type);
  writer.writeInt(0);
  writer.beginArray();

  switch (config.type) {
    case "config_loader":
      writer.writeInt(config.pickPosition);
      writer.writeInt(config.placePosition);
      writer.writeInt(config.priority);
      writer.writeInt(config.maxStack);
      writer.writeInt(config.cycleTime);
      writer.writeBoolean(config.requireOutputInventory);
      writer.writeBoolean(config.waitForStackLimit);
      break;
    case "config_pusher":
      writer.writeInt(config.defaultAction);
      writer.writeInt(config.filterAction);
      writer.writeDouble(config.angle);
      writer.writeInt(config.targetSpeed);
      writer.writeBoolean(config.filterByInventory);
      writer.writeDouble(config.maxBeamLength);
      break;
    case "config_nav_unit":
      writer.writeInt(config.destinationIndex);
      writer.writeInt(config.page);
      writer.writeBoolean(config.warpActive);
      writer.writeBoolean(config.warpOnCritical);
      writer.writeBoolean(config.warpOnNoCaptains);
      break;
    case "angle_fixed":
      writer.writeInt(config.direction);
      break;
    case "angle":
      writer.writeDouble(config.angle);
      break;
    case "filter_config":
      writer.writeInt(config.filterType);
      break;
    case "filter_items":
      writer.writeInt(config.items[0]);
      writer.writeInt(config.items[1]);
      writer.writeInt(config.items[2]);
      break;
  }

  writer.endArray();
}

function parseArrayWrapped<T>(reader: BinaryReader, parse: () => T): T {
  const wrapped = reader.peek() === "array_begin";
  if (wrapped) reader.beginArray();
  const value = parse();
  if (wrapped) reader.endArray();
  return value;
}

function parseLoaderConfig(reader: BinaryReader): LoaderConfig {
  return parseArrayWrapped(reader, () => ({
    type: "config_loader",
    pickPosition: reader.nextNumberAsNumber() as AdjacentPosition,
    placePosition: reader.nextNumberAsNumber() as AdjacentPosition,
    priority: reader.nextNumberAsNumber() as Priority,
    maxStack: reader.nextNumberAsNumber(),
    cycleTime: reader.nextNumberAsNumber(),
    requireOutputInventory: reader.nextBoolean(),
    waitForStackLimit: reader.nextBoolean()
  }));
}

function parsePusherConfig(reader: BinaryReader): PusherConfig {
  return parseArrayWrapped(reader, () => ({
    type: "config_pusher",
    defaultAction: reader.nextNumberAsNumber() as PusherAction,
    filterAction: reader.nextNumberAsNumber() as PusherAction,
    angle: reader.nextNumberAsNumber(),
    targetSpeed: reader.nextNumberAsNumber(),
    filterByInventory: reader.nextBoolean(),
    maxBeamLength: reader.nextNumberAsNumber()
  }));
}

function parseNavUnitConfig(reader: BinaryReader): NavUnitConfig {
  return parseArrayWrapped(reader, () => ({
    type: "config_nav_unit",
    destinationIndex: reader.nextNumberAsNumber(),
    page: reader.nextNumberAsNumber(),
    warpActive: reader.nextBoolean(),
    warpOnCritical: reader.nextBoolean(),
    warpOnNoCaptains: reader.nextBoolean()
  }));
}

function parseFixedAngleConfig(reader: BinaryReader): FixedAngleConfig {
  return parseArrayWrapped(reader, () => ({
    type: "angle_fixed",
    direction: reader.nextNumberAsNumber() as Direction
  }));
}

function parseAngleConfig(reader: BinaryReader): AngleConfig {
  return parseArrayWrapped(reader, () => ({
    type: "angle",
    angle: reader.nextNumberAsNumber()
  }));
}

function parseFilterConfig(reader: BinaryReader): FilterConfig {
  return parseArrayWrapped(reader, () => ({
    type: "filter_config",
    filterType: reader.nextNumberAsNumber() as FilterType
  }));
}

function parseFilterItemsConfig(reader: BinaryReader): FilterItemsConfig {
  return parseArrayWrapped(reader, () => ({
    type: "filter_items",
    items: [
      reader.nextNumberAsNumber(),
      reader.nextNumberAsNumber(),
      reader.nextNumberAsNumber()
    ]
  }));
}

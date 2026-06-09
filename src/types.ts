import type {
  AdjacentPosition,
  Direction,
  FilterType,
  Priority,
  PusherAction
} from "./enums";

export interface Blueprint {
  version: number;
  width: number;
  height: number;
  commands: BlueprintCommand[];
}

export type BlueprintCommand = BuildCommand | ConfigurationCommand;

export interface BuildCommand {
  type: "build";
  x: number;
  y: number;
  item: number;
  bits: bigint;
  shape: number;
}

export interface ConfigurationCommand {
  type: "configuration";
  configs: ConfigData[];
}

export type ConfigData =
  | LoaderConfig
  | PusherConfig
  | NavUnitConfig
  | FixedAngleConfig
  | AngleConfig
  | FilterConfig
  | FilterItemsConfig;

export interface LoaderConfig {
  type: "config_loader";
  pickPosition: AdjacentPosition;
  placePosition: AdjacentPosition;
  priority: Priority;
  maxStack: number;
  cycleTime: number;
  requireOutputInventory: boolean;
  waitForStackLimit: boolean;
}

export interface PusherConfig {
  type: "config_pusher";
  defaultAction: PusherAction;
  filterAction: PusherAction;
  angle: number;
  targetSpeed: number;
  filterByInventory: boolean;
  maxBeamLength: number;
}

export interface NavUnitConfig {
  type: "config_nav_unit";
  destinationIndex: number;
  page: number;
  warpActive: boolean;
  warpOnCritical: boolean;
  warpOnNoCaptains: boolean;
}

export interface FixedAngleConfig {
  type: "angle_fixed";
  direction: Direction;
}

export interface AngleConfig {
  type: "angle";
  angle: number;
}

export interface FilterConfig {
  type: "filter_config";
  filterType: FilterType;
}

export interface FilterItemsConfig {
  type: "filter_items";
  items: [number, number, number];
}

export interface ItemMetadata {
  id: number;
  name?: string;
  description?: string;
  image?: string;
  rarity?: number;
  maxStack?: number;
}

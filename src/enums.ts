export enum SerializerTag {
  U8 = 0x80,
  U16 = 0x81,
  U32 = 0x82,
  U64 = 0x83,
  I8 = 0x84,
  I16 = 0x85,
  I32 = 0x86,
  I64 = 0x87,
  F32 = 0x88,
  F64 = 0x89,
  STR_L1 = 0x8a,
  STR_L2 = 0x8b,
  STR_L4 = 0x8c,
  TRUE = 0x8d,
  FALSE = 0x8e,
  NULL = 0x8f,
  ARRAY_BEGIN = 0x90,
  ARRAY_END = 0x91,
  MAP_BEGIN = 0x92,
  MAP_END = 0x93,
  BYTES_L1 = 0x94,
  BYTES_L2 = 0x95,
  BYTES_L4 = 0x96
}

export enum AdjacentPosition {
  TOP_LEFT = 0,
  TOP_MIDDLE = 1,
  TOP_RIGHT = 2,
  LEFT_MIDDLE = 3,
  RIGHT_MIDDLE = 4,
  BOTTOM_LEFT = 5,
  BOTTOM_MIDDLE = 6,
  BOTTOM_RIGHT = 7
}

export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2
}

export enum PusherAction {
  PUSH = 0,
  PULL = 1,
  DO_NOTHING = 2
}

export enum FilterType {
  ALLOW_ALL = 0,
  BLOCK_FILTER_ONLY = 1,
  ALLOW_FILTER_ONLY = 2,
  BLOCK_ALL = 3
}

export enum Direction {
  RIGHT = 0,
  UP = 1,
  LEFT = 2,
  DOWN = 3
}

export enum TraversalDirection {
  TOP_LEFT_TO_BOTTOM_RIGHT = "TOP_LEFT_TO_BOTTOM_RIGHT",
  BOTTOM_RIGHT_TO_TOP_LEFT = "BOTTOM_RIGHT_TO_TOP_LEFT",
  BOTTOM_LEFT_TO_TOP_RIGHT = "BOTTOM_LEFT_TO_TOP_RIGHT",
  TOP_RIGHT_TO_BOTTOM_LEFT = "TOP_RIGHT_TO_BOTTOM_LEFT",
  NONE = "NONE"
}

export enum TraversalAxis {
  VERTICAL = "VERTICAL",
  HORIZONTAL = "HORIZONTAL"
}

export enum BuildChainMode {
  STRICT_TRAVERSAL = "STRICT_TRAVERSAL",
  DEFAULT_ENCODER = "DEFAULT_ENCODER",
  GROUP_BY_ITEM = "GROUP_BY_ITEM"
}

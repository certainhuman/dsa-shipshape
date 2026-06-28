/**
 * Binary serializer tags used by the DSA blueprint payload format.
 *
 * These are low-level format markers used internally while parsing and writing
 * compressed blueprint data. They are not intended to be used by external
 * applications. The schema is similar to msgpack, but not exactly the same.
 */
export enum SerializerTag {
  /** Unsigned 8-bit integer. */
  U8 = 0x80,
  /** Unsigned 16-bit integer. */
  U16 = 0x81,
  /** Unsigned 32-bit integer. */
  U32 = 0x82,
  /** Unsigned 64-bit integer. */
  U64 = 0x83,
  /** Signed 8-bit integer. */
  I8 = 0x84,
  /** Signed 16-bit integer. */
  I16 = 0x85,
  /** Signed 32-bit integer. */
  I32 = 0x86,
  /** Signed 64-bit integer. */
  I64 = 0x87,
  /** 32-bit floating point number. */
  F32 = 0x88,
  /** 64-bit floating point number. */
  F64 = 0x89,
  /** String with 1-byte length. */
  STR_L1 = 0x8a,
  /** String with 2-byte length. */
  STR_L2 = 0x8b,
  /** String with 4-byte length. */
  STR_L4 = 0x8c,
  /** Boolean true. */
  TRUE = 0x8d,
  /** Boolean false. */
  FALSE = 0x8e,
  /** Null value. */
  NULL = 0x8f,
  /** Start of an array. */
  ARRAY_BEGIN = 0x90,
  /** End of an array. */
  ARRAY_END = 0x91,
  /** Start of a map. */
  MAP_BEGIN = 0x92,
  /** End of a map. */
  MAP_END = 0x93,
  /** Byte array with 1-byte length. */
  BYTES_L1 = 0x94,
  /** Byte array with 2-byte length. */
  BYTES_L2 = 0x95,
  /** Byte array with 4-byte length. */
  BYTES_L4 = 0x96
}

/**
 * Adjacent tile positions used by loader pick/place configuration.
 */
export enum AdjacentPosition {
  /** Tile above and left of the configured item. */
  TOP_LEFT = 0,
  /** Tile directly above the configured item. */
  TOP_MIDDLE = 1,
  /** Tile above and right of the configured item. */
  TOP_RIGHT = 2,
  /** Tile directly left of the configured item. */
  LEFT_MIDDLE = 3,
  /** Tile directly right of the configured item. */
  RIGHT_MIDDLE = 4,
  /** Tile below and left of the configured item. */
  BOTTOM_LEFT = 5,
  /** Tile directly below the configured item. */
  BOTTOM_MIDDLE = 6,
  /** Tile below and right of the configured item. */
  BOTTOM_RIGHT = 7
}

/**
 * Loader priority values.
 */
export enum Priority {
  /** Low loader priority. */
  LOW = 0,
  /** Normal loader priority. */
  NORMAL = 1,
  /** High loader priority. */
  HIGH = 2
}

/**
 * Pusher actions used by pusher configuration.
 */
export enum PusherAction {
  /** Push items away from the pusher. */
  PUSH = 0,
  /** Pull items toward the pusher. */
  PULL = 1,
  /** Leave items unchanged. */
  DO_NOTHING = 2
}

/**
 * Item filter modes used by filter configuration.
 */
export enum FilterType {
  /** Allow all items. */
  ALLOW_ALL = 0,
  /** Block only items listed in the filter. */
  BLOCK_FILTER_ONLY = 1,
  /** Allow only items listed in the filter. */
  ALLOW_FILTER_ONLY = 2,
  /** Block all items. */
  BLOCK_ALL = 3
}

/**
 * Cardinal directions used by fixed-angle configurations found in items such as generators.
 */
export enum Direction {
  /** Right-facing direction. */
  RIGHT = 0,
  /** Up-facing direction. */
  UP = 1,
  /** Left-facing direction. */
  LEFT = 2,
  /** Down-facing direction. */
  DOWN = 3
}

/**
 * Sort order for converting `Structure` placements into blueprint build commands.
 */
export enum TraversalDirection {
  /** Traverse rows from top to bottom, and columns from left to right. */
  TOP_LEFT_TO_BOTTOM_RIGHT = "TOP_LEFT_TO_BOTTOM_RIGHT",
  /** Traverse rows from bottom to top, and columns from right to left. */
  BOTTOM_RIGHT_TO_TOP_LEFT = "BOTTOM_RIGHT_TO_TOP_LEFT",
  /** Traverse rows from bottom to top, and columns from left to right. */
  BOTTOM_LEFT_TO_TOP_RIGHT = "BOTTOM_LEFT_TO_TOP_RIGHT",
  /** Traverse rows from top to bottom, and columns from right to left. */
  TOP_RIGHT_TO_BOTTOM_LEFT = "TOP_RIGHT_TO_BOTTOM_LEFT",
  /** Sort by build handle, this can be used to preserve the existing placement order after converting a Blueprint to a Structure. */
  NONE = "NONE"
}

/**
 * Preferred major axis for traversal-related build ordering.
 */
export enum TraversalAxis {
  /** Prefer vertical traversal, i.e., traverse in columns. */
  VERTICAL = "VERTICAL",
  /** Prefer horizontal traversal, i.e., traverse in rows, similar to the in-game encoder. */
  HORIZONTAL = "HORIZONTAL"
}

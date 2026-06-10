export type ShipShapeErrorCode =
  | "INVALID_BLUEPRINT"
  | "INVALID_CONFIG"
  | "SIZE_LIMIT"
  | "BASE64_WRAPPER_TOO_LARGE"
  | "BASE64_DECODE_FAILED"
  | "DEFLATE_FAILED"
  | "DECOMPRESSED_TOO_LARGE"
  | "INVALID_BLUEPRINT_VERSION"
  | "INVALID_BLUEPRINT_DIMENSIONS"
  | "NO_BUILD_COMMANDS"
  | "TOO_MANY_BUILD_COMMANDS"
  | "INVALID_BUILD_BITS"
  | "UNEXPECTED_TOKEN"
  | "UNKNOWN_TOKEN"
  | "UNKNOWN_COMMAND"
  | "UNKNOWN_CONFIG"
  | "ENCODE_FAILED";

export class ShipShapeError extends Error {
  constructor(
    public readonly code: ShipShapeErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ShipShapeError";
  }
}

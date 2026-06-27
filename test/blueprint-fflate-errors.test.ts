import { beforeEach, describe, expect, it, vi } from "vitest";

const fflate = vi.hoisted(() => ({
  deflateSync: vi.fn(),
  inflateSync: vi.fn()
}));

vi.mock("fflate", () => fflate);

describe("blueprint fflate errors", () => {
  beforeEach(() => {
    vi.resetModules();
    fflate.deflateSync.mockReset();
    fflate.inflateSync.mockReset();
  });

  it("wraps inflate failures", async () => {
    const cause = new Error("invalid block type");
    fflate.inflateSync.mockImplementation(() => {
      throw cause;
    });

    const { Blueprint, ShipShapeError } = await import("../src");
    const error = captureThrown(() => Blueprint.decode("AAAA"));

    expect(error).toBeInstanceOf(ShipShapeError);
    expect(error).toMatchObject({
      code: "DEFLATE_FAILED",
      message: "Failed to decompress blueprint data",
      cause
    });
  });

  it("wraps deflate failures", async () => {
    const cause = new Error("compression failed");
    fflate.deflateSync.mockImplementation(() => {
      throw cause;
    });

    const { Blueprint, ShipShapeError } = await import("../src");
    const blueprint = Blueprint.create(1, 1, [
      { type: "build", x: 0, y: 0, item: 1, bits: 1n, shape: 0 }
    ]);
    const error = captureThrown(() => Blueprint.encode(blueprint));

    expect(error).toBeInstanceOf(ShipShapeError);
    expect(error).toMatchObject({
      code: "ENCODE_FAILED",
      message: "Failed to compress blueprint data",
      cause
    });
  });
});

function captureThrown(fn: () => void): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
}

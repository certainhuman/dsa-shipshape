import { describe, expect, it } from "vitest";
import {
  BlockShape,
  KNOWN_BLOCK_SHAPE_IDS,
  isKnownBlockShapeId
} from "../src";

describe("block shapes", () => {
  it("exposes known block shape ids by grouped names", () => {
    expect(BlockShape.Full).toBe(0);
    expect(BlockShape.Ramp).toEqual({
      TopLeft: 2,
      TopRight: 3,
      BottomLeft: 1,
      BottomRight: 4
    });
    expect(BlockShape.Half).toEqual({
      Bottom: 5,
      Top: 7,
      Right: 8,
      Left: 6
    });
    expect(BlockShape.HalfRamp.Wedge.Horizontal).toEqual({
      TopLeft: 19,
      TopRight: 11,
      BottomLeft: 9,
      BottomRight: 17
    });
    expect(BlockShape.HalfRamp.Wedge.Vertical).toEqual({
      TopLeft: 10,
      TopRight: 20,
      BottomLeft: 18,
      BottomRight: 12
    });
    expect(BlockShape.HalfRamp.ThickWedge.Horizontal).toEqual({
      TopLeft: 23,
      TopRight: 15,
      BottomLeft: 13,
      BottomRight: 21
    });
    expect(BlockShape.HalfRamp.ThickWedge.Vertical).toEqual({
      TopLeft: 14,
      TopRight: 24,
      BottomLeft: 22,
      BottomRight: 16
    });
    expect(BlockShape.HalfRamp.OffsetWedge.Horizontal).toEqual({
      TopLeft: 31,
      TopRight: 27,
      BottomLeft: 25,
      BottomRight: 29
    });
    expect(BlockShape.HalfRamp.OffsetWedge.Vertical).toEqual({
      TopLeft: 26,
      TopRight: 32,
      BottomLeft: 30,
      BottomRight: 28
    });
    expect(BlockShape.Quarter).toEqual({
      TopLeft: 34,
      TopRight: 35,
      BottomLeft: 33,
      BottomRight: 36
    });
    expect(BlockShape.CornerRamp).toEqual({
      TopLeft: 38,
      TopRight: 39,
      BottomLeft: 37,
      BottomRight: 40
    });
    expect(BlockShape.Chamfer).toEqual({
      TopLeft: 42,
      TopRight: 43,
      BottomLeft: 41,
      BottomRight: 44
    });
  });

  it("lists and checks known shape ids", () => {
    expect(KNOWN_BLOCK_SHAPE_IDS).toHaveLength(45);
    expect(isKnownBlockShapeId(0)).toBe(true);
    expect(isKnownBlockShapeId(BlockShape.Chamfer.TopLeft)).toBe(true);
    expect(isKnownBlockShapeId(999)).toBe(false);
  });
});

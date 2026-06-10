import { describe, expect, it } from "vitest";
import {
  Shape,
  KNOWN_SHAPE_IDS,
  isKnownShapeId
} from "../src";

describe("block shapes", () => {
  it("exposes known block shape ids by grouped names", () => {
    expect(Shape.Full).toBe(0);
    expect(Shape.Ramp).toEqual({
      TopLeft: 2,
      TopRight: 3,
      BottomLeft: 1,
      BottomRight: 4
    });
    expect(Shape.Half).toEqual({
      Bottom: 5,
      Top: 7,
      Right: 8,
      Left: 6
    });
    expect(Shape.HalfRamp.Wedge.Horizontal).toEqual({
      TopLeft: 19,
      TopRight: 11,
      BottomLeft: 9,
      BottomRight: 17
    });
    expect(Shape.HalfRamp.Wedge.Vertical).toEqual({
      TopLeft: 10,
      TopRight: 20,
      BottomLeft: 18,
      BottomRight: 12
    });
    expect(Shape.HalfRamp.ThickWedge.Horizontal).toEqual({
      TopLeft: 23,
      TopRight: 15,
      BottomLeft: 13,
      BottomRight: 21
    });
    expect(Shape.HalfRamp.ThickWedge.Vertical).toEqual({
      TopLeft: 14,
      TopRight: 24,
      BottomLeft: 22,
      BottomRight: 16
    });
    expect(Shape.HalfRamp.OffsetWedge.Horizontal).toEqual({
      TopLeft: 31,
      TopRight: 27,
      BottomLeft: 25,
      BottomRight: 29
    });
    expect(Shape.HalfRamp.OffsetWedge.Vertical).toEqual({
      TopLeft: 26,
      TopRight: 32,
      BottomLeft: 30,
      BottomRight: 28
    });
    expect(Shape.Quarter).toEqual({
      TopLeft: 34,
      TopRight: 35,
      BottomLeft: 33,
      BottomRight: 36
    });
    expect(Shape.CornerRamp).toEqual({
      TopLeft: 38,
      TopRight: 39,
      BottomLeft: 37,
      BottomRight: 40
    });
    expect(Shape.Chamfer).toEqual({
      TopLeft: 42,
      TopRight: 43,
      BottomLeft: 41,
      BottomRight: 44
    });
  });

  it("lists and checks known shape ids", () => {
    expect(KNOWN_SHAPE_IDS).toHaveLength(45);
    expect(isKnownShapeId(0)).toBe(true);
    expect(isKnownShapeId(Shape.Chamfer.TopLeft)).toBe(true);
    expect(isKnownShapeId(999)).toBe(false);
  });
});

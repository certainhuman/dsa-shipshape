/**
 * Known block shape ids accepted by blueprint build commands.
 *
 * Directional names identify the solid side or corner of the shape. Diagrams
 * use `#` for solid material and `.` for empty space inside the tile border.
 */
export const Shape = {
  /**
   * Full solid tile.
   *
   * ```text
   * +-----------+
   * |## ## ## ##|
   * |## ## ## ##|
   * |## ## ## ##|
   * |## ## ## ##|
   * +-----------+
   * ```
   */
  Full: 0,

  /** Diagonal ramp. */
  Ramp: {
    /**
     * ```text
     * +-----------+
     * |## ## ## ##|
     * |## ## ## ..|
     * |## ## .. ..|
     * |## .. .. ..|
     * +-----------+
     * ```
     */
    TopLeft: 2,
    /**
     * ```text
     * +-----------+
     * |## ## ## ##|
     * |.. ## ## ##|
     * |.. .. ## ##|
     * |.. .. .. ##|
     * +-----------+
     * ```
     */
    TopRight: 3,
    /**
     * ```text
     * +-----------+
     * |## .. .. ..|
     * |## ## .. ..|
     * |## ## ## ..|
     * |## ## ## ##|
     * +-----------+
     * ```
     */
    BottomLeft: 1,
    /**
     * ```text
     * +-----------+
     * |.. .. .. ##|
     * |.. .. ## ##|
     * |.. ## ## ##|
     * |## ## ## ##|
     * +-----------+
     * ```
     */
    BottomRight: 4
  },

  /** Half tile. */
  Half: {
    /**
     * ```text
     * +-----------+
     * |.. .. .. ..|
     * |.. .. .. ..|
     * |## ## ## ##|
     * |## ## ## ##|
     * +-----------+
     * ```
     */
    Bottom: 5,
    /**
     * ```text
     * +-----------+
     * |## ## ## ##|
     * |## ## ## ##|
     * |.. .. .. ..|
     * |.. .. .. ..|
     * +-----------+
     * ```
     */
    Top: 7,
    /**
     * ```text
     * +-----------+
     * |.. .. ## ##|
     * |.. .. ## ##|
     * |.. .. ## ##|
     * |.. .. ## ##|
     * +-----------+
     * ```
     */
    Right: 8,
    /**
     * ```text
     * +-----------+
     * |## ## .. ..|
     * |## ## .. ..|
     * |## ## .. ..|
     * |## ## .. ..|
     * +-----------+
     * ```
     */
    Left: 6
  },

  /** Half-tile ramp variants. Direction names identify the solid corner. */
  HalfRamp: {
    /** Small half-ramp wedge. */
    Wedge: {
      Horizontal: {
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |## ## .. ..|
         * |.. .. .. ..|
         * |.. .. .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 19,
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |.. .. ## ##|
         * |.. .. .. ..|
         * |.. .. .. ..|
         * +-----------+
         * ```
         */
        TopRight: 11,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ..|
         * |.. .. .. ..|
         * |## ## .. ..|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomLeft: 9,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ..|
         * |.. .. .. ..|
         * |.. .. ## ##|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomRight: 17
      },
      Vertical: {
        /**
         * ```text
         * +-----------+
         * |## ## .. ..|
         * |## ## .. ..|
         * |## .. .. ..|
         * |## .. .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 10,
        /**
         * ```text
         * +-----------+
         * |.. .. ## ##|
         * |.. .. ## ##|
         * |.. .. .. ##|
         * |.. .. .. ##|
         * +-----------+
         * ```
         */
        TopRight: 20,
        /**
         * ```text
         * +-----------+
         * |## .. .. ..|
         * |## .. .. ..|
         * |## ## .. ..|
         * |## ## .. ..|
         * +-----------+
         * ```
         */
        BottomLeft: 18,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ##|
         * |.. .. .. ##|
         * |.. .. ## ##|
         * |.. .. ## ##|
         * +-----------+
         * ```
         */
        BottomRight: 12
      }
    },

    /** Filled-in half-ramp wedge. */
    ThickWedge: {
      Horizontal: {
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |## ## ## ##|
         * |## ## ## ..|
         * |## .. .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 23,
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |## ## ## ##|
         * |.. ## ## ##|
         * |.. .. .. ##|
         * +-----------+
         * ```
         */
        TopRight: 15,
        /**
         * ```text
         * +-----------+
         * |## .. .. ..|
         * |## ## ## ..|
         * |## ## ## ##|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomLeft: 13,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ##|
         * |.. ## ## ##|
         * |## ## ## ##|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomRight: 21
      },
      Vertical: {
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |## ## ## ..|
         * |## ## ## ..|
         * |## ## .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 14,
        /**
         * ```text
         * +-----------+
         * |## ## ## ##|
         * |.. ## ## ##|
         * |.. ## ## ##|
         * |.. .. ## ##|
         * +-----------+
         * ```
         */
        TopRight: 24,
        /**
         * ```text
         * +-----------+
         * |## ## .. ..|
         * |## ## ## ..|
         * |## ## ## ..|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomLeft: 22,
        /**
         * ```text
         * +-----------+
         * |.. .. ## ##|
         * |.. ## ## ##|
         * |.. ## ## ##|
         * |## ## ## ##|
         * +-----------+
         * ```
         */
        BottomRight: 16
      }
    },

    /** Offset half-ramp wedge. */
    OffsetWedge: {
      Horizontal: {
        /**
         * ```text
         * +-----------+
         * |.. .. ## ##|
         * |## ## ## ##|
         * |.. .. .. ..|
         * |.. .. .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 31,
        /**
         * ```text
         * +-----------+
         * |## ## .. ..|
         * |## ## ## ##|
         * |.. .. .. ..|
         * |.. .. .. ..|
         * +-----------+
         * ```
         */
        TopRight: 27,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ..|
         * |.. .. .. ..|
         * |## ## ## ##|
         * |.. .. ## ##|
         * +-----------+
         * ```
         */
        BottomLeft: 25,
        /**
         * ```text
         * +-----------+
         * |.. .. .. ..|
         * |.. .. .. ..|
         * |## ## ## ##|
         * |## ## .. ..|
         * +-----------+
         * ```
         */
        BottomRight: 29
      },
      Vertical: {
        /**
         * ```text
         * +-----------+
         * |.. ## .. ..|
         * |.. ## .. ..|
         * |## ## .. ..|
         * |## ## .. ..|
         * +-----------+
         * ```
         */
        TopLeft: 26,
        /**
         * ```text
         * +-----------+
         * |.. .. ## ..|
         * |.. .. ## ..|
         * |.. .. ## ##|
         * |.. .. ## ##|
         * +-----------+
         * ```
         */
        TopRight: 32,
        /**
         * ```text
         * +-----------+
         * |## ## .. ..|
         * |## ## .. ..|
         * |.. ## .. ..|
         * |.. ## .. ..|
         * +-----------+
         * ```
         */
        BottomLeft: 30,
        /**
         * ```text
         * +-----------+
         * |.. .. ## ##|
         * |.. .. ## ##|
         * |.. .. ## ..|
         * |.. .. ## ..|
         * +-----------+
         * ```
         */
        BottomRight: 28
      }
    }
  },

  /** Quarter tile. */
  Quarter: {
    /**
     * ```text
     * +-----------+
     * |## ## .. ..|
     * |## ## .. ..|
     * |.. .. .. ..|
     * |.. .. .. ..|
     * +-----------+
     * ```
     */
    TopLeft: 34,
    /**
     * ```text
     * +-----------+
     * |.. .. ## ##|
     * |.. .. ## ##|
     * |.. .. .. ..|
     * |.. .. .. ..|
     * +-----------+
     * ```
     */
    TopRight: 35,
    /**
     * ```text
     * +-----------+
     * |.. .. .. ..|
     * |.. .. .. ..|
     * |## ## .. ..|
     * |## ## .. ..|
     * +-----------+
     * ```
     */
    BottomLeft: 33,
    /**
     * ```text
     * +-----------+
     * |.. .. .. ..|
     * |.. .. .. ..|
     * |.. .. ## ##|
     * |.. .. ## ##|
     * +-----------+
     * ```
     */
    BottomRight: 36
  },

  /** Corner ramp. */
  CornerRamp: {
    /**
     * ```text
     * +-----------+
     * |## ## .. ..|
     * |## .. .. ..|
     * |.. .. .. ..|
     * |.. .. .. ..|
     * +-----------+
     * ```
     */
    TopLeft: 38,
    /**
     * ```text
     * +-----------+
     * |.. .. ## ##|
     * |.. .. .. ##|
     * |.. .. .. ..|
     * |.. .. .. ..|
     * +-----------+
     * ```
     */
    TopRight: 39,
    /**
     * ```text
     * +-----------+
     * |.. .. .. ..|
     * |.. .. .. ..|
     * |## .. .. ..|
     * |## ## .. ..|
     * +-----------+
     * ```
     */
    BottomLeft: 37,
    /**
     * ```text
     * +-----------+
     * |.. .. .. ..|
     * |.. .. .. ..|
     * |.. .. .. ##|
     * |.. .. ## ##|
     * +-----------+
     * ```
     */
    BottomRight: 40
  },

  /** Chamfered corner. */
  Chamfer: {
    /**
     * ```text
     * +-----------+
     * |## ## ## ##|
     * |## ## ## ##|
     * |## ## /. ..|
     * |## ## .. ..|
     * +-----------+
     * ```
     */
    TopLeft: 42,
    /**
     * ```text
     * +-----------+
     * |## ## ## ##|
     * |## ## ## ##|
     * |.. .\ ## ##|
     * |.. .. ## ##|
     * +-----------+
     * ```
     */
    TopRight: 43,
    /**
     * ```text
     * +-----------+
     * |## ## .. ..|
     * |## ## \. ..|
     * |## ## ## ##|
     * |## ## ## ##|
     * +-----------+
     * ```
     */
    BottomLeft: 41,
    /**
     * ```text
     * +-----------+
     * |.. .. ## ##|
     * |.. ./ ## ##|
     * |## ## ## ##|
     * |## ## ## ##|
     * +-----------+
     * ```
     */
    BottomRight: 44
  }
} as const;

export const KNOWN_SHAPE_IDS = [
  Shape.Full,
  Shape.Ramp.TopLeft,
  Shape.Ramp.TopRight,
  Shape.Ramp.BottomLeft,
  Shape.Ramp.BottomRight,
  Shape.Half.Bottom,
  Shape.Half.Top,
  Shape.Half.Right,
  Shape.Half.Left,
  Shape.HalfRamp.Wedge.Horizontal.TopLeft,
  Shape.HalfRamp.Wedge.Horizontal.TopRight,
  Shape.HalfRamp.Wedge.Horizontal.BottomLeft,
  Shape.HalfRamp.Wedge.Horizontal.BottomRight,
  Shape.HalfRamp.Wedge.Vertical.TopLeft,
  Shape.HalfRamp.Wedge.Vertical.TopRight,
  Shape.HalfRamp.Wedge.Vertical.BottomLeft,
  Shape.HalfRamp.Wedge.Vertical.BottomRight,
  Shape.HalfRamp.ThickWedge.Horizontal.TopLeft,
  Shape.HalfRamp.ThickWedge.Horizontal.TopRight,
  Shape.HalfRamp.ThickWedge.Horizontal.BottomLeft,
  Shape.HalfRamp.ThickWedge.Horizontal.BottomRight,
  Shape.HalfRamp.ThickWedge.Vertical.TopLeft,
  Shape.HalfRamp.ThickWedge.Vertical.TopRight,
  Shape.HalfRamp.ThickWedge.Vertical.BottomLeft,
  Shape.HalfRamp.ThickWedge.Vertical.BottomRight,
  Shape.HalfRamp.OffsetWedge.Horizontal.TopLeft,
  Shape.HalfRamp.OffsetWedge.Horizontal.TopRight,
  Shape.HalfRamp.OffsetWedge.Horizontal.BottomLeft,
  Shape.HalfRamp.OffsetWedge.Horizontal.BottomRight,
  Shape.HalfRamp.OffsetWedge.Vertical.TopLeft,
  Shape.HalfRamp.OffsetWedge.Vertical.TopRight,
  Shape.HalfRamp.OffsetWedge.Vertical.BottomLeft,
  Shape.HalfRamp.OffsetWedge.Vertical.BottomRight,
  Shape.Quarter.TopLeft,
  Shape.Quarter.TopRight,
  Shape.Quarter.BottomLeft,
  Shape.Quarter.BottomRight,
  Shape.CornerRamp.TopLeft,
  Shape.CornerRamp.TopRight,
  Shape.CornerRamp.BottomLeft,
  Shape.CornerRamp.BottomRight,
  Shape.Chamfer.TopLeft,
  Shape.Chamfer.TopRight,
  Shape.Chamfer.BottomLeft,
  Shape.Chamfer.BottomRight
] as const;

export type KnownShapeId = (typeof KNOWN_SHAPE_IDS)[number];

const knownShapeIdSet = new Set<number>(KNOWN_SHAPE_IDS);

export function isKnownShapeId(shape: number): shape is KnownShapeId {
  return knownShapeIdSet.has(shape);
}

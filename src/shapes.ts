/**
 * Known block shape ids accepted by blueprint build commands.
 *
 * Directional names identify the solid side or corner of the shape. Diagrams
 * use `#` for solid material and `.` for empty space inside the tile border.
 */
export const BlockShape = {
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

export const KNOWN_BLOCK_SHAPE_IDS = [
  BlockShape.Full,
  BlockShape.Ramp.TopLeft,
  BlockShape.Ramp.TopRight,
  BlockShape.Ramp.BottomLeft,
  BlockShape.Ramp.BottomRight,
  BlockShape.Half.Bottom,
  BlockShape.Half.Top,
  BlockShape.Half.Right,
  BlockShape.Half.Left,
  BlockShape.HalfRamp.Wedge.Horizontal.TopLeft,
  BlockShape.HalfRamp.Wedge.Horizontal.TopRight,
  BlockShape.HalfRamp.Wedge.Horizontal.BottomLeft,
  BlockShape.HalfRamp.Wedge.Horizontal.BottomRight,
  BlockShape.HalfRamp.Wedge.Vertical.TopLeft,
  BlockShape.HalfRamp.Wedge.Vertical.TopRight,
  BlockShape.HalfRamp.Wedge.Vertical.BottomLeft,
  BlockShape.HalfRamp.Wedge.Vertical.BottomRight,
  BlockShape.HalfRamp.ThickWedge.Horizontal.TopLeft,
  BlockShape.HalfRamp.ThickWedge.Horizontal.TopRight,
  BlockShape.HalfRamp.ThickWedge.Horizontal.BottomLeft,
  BlockShape.HalfRamp.ThickWedge.Horizontal.BottomRight,
  BlockShape.HalfRamp.ThickWedge.Vertical.TopLeft,
  BlockShape.HalfRamp.ThickWedge.Vertical.TopRight,
  BlockShape.HalfRamp.ThickWedge.Vertical.BottomLeft,
  BlockShape.HalfRamp.ThickWedge.Vertical.BottomRight,
  BlockShape.HalfRamp.OffsetWedge.Horizontal.TopLeft,
  BlockShape.HalfRamp.OffsetWedge.Horizontal.TopRight,
  BlockShape.HalfRamp.OffsetWedge.Horizontal.BottomLeft,
  BlockShape.HalfRamp.OffsetWedge.Horizontal.BottomRight,
  BlockShape.HalfRamp.OffsetWedge.Vertical.TopLeft,
  BlockShape.HalfRamp.OffsetWedge.Vertical.TopRight,
  BlockShape.HalfRamp.OffsetWedge.Vertical.BottomLeft,
  BlockShape.HalfRamp.OffsetWedge.Vertical.BottomRight,
  BlockShape.Quarter.TopLeft,
  BlockShape.Quarter.TopRight,
  BlockShape.Quarter.BottomLeft,
  BlockShape.Quarter.BottomRight,
  BlockShape.CornerRamp.TopLeft,
  BlockShape.CornerRamp.TopRight,
  BlockShape.CornerRamp.BottomLeft,
  BlockShape.CornerRamp.BottomRight,
  BlockShape.Chamfer.TopLeft,
  BlockShape.Chamfer.TopRight,
  BlockShape.Chamfer.BottomLeft,
  BlockShape.Chamfer.BottomRight
] as const;

export type KnownBlockShapeId = (typeof KNOWN_BLOCK_SHAPE_IDS)[number];

const knownBlockShapeIdSet = new Set<number>(KNOWN_BLOCK_SHAPE_IDS);

export function isKnownBlockShapeId(shape: number): shape is KnownBlockShapeId {
  return knownBlockShapeIdSet.has(shape);
}

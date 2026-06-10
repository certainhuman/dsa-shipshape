import { describe, expect, it } from "vitest";
import {
  BuildChainMode,
  BuildOrder,
  Item,
  TraversalDirection
} from "../src";

describe("BuildOrder", () => {
  it("customizes stages and directions with immutable instance methods", () => {
    const baseOrder = new BuildOrder();
    const order = baseOrder
      .without(Item.EXPANDO_BOX_PACKAGED)
      .with(5, Item.EXPANDO_BOX_PACKAGED)
      .direction(5, TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);

    expect(baseOrder.items(4)).toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(baseOrder.directionOf(5)).toBe(TraversalDirection.TOP_LEFT_TO_BOTTOM_RIGHT);

    expect(order.items(4)).not.toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(order.items(5)).toContain(Item.EXPANDO_BOX_PACKAGED);
    expect(order.stageOf(Item.EXPANDO_BOX_PACKAGED)).toBe(5);
    expect(order.directionOf(5)).toBe(TraversalDirection.BOTTOM_LEFT_TO_TOP_RIGHT);
    expect(order.numStages()).toBe(5);
  });

  it("keeps static construction equivalent to new BuildOrder", () => {
    const order = BuildOrder.create({ respectTraversalOrderForBuildChains: true });

    expect(order.buildChainMode).toBe(BuildChainMode.STRICT_TRAVERSAL);
  });
});

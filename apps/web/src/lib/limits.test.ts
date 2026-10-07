import { describe, expect, it } from "vitest";
import { estimatedUpscaleSize } from "@pixelforge/shared";
import { describeError } from "@pixelforge/shared";

describe("upscale estimates", () => {
  it("multiplies both edges", () => {
    const result = estimatedUpscaleSize(800, 600, 2);
    expect(result).toEqual({ width: 1600, height: 1200, pixels: 1_920_000, withinLimit: true });
  });
});

describe("errors", () => {
  it("never uses a generic something went wrong string", () => {
    const error = describeError("NO_FACES_DETECTED");
    expect(error.userMessage.toLowerCase()).not.toContain("something went wrong");
    expect(error.action.length).toBeGreaterThan(8);
  });
});

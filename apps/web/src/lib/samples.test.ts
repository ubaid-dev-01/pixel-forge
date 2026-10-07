import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLES } from "./samples";

const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);

describe("landing sample media", () => {
  it("points every comparison at a real high-res JPEG on disk", () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(7);
    for (const sample of SAMPLES) {
      for (const src of [sample.before, sample.after]) {
        expect(src.endsWith(".jpg"), `${sample.id} ${src}`).toBe(true);
        const file = path.join(process.cwd(), "public", src.replace(/^\//, ""));
        expect(existsSync(file), `missing ${file}`).toBe(true);
        const bytes = readFileSync(file);
        expect(bytes.subarray(0, 3).equals(JPEG_SIG), `${file} is not JPEG`).toBe(true);
        expect(bytes.length, `${file} too small`).toBeGreaterThan(20_000);
      }
    }
  });
});

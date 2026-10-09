import { describe, expect, it } from "vitest";
import {
  contentDispositionHeader,
  downloadFilename,
  filenameFromContentDisposition,
  frameLoadFailure,
  isJsonContentType,
} from "./download";

describe("download responses", () => {
  it("treats only JSON as a presigned URL payload", () => {
    expect(isJsonContentType("application/json")).toBe(true);
    expect(isJsonContentType("application/json; charset=utf-8")).toBe(true);
    expect(isJsonContentType("image/png")).toBe(false);
    expect(isJsonContentType(null)).toBe(false);
  });

  it("adds an extension when the stored name has none", () => {
    expect(downloadFilename("output", "image/png")).toBe("output.png");
    expect(downloadFilename("scan.jpg", "image/jpeg")).toBe("scan.jpg");
    expect(downloadFilename("output", "image/jpeg")).toBe("output.jpg");
  });

  it("round-trips the download filename", () => {
    const header = contentDispositionHeader("output.png");
    expect(filenameFromContentDisposition(header)).toBe("output.png");
  });

  it("reserves the sample hint for landing media", () => {
    expect(frameLoadFailure("/samples/chart-before.jpg", "/samples/chart-after.jpg")).toBe("samples");
    expect(
      frameLoadFailure(
        "blob:http://localhost/preview",
        "https://store.private.blob.vercel-storage.com/u/out/file.png?download=1",
      ),
    ).toBe("result");
  });
});

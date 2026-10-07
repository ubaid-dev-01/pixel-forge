import { describe, expect, it } from "vitest";
import { extensionForMime, sanitizeOriginalName } from "./mime.js";
import { signPayload, verifyPayload } from "./hmac.js";

describe("mime validation", () => {
  it("rejects mismatched kinds", () => {
    expect(extensionForMime("image/jpeg", "video")).toBeNull();
    expect(extensionForMime("video/mp4", "image")).toBeNull();
  });

  it("maps allowed image types", () => {
    expect(extensionForMime("image/png", "image")).toBe("png");
  });

  it("strips path traversal from filenames", () => {
    expect(sanitizeOriginalName("..\\..\\windows\\system32\\photo.jpg")).toBe("photo.jpg");
  });
});

describe("webhook signatures", () => {
  it("accepts matching hmac", () => {
    const payload = JSON.stringify({ jobId: "abc" });
    const signature = signPayload("test-secret-value-32chars-long", payload);
    expect(verifyPayload("test-secret-value-32chars-long", payload, signature)).toBe(true);
  });

  it("rejects tampered payloads", () => {
    const signature = signPayload("test-secret-value-32chars-long", "{\"jobId\":\"a\"}");
    expect(verifyPayload("test-secret-value-32chars-long", "{\"jobId\":\"b\"}", signature)).toBe(false);
  });
});

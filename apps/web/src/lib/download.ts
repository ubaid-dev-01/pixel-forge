/** Private Blob URLs are not browser-readable. The dashboard streams bytes instead. */

export function isJsonContentType(contentType: string | null): boolean {
  return (contentType ?? "").toLowerCase().includes("application/json");
}

export function downloadFilename(originalName: string, mime: string): string {
  const base = originalName.replace(/[\r\n"]/g, "").trim() || "output";
  if (/\.[a-z0-9]{1,8}$/i.test(base)) return base.slice(0, 180);
  const subtype = mime.split("/")[1]?.split(";")[0]?.split("+")[0]?.trim() || "bin";
  const ext = subtype === "jpeg" ? "jpg" : subtype;
  return `${base.slice(0, 160)}.${ext}`;
}

export function contentDispositionHeader(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "") || "output";
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return encoded[1];
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header);
  return plain?.[1] ?? null;
}

/** Landing comparisons use /samples. Processed frames must not show the sample-fetch hint. */
export function frameLoadFailure(beforeSrc: string, afterSrc: string): "samples" | "result" {
  return [beforeSrc, afterSrc].some((src) => src.startsWith("/samples/")) ? "samples" : "result";
}

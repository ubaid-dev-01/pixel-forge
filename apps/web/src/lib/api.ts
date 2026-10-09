import { filenameFromContentDisposition, isJsonContentType } from "@/lib/download";

const base = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AuthorizedDownload = {
  url: string;
  filename: string;
  /** True when url is a blob: object URL that the caller must revoke. */
  objectUrl: boolean;
};

/**
 * Local API returns JSON `{ downloadUrl }` (presigned, browser-readable).
 * The Vercel route streams the private blob, because that store URL 403s in the browser.
 */
export async function fetchAuthorizedDownload(path: string, token: string): Promise<AuthorizedDownload> {
  const response = await fetch(`${base()}/api${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    if (isJsonContentType(contentType)) {
      throw (await response.json()) as { errorCode?: string; userMessage?: string };
    }
    throw { userMessage: "Download failed." };
  }
  if (isJsonContentType(contentType)) {
    const data = (await response.json()) as { downloadUrl?: string; filename?: string };
    if (!data.downloadUrl) {
      throw { userMessage: "Download URL missing." };
    }
    return { url: data.downloadUrl, filename: data.filename ?? "output", objectUrl: false };
  }
  const blob = await response.blob();
  return {
    url: URL.createObjectURL(blob),
    filename: filenameFromContentDisposition(response.headers.get("content-disposition")) ?? "output",
    objectUrl: true,
  };
}

export async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${base()}/api${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json()) as T & { errorCode?: string; userMessage?: string; action?: string };
  if (!response.ok) {
    throw data;
  }
  return data;
}

export async function fetchProviderStatus(): Promise<{
  available: boolean;
  interpolationAvailable: boolean;
  models: Record<string, string>;
  reason?: string;
  provider?: string;
}> {
  const url = `${base()}/api/health`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return { available: false, interpolationAvailable: false, models: {}, reason: "API unreachable" };
    }
    const json = (await response.json()) as { provider?: { available: boolean; interpolationAvailable: boolean; models: Record<string, string>; reason?: string } };
    return json.provider ?? { available: false, interpolationAvailable: false, models: {} };
  } catch {
    return { available: false, interpolationAvailable: false, models: {}, reason: "API unreachable" };
  }
}

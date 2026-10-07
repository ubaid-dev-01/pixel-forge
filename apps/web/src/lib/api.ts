const base = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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

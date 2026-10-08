/* PixelForge lightweight service worker — app-shell offline cache */
const CACHE = "pixelforge-shell-v3";
const PRECACHE = ["/", "/brand/icon-192.png", "/brand/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  // Never intercept API / auth / Next internals / tools (live processing)
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/gateway") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/tools") ||
    url.pathname.includes("convex")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      try {
        const response = await fetch(request);
        if (response && response.ok && request.destination === "document") {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          await cache.put(request, copy);
        }
        return response;
      } catch {
        if (cached) return cached;
        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    })(),
  );
});

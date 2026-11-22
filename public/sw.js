const SHELL_CACHE = "hanazono-offline-shell-v1";
const ASSET_CACHE = "hanazono-offline-assets-v1";
const OFFLINE_PATH = "/offline-practice";
const MAX_ASSETS = 100;

function isPracticePath(pathname) {
  return (
    pathname === "/flashcards" ||
    pathname.startsWith("/flashcards/") ||
    pathname === "/kana" ||
    pathname.startsWith("/kana/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add("/offline.html"))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith("hanazono-offline-") && !keep.has(name),
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheAsset(request, event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    event.waitUntil(
      (async () => {
        await cache.put(request, response.clone());
        const keys = await cache.keys();
        if (keys.length > MAX_ASSETS) await cache.delete(keys[0]);
      })(),
    );
  }
  return response;
}

async function loadOfflineShell() {
  const shellCache = await caches.open(SHELL_CACHE);
  return (
    (await shellCache.match(OFFLINE_PATH)) ||
    (await shellCache.match("/offline.html")) ||
    Response.error()
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const referrerPath = request.referrer
    ? new URL(request.referrer).pathname
    : "";
  const isOfflinePageAsset =
    referrerPath === OFFLINE_PATH &&
    (url.pathname.startsWith("/_next/static/") ||
      ["image", "font", "style", "script"].includes(request.destination));
  if (isOfflinePageAsset) {
    event.respondWith(cacheAsset(request, event));
    return;
  }

  if (
    request.mode === "navigate" &&
    (url.pathname === OFFLINE_PATH ||
      url.pathname === "/" ||
      isPracticePath(url.pathname))
  ) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (url.pathname === OFFLINE_PATH && response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            event.waitUntil(cache.put(OFFLINE_PATH, response.clone()));
          }
          return response;
        } catch {
          if (url.pathname === OFFLINE_PATH) return loadOfflineShell();
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match("/offline.html")) || Response.error();
        }
      })(),
    );
  }
});

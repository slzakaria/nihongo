const SHELL_CACHE = 'hanazono-offline-shell-v1';
const ASSET_CACHE = 'hanazono-offline-assets-v1';
const PAGE_CACHE = 'hanazono-offline-pages-v1';
const OFFLINE_PATH = '/offline-practice';
const MAX_ASSETS = 150;
// Each visited scenario/flashcards/kana page is cached, so a later cold offline load (not just a
// mid-session SPA navigation) still shows its real content instead of the generic offline shell.
const MAX_PAGES = 60;

// Static icons/branding assets are small, never change at runtime, and are used all over the
// chrome (navbar, PWA splash, manifest) — worth precaching upfront rather than waiting for the
// network-first cacheAsset() path to pick them up lazily.
const PRECACHE_ASSETS = [
  '/hanazono.svg',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
];

function isPracticePath(pathname) {
  return (
    pathname === '/flashcards' ||
    pathname.startsWith('/flashcards/') ||
    pathname === '/kana' ||
    pathname.startsWith('/kana/') ||
    pathname === '/scenarios' ||
    pathname.startsWith('/scenarios/')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add('/offline.html'))
      .then(() => caches.open(ASSET_CACHE))
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE, PAGE_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('hanazono-offline-') && !keep.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Evicts the oldest entry once a cache passes its cap — Cache API iterates keys() in insertion
// order, so the first key is the oldest put() still stored.
async function trimCache(cache, max) {
  const keys = await cache.keys();
  if (keys.length > max) await cache.delete(keys[0]);
}

async function cacheAsset(request, event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    event.waitUntil(
      cache.put(request, response.clone()).then(() => trimCache(cache, MAX_ASSETS)),
    );
  }
  return response;
}

async function loadOfflineShell() {
  const shellCache = await caches.open(SHELL_CACHE);
  return (
    (await shellCache.match(OFFLINE_PATH)) ||
    (await shellCache.match('/offline.html')) ||
    Response.error()
  );
}

// Network-first for practice-page navigations: always prefer a fresh copy when online (content
// does get edited), but on failure fall back to this exact page's last cached copy before giving
// up to the generic offline shell — so a page visited once is still real content offline later,
// even after closing the tab/losing the in-memory router cache.
async function handlePracticeNavigation(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).then(() => trimCache(cache, MAX_PAGES));
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const shellCache = await caches.open(SHELL_CACHE);
    return (await shellCache.match('/offline.html')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const referrerPath = request.referrer ? new URL(request.referrer).pathname : '';
  const isCachedPageAsset =
    (referrerPath === OFFLINE_PATH || isPracticePath(referrerPath)) &&
    (url.pathname.startsWith('/_next/static/') ||
      ['image', 'font', 'style', 'script'].includes(request.destination));
  if (isCachedPageAsset) {
    event.respondWith(cacheAsset(request, event));
    return;
  }

  if (request.mode === 'navigate' && isPracticePath(url.pathname)) {
    event.respondWith(handlePracticeNavigation(request));
    return;
  }

  if (request.mode === 'navigate' && (url.pathname === OFFLINE_PATH || url.pathname === '/')) {
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
          return (await cache.match('/offline.html')) || Response.error();
        }
      })(),
    );
  }
});

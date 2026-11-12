const CACHE_NAME = "adatrögzítő-modul-v5-3-anon";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles-public-anon-v4.css?v=5.3.0",
  "./app-public-anon-v4.js?v=5.3.0",
  "./data-public-anon-v4.js?v=5.3.0",
  "./cata-profiles-v4-3.js?v=5.3.0",
  "./sensory-v5-config.js?v=5.3.0",
  "./manifest.webmanifest",
  "./mate_logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isAppAsset = event.request.mode === "navigate" ||
    /\/(index\.html|app-public-anon-v4\.js|data-public-anon-v4\.js|cata-profiles-v4-3\.js|sensory-v5-config\.js|styles-public-anon-v4\.css|manifest\.webmanifest)$/.test(url.pathname);

  if (isAppAsset) {
    // Frissítéskor előbb a hálózatot próbáljuk, így nem keveredik
    // az új HTML a régi JavaScript-tel. Hálózat nélkül a gyorsítótár szolgál tartalék megoldásként.
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && (response.ok || response.type === "opaque")) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});

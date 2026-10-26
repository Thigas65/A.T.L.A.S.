"use strict";

// Increment this version whenever the cached app shell changes.
const CACHE = "atlas-shell-v12";
const CORE = ["/", "/index.html", "/app.js", "/manifest.webmanifest", "/icons/atlas-192.svg", "/icons/atlas-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("atlas-shell-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Always check deployed HTML/JS first so voice fixes and diagnostics cannot
  // be hidden by a stale service-worker cache.
  const isAppCode = url.pathname === "/" || url.pathname === "/index.html" ||
    url.pathname === "/app.js" || url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".html") || url.pathname === "/service-worker.js";

  if (isAppCode) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).then((response) => {
        if (response.ok && url.pathname !== "/service-worker.js") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || (url.pathname !== "/" ? caches.match("/") : Response.error())))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

const CACHE_NAME = "fonsprince-one-20261012163608";
const LIB_CACHE = "fonsprince-libs-v1";
const CORE_ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(CORE_ASSETS.map((u) => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== LIB_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache primeiro, atualiza em segundo plano. Bibliotecas externas (React, Firebase)
// ficam numa cache própria que não é apagada a cada atualização da app.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const external = url.origin !== self.location.origin;
  const isLib = external && /(cdnjs\.cloudflare\.com|gstatic\.com)/.test(url.hostname);
  if (external && !isLib) return;
  const cacheName = isLib ? LIB_CACHE : CACHE_NAME;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: !isLib }).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const clone = res.clone();
            caches.open(cacheName).then((c) => c.put(event.request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Lembrete diário por push (ver fonsprince-notify-server): mostra a notificação
// recebida mesmo com a app completamente fechada.
self.addEventListener("push", (event) => {
  let data = { title: "Fonsprince One", body: "Separe 5 minutos para registar os seus últimos gastos." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* payload não era JSON — usa o texto, se houver, como corpo */
    if (event.data) {
      try {
        data.body = event.data.text();
      } catch {}
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: "fonsprince-daily-reminder",
    })
  );
});

// Ao tocar na notificação, abre a app (ou foca a aba já aberta).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./index.html");
    })
  );
});

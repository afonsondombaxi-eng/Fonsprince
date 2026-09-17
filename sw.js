const CACHE_NAME = "fonsprince-one-v1";
const CORE_ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => cached);
    })
  );
});

/* Verificação em segundo plano (melhor esforço, só Chrome/Android com a app
   instalada e uso frequente — a Apple não suporta isto em Safari/iOS). Como
   o service worker não tem acesso aos dados da app (guardados no localStorage
   da página, não visível aqui), mostra um lembrete genérico a convidar a
   abrir a app, que então faz a verificação completa. */
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "fonsprince-check-alerts") {
    event.waitUntil(
      self.registration.showNotification("Fonsprince One", {
        body: "Pode haver contas a vencer ou orçamentos no limite — abra a app para ver.",
        icon: "./icon-192.png",
      })
    );
  }
});

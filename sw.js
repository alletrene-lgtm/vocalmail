// VocalMail Service Worker — v4
// Incrémentez CACHE_NAME à chaque déploiement pour forcer le rechargement
const CACHE_NAME = 'vocalmail-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-192-maskable.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './logo_VocalMail.png'
];

self.addEventListener('install', e => {
  // Forcer l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  // Supprimer TOUS les anciens caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('Suppression ancien cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const c = r.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

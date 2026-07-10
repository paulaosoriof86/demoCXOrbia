/* CXOrbia · Service Worker mínimo — habilita instalación PWA y caché básico offline.
   network-first para SIEMPRE preferir la versión más reciente de cada archivo;
   la caché es solo respaldo offline. Al subir CX_CACHE se purga la caché anterior
   (evita servir módulos viejos/rotos — p.ej. una Academia cacheada corrupta). */
const CX_CACHE = 'cxorbia-v3-tya-source-safe-preview';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    /* purga cachés de versiones anteriores */
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CX_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  /* network-first: usa red, cae a caché solo si no hay conexión */
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CX_CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
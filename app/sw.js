/* CXOrbia · Service Worker mínimo — habilita instalación PWA y caché básico offline.
   network-first para SIEMPRE preferir la versión más reciente de cada archivo;
   la caché es solo respaldo offline. Los assets críticos del runtime legal protegido
   son network-only/fail-closed: nunca pueden caer a una copia vieja de CacheStorage.
   P1 (V98 instrucciones exactas) + pendiente #11 (paquete genérico 20260711):
   BUILD_ID ya NO se define aquí de forma independiente — se importa desde
   core/build-lock.js, la ÚNICA fuente del valor, para que la app y el Service
   Worker nunca puedan desincronizarse mostrando/usando dos IDs distintos.
   Bloque 1 (V103, 20260711): confirmado que este archivo (sw.js) está
   declarado como EXCLUIDO del manifest de source lock (docs/MANIFEST-V103-
   CORRECCION.json → exclusionesDeclaradas) y NO aparece en su files[] —
   evita la referencia circular de hashear un archivo que a su vez importa
   el propio BUILD_ID derivado de ese manifest. */
importScripts('core/build-lock.js');
const CX_CACHE = 'cxorbia-'+CX_BUILD_ID;
const CX_FAIL_CLOSED_PATHS = new Set([
  '/index-backend-dev.html',
  '/adapters/cxorbia-command-adapter-v1.js',
  '/adapters/cxorbia-legal-acceptance-durable-contract-v1.js',
  '/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js',
  '/adapters/cxorbia-legal-runtime-http-v1.js'
]);
const isFailClosedRequest = request => {
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin && CX_FAIL_CLOSED_PATHS.has(url.pathname);
  } catch (_) { return false; }
};
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    /* Purga cachés de versiones anteriores y elimina cualquier copia crítica que
       hubiera quedado en el namespace actual antes de este fix. */
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CX_CACHE).map(k => caches.delete(k)));
    const current = await caches.open(CX_CACHE);
    const requests = await current.keys();
    await Promise.all(requests.filter(isFailClosedRequest).map(request => current.delete(request)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  /* I3 legal P0: estas rutas participan en la construcción de una aceptación
     durable. Si la red falla deben fallar cerradas, nunca ejecutar un builder,
     caller o entrypoint obsoleto recuperado de CacheStorage. */
  if (isFailClosedRequest(e.request)) {
    e.respondWith(fetch(e.request, { cache:'no-store' }));
    return;
  }

  /* Resto del producto: network-first, cae a caché solo si no hay conexión. */
  e.respondWith(
    fetch(e.request).then(res => {
      /* nunca cachear errores — un 4xx/5xx cacheado serviría un error offline como si fuera contenido válido */
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CX_CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      }
      return res;
    }).catch(async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      if (e.request.mode === 'navigate') {
        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><title>Sin conexión</title></head><body style="font-family:sans-serif;text-align:center;padding:15vh 20px;color:#475569"><h2>📡 Sin conexión</h2><p>No se pudo cargar esta página y no hay una versión guardada localmente. Conéctate a internet e inténtalo de nuevo.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
      return Response.error();
    })
  );
});

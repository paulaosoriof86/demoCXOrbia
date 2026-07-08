# Empalme controlado V91 - Batch 2 PWA/cache CXOrbia

Fecha: 2026-07-08  
Fuente: `Prototype development request CXOrbia V91.zip`  
SHA256 fuente: `c6fe10ebcdd379a98f3cfb38065434321933cbf4fe4755df50ec8fe2f1cad6f8`  
Estado: empalme parcial controlado, no produccion.

## 1. Objetivo

Continuar el empalme incremental sobre V91, priorizando el ajuste de Service Worker/cache que Claude preparo para evitar que el navegador siga sirviendo modulos viejos o rotos.

Este bloque se hace porque V91 es la baseline auditada de continuidad incremental. Lo que falta se documenta y corrige por bloques, sin retroceder de version.

## 2. Archivo actualizado

- `app/sw.js`

## 3. Que cambio

Se empalmo el Service Worker de V91:

- sube cache de `cxorbia-v1` a `cxorbia-v2`;
- mantiene `network-first` para priorizar la version mas reciente de archivos;
- en `activate`, purga caches anteriores distintas a `CX_CACHE`;
- conserva `self.skipWaiting()` y `self.clients.claim()`;
- conserva cache solo como respaldo offline.

## 4. Por que se empalma

Durante la auditoria V91, Claude indico que parte del problema de Academia podia estar agravado por cache, porque el navegador podia seguir sirviendo una version vieja de un modulo.

Este ajuste ayuda a que, despues del deploy futuro, el navegador prefiera los archivos nuevos y no mantenga una Academia o modulos obsoletos en cache.

## 5. Que NO se empalmo en este batch

No se reemplazo `app/app.js` porque:

- no se identifico todavia un cambio funcional indispensable que justifique reemplazo total;
- el empalme masivo puede generar regresiones no visibles sin smoke;
- el ajuste critico de cache estaba en `app/sw.js`;
- se mantiene la metodologia incremental y auditable.

No se tocaron todavia:

- `app/modules/academia.js`;
- modulos con copy P0 residual;
- docs viejos del ZIP;
- core config vivo.

## 6. Pendientes vivos despues del batch

1. Smoke visual de Diagnostico y Administrabilidad.
2. Verificar que el nuevo Service Worker no rompa PWA/offline.
3. Resolver copy P0 residual.
4. Resolver Academia admin actions visibles.
5. Verificar `Crear con IA` de Academia.
6. Revisar Finanzas/Pagos para copy honesto.
7. Revisar HR/integraciones/correo para copy honesto.
8. Mantener V91 como baseline incremental para siguientes batches.

## 7. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron de cache network-first reusable para otros clientes.
- Exclusivo cliente: no. No contiene datos TyA ni logica cliente unica.
- Claude/prototipo: si. Reduce riesgo de ver modulos viejos al probar una candidata.
- Academia: si. Ayuda a validar que Academia vista sea la version vigente, pero no resuelve admin actions.
- Sin impacto Claude: no. Impacta pruebas visuales de prototipo.

## 8. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.

# Cambios - Empalme controlado V91 Batch 2 PWA/cache

Fecha: 2026-07-08  
Bloque: empalme controlado Service Worker V91  
Estado: completado parcial, seguro y documentado.

## Archivo actualizado

1. `app/sw.js`
   - Origen: candidata V91.
   - Cambio: cache versionada de `cxorbia-v1` a `cxorbia-v2`.
   - Cambio: estrategia network-first explicita.
   - Cambio: purge de caches anteriores en `activate`.
   - Proposito: evitar que navegadores sigan sirviendo modulos viejos o rotos, especialmente Academia.

## Decision tecnica

Se empalmo `app/sw.js` porque el ajuste es acotado, reusable y directamente relacionado con el riesgo de cache detectado en la candidata.

No se empalmo `app/app.js` en este batch porque no se confirmo un cambio indispensable que justifique reemplazo total. Se mantiene pendiente de revision/smoke para evitar regresiones.

## Pendientes derivados

- Smoke visual de PWA/cache.
- Verificar Diagnostico y Administrabilidad en navegacion admin.
- Resolver Academia admin actions visibles.
- Corregir copy P0 residual.
- Revisar Finanzas/Pagos, HR/integraciones/correo.

## Estado seguro

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

# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado backend:** `I4A_VISIBLE_SMOKE_HOLD_CONSUMED__NO_PRODUCT_UI_DEFECT_PROVEN__RETRY_AUTH_NEXT`

## Conectado/probado

I1/I2/I3 permanecen PASS/frozen. La Shopper DEV dedicada sintética/no histórica sigue provider-verificada con claims/profile/membership/crosswalk/provider ACK/provenance exactos.

El primer visible smoke I4-A fue consumido: run `32278013553`, artifact `9374808032`. Prelogin PASS; 1 Auth password update; 1 login. El run hizo timeout antes de llegar a cualquier superficie visible. No hubo Firestore writes ni submits ni HR/Make/Gemini/pagos/deploy/merge/producción.

## Frontend / Claude

**No hay P0 frontend demostrado. No parchar módulos.** El fallo se clasifica primero como mecanismo de harness; el producto no alcanzó una superficie reproduciblemente defectuosa.

P1/observabilidad para una futura revisión de frontend, no bloqueante y no autorizado como parche en este bloque:
- `app/app.js`: registra Service Worker y recarga una vez al recibir `controllerchange`;
- `app/sw.js`: `skipWaiting()` + `clients.claim()` puede tomar control de un contexto nuevo;
- el E2E I3 PASS bloquea Service Workers y el smoke I4-A no lo hizo.

Antes de atribuir regresión al producto, repetir una sola vez bajo gate nuevo con harness estabilizado y checkpoints Auth/membership. Solo si entonces aparece un defecto visible, documentarlo por archivo/módulo.

## Pendientes visibles I4-A

Documentos/instrucciones, visitas disponibles, control/estado de postulación, notificaciones y presentación de certificación nueva siguen sin evidencia del run actual.

## Siguiente gate

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`

No autorizado todavía.

## Academia

No cambiar manuales/cursos/rutas/notificaciones por este HOLD. Esperar evidencia visible estable.

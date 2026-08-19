# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4A_VISIBLE_SMOKE_HOLD_CONSUMED__SOURCE_TRUTH_RECONCILED`

## Bloque ejecutado

Se consumió exactamente una vez `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.

Preparación provider-backed: identidad DEV dedicada exacta verificada; claims/profile/membership/crosswalk/provider ACK/provenance PASS. Se ejecutó 1 Auth password update efímero para el login visible y 1 intento de login. Run `32278013553`, job `96149872897`, artifact `9374808032`, digest `sha256:b91f3bd3b1ce05303e426a45e98bd13372e6933499fc2548a98db8daa9a47437`.

El navegador hizo timeout esperando el estado autenticado Shopper + membership verificada antes de alcanzar documentos, disponibles, postulación/estado, notificaciones o certificación. Raw decision: `HOLD_I4A_VISIBLE_SHOPPER_LIFECYCLE_SMOKE_MECHANISM_OR_RUNTIME_FAILURE`.

## Adjudicación de causa

`PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN`.

La diferencia de harness más relevante frente al E2E I3 congelado es Service Worker: I3 usa `serviceWorkers:'block'`; el smoke I4-A permitió SW. En producto, `app/app.js` registra SW y recarga una vez con `controllerchange`; `app/sw.js` hace `skipWaiting()` y `clients.claim()`. Esto hace plausible una interrupción del primer login en un contexto automatizado nuevo. Como el run no capturó el evento directamente, se documenta como hipótesis de mecanismo respaldada por fuente, no como P0 de producto.

## Seguridad

Historical Shopper `0`; otras identidades modificadas `0`; Auth create/claims/delete `0`; Firestore writes `0`; postulación/certificación/reservas `0`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0/false`; credenciales crudas no exportadas.

## Archivos de cierre

- evidencia durable `app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-HOLD-LATEST.json`;
- request visible smoke marcado consumido/HOLD/no retry;
- one-shot workflow retirado del HEAD;
- verifier actualizado al nuevo `SYNC_EPOCH`, evidencia y frontier;
- Execution State, índice, source lock, checkpoint, Plan Unificado, Plan Lock, CAMBIOS, RESUMEN y PENDIENTES sincronizados en un solo cierre canónico.

## Avance Phase A

**60% / 40%**. I4 continúa `0/25` porque no se obtuvo evidencia de las superficies visibles.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS` — requiere autorización nueva.

## Clasificación

- **Reusable CXOrbia:** separar fallo de harness de defecto de producto; bloquear/estabilizar SW en E2E; checkpoints por fase; one-shot no auto-retry.
- **Exclusivo TyA:** identidad dedicada/scope y evidencia de este run DEV.
- **Claude/prototipo:** no parche UI; P1 potencial de observabilidad/hardening `app/app.js` + `app/sw.js`, sin P0 probado.
- **Academia:** sin actualización funcional por falta de evidencia visible.
- **Sin impacto Claude:** cierre backend/source-truth, request/evidence/verifier.

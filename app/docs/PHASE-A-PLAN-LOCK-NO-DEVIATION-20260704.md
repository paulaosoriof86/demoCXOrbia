# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `ACTIVO__I3_FROZEN_PASS__I4A_VISIBLE_SMOKE_CONSUMED_HOLD__RETRY_AUTH_NEXT`

## Lock

Secuencia: I1 → I2 → I3 → I4 → I5. No reinicio ni reproceso sin regresión reproducible. Un gate one-shot consumido no se repite automáticamente por fallo de harness.

## Avance

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS`; I5 `0/15`. **60% / 40%.**

## Frozen

I1/I2/I3; Historical Shopper; TARGET_B Admin; HR `15/660`; Finance V2/historical; legal V0.4; clasificación Auth existente I4-A; creación de identidad test dedicada; primer visible smoke I4-A.

## I4-A

Identidad habilitadora PASS y preservada. Visible smoke #1 consumido: run `32278013553`, artifact `9374808032`, prelogin exacto PASS, 1 password update, 1 login, timeout antes de superficies, cero writes operativos. Clasificación: `PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN`.

Siguiente: `NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`. Requiere autorización nueva; un solo retry visible DEV; misma identidad; harness con Service Worker estabilizado/bloqueado y checkpoints Auth/membership; no submits.

## I4 restante

I4-B visita; I4-C HR bidireccional sin duplicación; I4-D liquidaciones/pagos/histórico/junio; I4-E multi-proyecto/no-code; I4-F Academia.

## I5

Freeze → manifest/build-lock/verifier → preproducción/rollback → same-build E2E → P0/P1/P2 → autorización expresa → cutover → smoke → baseline productivo.

## Anti-desvío

Un objetivo real por iteración, evidencia, decisión, reconciliación atómica. Mismatch => STOP.

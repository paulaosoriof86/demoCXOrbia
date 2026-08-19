# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Última sincronización:** 2026-08-19 10:04 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21`  
**Estado:** `ACTIVO__I3_FROZEN_PASS__I4A_DEDICATED_TEST_SHOPPER_PASS__VISIBLE_SMOKE_NEXT`

## Lock

Secuencia: I1 → I2 → I3 → I4 → I5. No reinicio ni reproceso sin regresión reproducible.

## Avance

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS`; I5 `0/15`. **60% / 40%.**

## Frozen

I1/I2/I3; Historical Shopper; TARGET_B Admin; HR `15/660`; Finance V2/historical; legal V0.4; clasificación Auth existente I4-A consumida; creación de identidad test dedicada I4-A consumida.

## I4-A

Habilitador PASS: una única Shopper DEV sintética/no histórica con scope/role/membership/profile/crosswalk/claims/provenance exactos y provider ACK. Verificación run `32273818536`.

Siguiente: `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`. Requiere autorización nueva; un solo visible smoke DEV; no login antes de gate.

## I4 restante

I4-B visita; I4-C HR bidireccional sin duplicación; I4-D liquidaciones/pagos/histórico/junio; I4-E multi-proyecto/no-code; I4-F Academia.

## I5

Freeze → manifest/build-lock/verifier → preproducción/rollback → same-build E2E → P0/P1/P2 → autorización expresa → cutover → smoke → baseline productivo.

## Anti-desvío

Un objetivo real por iteración, evidencia, decisión, reconciliación atómica. Mismatch => STOP.

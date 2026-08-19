# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__AUTH_NEXT`

## Carril vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` en curso/no puntuado; I5 `0/15`. **60% completado / 40% pendiente.**

## I3 — congelado / no reabrir

Final Staff/Admin run `32196648462`, job `95901931320`, artifact `9346121436`; identityMap `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`; agosto `2/0`; duplicados `0/0`; reload/nueva pestaña estables; Historical Shopper y safety en cero. Esa identidad no se reutiliza para I4 Shopper.

## I4-A — bloque actual cerrado en HOLD

Bloque: `I4A_RESOLVE_EXISTING_NONHISTORICAL_TEST_SHOPPER_IDENTITY_FROM_FROZEN_EVIDENCE__READONLY_NO_LOGIN`.

Decisión: `HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`.

La revisión de evidencia congelada/source-safe probó que los diagnósticos previos preservan población, actividad, linking y procedencia mediante fingerprints/agregados, pero no exportan un principal DEV individual (`shopperId`/login/UID) cuya condición test/no histórica pueda reproducirse. Los IDs de plantillas source-safe tampoco representan identidades conectadas. Por seguridad no se elige un ID recordado o inferido.

Este HOLD no significa que el producto falle ni que no exista una identidad sintética; significa que el repo congelado no permite adjudicarla de forma reproducible sin una lectura provider/Auth separada.

## Seguridad

Cero login Shopper, selección/exposición de credenciales, acceso al Shopper histórico, provider reads, user create/reset, provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes, Hosting/Cloud Run deploys, merge o producción.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Requiere autorización explícita. Debe limitarse a metadata provider/Auth para clasificar una identidad Shopper existente test/no histórica; no puede iniciar sesión, leer/mostrar credenciales, consultar perfil/histórico, escribir, desplegar, mergear ni producir.

Solo después de un PASS de clasificación podrá solicitarse una autorización distinta para una única observación visible I4-A DEV.

## Claude / Academia

Sin parche frontend. Sin cambio de Academia todavía: no se validó ni cambió comportamiento operacional visible de instrucciones, certificación o notificaciones.

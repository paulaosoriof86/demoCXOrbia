# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `LOCKED__I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__AUTH_NEXT__NO_PRODUCTION`

## Carril vigente

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR: #7 draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

No crear nueva rama/PR/candidata/metodología. No usar workaround UI. No merge ni producción sin gate explícito.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` integral/frozen; I4 `0/25` en curso/no puntuado; I5 `0/15`. **60% completado / 40% pendiente.**

## Frozen / no reprocesar

I1/I2/I3 completo; Historical Shopper; TARGET_B Admin; Rules I3.11C; focal provider; Hosting identityMap; Staff final; HR `15/660`; Finance V2/historical; legal V0.4. No repetir I3 ni usar el Shopper histórico para I4.

## I4-A — resolución de identidad segura

Bloque ejecutado: `I4A_RESOLVE_EXISTING_NONHISTORICAL_TEST_SHOPPER_IDENTITY_FROM_FROZEN_EVIDENCE__READONLY_NO_LOGIN`.

Decisión: `HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`.

Causa única: las evidencias congeladas/source-safe inspeccionadas contienen fingerprints, cardinalidades y clasificación de población, pero deliberadamente no exportan raw login/email/UID ni un `shopperId` DEV que quede probado como sintético/test/no histórico. Por tanto no se selecciona una identidad por memoria, similitud o inferencia.

Evidencia revisada:
- `backend/config/corte6-shopper-equivalent-universe-source-only-request.json`.
- `backend/config/corte6-shopper-group-provenance-source-only-request.json`.
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`.
- `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json`.

El artefacto de universo equivalente preserva `populationEquivalent`, `activityEquivalent`, `linkingEquivalent`, `completenessEquivalent` y `deltaOnlyMemberProvenance`, pero su salida sigue source-safe y no individualiza un principal apto para login visible I4-A.

## Seguridad del bloque

Shopper runtime `0`; login `0`; selección/exposición de credenciales `0`; Historical Shopper access `0`; provider reads `0`; provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes `0`; deploys `0`; user/password changes `0`; merge `false`; production `false`.

## Siguiente gate exacto

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Objetivo único: clasificar un principal Shopper **ya existente** en DEV como seguro test/no histórico mediante metadata provider/Auth read-only, sin login, sin credenciales, sin consultar perfil/histórico, sin writes ni deploy. No está autorizado aún.

## Clasificación

- **Reusable CXOrbia:** principio de test identity con provenance explícita y fail-closed.
- **Exclusivo TyA:** clasificación inicial del principal DEV apto para la prueba visible I4-A.
- **Claude/prototipo:** sin parche UI.
- **Academia:** sin cambio de curso/manual porque aún no se validó comportamiento visible nuevo.
- **Sin impacto Claude inmediato:** bloque read-only/source evidence.

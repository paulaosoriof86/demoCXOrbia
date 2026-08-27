# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F5-LIVE-SYNTHETIC-ACCEPTANCE-PASS-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F6_PHASE_A_IMMUTABLE_RELEASE`  
**currentMasterStep:** `F5_LIVE_SYNTHETIC_ACCEPTANCE_CLOSED_PASS`  
**M1:** `CLOSED_PASS`  
**M2/F0:** `CLOSED_PASS_4_OF_4`  
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`  
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`  
**F4:** `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**NEXT:** `F6_PHASE_A_IMMUTABLE_RELEASE`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `86/100`

## Autoridad canónica viva

1. master plan V1.1 congelado, blob `0ea2cd9802e687938086886d8d03648f105a7d64`;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema 3.5.0;
3. `app/docs/evidence/RC15-F5-LIVE-SYNTHETIC-ACCEPTANCE-LATEST.json`;
4. `backend/config/cxorbia-f5-synthetic-acceptance-authority.json` y execute consumido;
5. evidencia terminal F4/F3/M3 conservada por referencia;
6. checkpoint, progress lock, Claude y Pendientes como mirrors;
7. PR #7 permanece mirror-only, cerrado y no mergeado.

## F5 cerrado PASS

Run `33085990980`, attempt 1, sobre HEAD `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`:
- 1 Cloud Build y 1 Cloud Run update;
- Cloud Run `cxorbia-live-hr-dev-00013-rns`, 100% tráfico;
- digest `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- lifecycle sintético Phase A completo PASS;
- cleanup obligatorio PASS;
- residuo post-clean cero en visits, postulations, receipts, audit, shoppers, users y artifacts de actores;
- Auth sintético residual cero;
- datos reales, HR externa, pagos, Rules, Storage, Make, Gemini, Hosting deploy y merge = 0.

El one-shot F5 queda consumido e inertizado. El gate runtime tiene expiración server-side `2026-08-27T15:53:16.136Z`; no existe autorización para extenderlo o reejecutarlo.

## Hallazgo de mecanismo no bloqueante

El predeploy read-only paralelo `33085991102` falló al iniciar el servicio local sin `firebase-admin`. Se clasifica `MECHANISM_P1_NON_BLOCKING`: no hizo provider mutation ni deploy y no invalida F5.

## Siguiente exacto

`F6_PHASE_A_IMMUTABLE_RELEASE`.

F6 debe congelar el release exacto mediante manifest, hashes, revisión/digest, receipts, fingerprints y readbacks. No reabrir F5 ni emitir otro Build/Cloud Run update por inferencia.

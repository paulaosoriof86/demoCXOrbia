# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`
**F3_PROMOTION_EPOCH:** `RC15-F3-PROVIDER-PROMOTION-20260826-01`
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**currentMasterPhase:** `F3_CLOSED_PASS`
**currentMasterStep:** `G2-B_WAITING_EXPLICIT_AUTHORIZATION`
**M1:** `CLOSED_PASS`
**M2/F0:** `CLOSED_PASS_4_OF_4`
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`
**NEXT:** `G2-B_WAITING_EXPLICIT_AUTHORIZATION`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `76/100`

M3 está terminal y no se reabre sin drift probado del universo M2. F3 quedó certificado estrictamente read-only: no ejecutó provider read/write, deploy ni G2-B.

## Autoridad canónica viva

1. master plan V1.1 congelado y su hash;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `backend/config/cxorbia-provider-promotion-mechanism-v1.json` (blob `f1c265164b7bc697ecb5cd9b247c334afd76a5f2`);
4. `app/docs/evidence/RC15-F3-PROVIDER-PROMOTION-MECHANISM-LATEST.json`;
5. `tools/continuity/validate-cxorbia-f3-provider-promotion-mechanism-v1.js`;
6. evidencia M3 terminal + tombstones + consumed ledger + aliases;
7. checkpoint/Claude/Pendientes como mirrors;
8. progress lock para porcentaje real.

## Camino crítico congelado

F3 cerrado → F4 G2-B one-shot → F5 aceptación sintética → F6 release inmutable → F7 readiness → F8 cutover → F9 postproducción.

Siguiente: `G2-B_WAITING_EXPLICIT_AUTHORIZATION`. La autorización provider/recovery y el lease single-use siguen ausentes. Retry futuro máximo 1 únicamente después de autorización explícita vigente. PR #7 permanece cerrado/no mergeado y no es autoridad de ejecución.

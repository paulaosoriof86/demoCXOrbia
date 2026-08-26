# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**currentMasterPhase:** `M3_CLOSED_PASS`
**currentMasterStep:** `M4_F3_PROVIDER_PROMOTION_MECHANISM_AND_G2B_RECOVERY_LANE_READONLY_CERTIFICATION`
**M1:** `CLOSED_PASS`
**M2/F0:** `CLOSED_PASS_4_OF_4`
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`
**NEXT:** `M4_F3_PROVIDER_PROMOTION_MECHANISM_AND_G2B_RECOVERY_LANE_READONLY_CERTIFICATION`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `74/100`

M3 está terminal y no se reabre sin drift probado del universo M2. Los 30 HOLD históricos están terminales; cola residual `0`; Batch 4 prohibido.

## Autoridad canónica viva

1. master plan V1.1 congelado y su hash;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `backend/config/cxorbia-m3-direct-readback-gate.json`;
4. `backend/config/cxorbia-historical-authority-tombstones.json`;
5. consumed ledger + aliases;
6. `app/docs/evidence/RC15-M3-TERMINAL-13-READBACK-LATEST.json` + evidencia M2/M3;
7. checkpoint/Claude/Pendientes como mirrors;
8. progress lock para porcentaje real.

Readback M3 terminal: materialización `6ae1b835abd7e13deb05fd59b9226538949d1a64`, tree `f24202de1b1c9c4207f7274412c5ea65d31d92bf`, remoto exacto PASS. PR #7 cerrado/no mergeado. GitHub Actions no autoriza avance.

## Camino crítico congelado

F3 `PROVIDER_PROMOTION_MECHANISM_V1` + `G2B_RECOVERY_LANE_PASS` → F4 G2-B one-shot → F5 aceptación sintética → F6 release inmutable → F7 readiness → F8 cutover → F9 postproducción.

F3 es read-only. No existe autorización provider/recovery vigente. No crear nueva auditoría general, metodología, rama, PR, candidata o workflow para sustituir causa raíz.

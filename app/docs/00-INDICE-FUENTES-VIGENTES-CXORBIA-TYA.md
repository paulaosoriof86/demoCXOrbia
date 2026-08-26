# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY`
**currentMasterStep:** `M3_TERMINAL_13_CLOSURE`
**M1:** `CLOSED_PASS`
**M2/F0:** `CLOSED_PASS_4_OF_4`
**M3_0:** `CLOSED_PASS_DIRECT_GITHUB_READBACK`
**M3:** `17_OF_30_TOMBSTONED__13_TERMINAL_PENDING`
**NEXT:** `M3_TERMINAL_13_CLOSURE`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `69/100`

V1.1 congela el camino crítico acelerado. `M3_FINITE_QUEUE_BATCH_1` y `M3_FINITE_QUEUE_BATCH_2` permanecen cerrados y no se repiten. No existe Batch 4. Los 13 residuales del universo M2 se resuelven una sola vez en `M3_TERMINAL_13_CLOSURE`.

PR #7 permanece `closed`, `draft`, `unmerged`. Rama viva única: `docs-tya-v6-v71-audit`. GitHub Actions es telemetría no autoritativa.

## Autoridad canónica viva

1. master plan V1.1 congelado y su hash;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `app/docs/evidence/PLAN-CHANGE-REQUEST-PRODUCTION-ACCELERATION-LATEST.json`;
4. quiescence lock terminal + direct-readback gate;
5. tombstones + consumed ledger + aliases;
6. evidencia M2/M3/Batch1/Batch2 + validator authority;
7. checkpoint/execution/source lock/Claude/Pendientes como mirrors;
8. progress lock para porcentaje real.

## Camino crítico congelado

`M3_TERMINAL_13_CLOSURE` → F3 `PROVIDER_PROMOTION_MECHANISM_V1` + `G2B_RECOVERY_LANE_PASS` → F4 G2-B one-shot → F5 aceptación sintética → F6 release inmutable → F7 readiness → F8 cutover → F9 postproducción.

No nueva auditoría general, metodología, rama, PR, candidata o workflow para sustituir causa raíz. Cualquier cambio de plan requiere otro `PLAN_CHANGE_REQUEST` explícito y atómico.

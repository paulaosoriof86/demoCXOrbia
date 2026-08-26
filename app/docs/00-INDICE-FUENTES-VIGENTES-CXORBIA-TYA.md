# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `M3_BATCH2_MATERIALIZED_READBACK_PENDING`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `17_OF_30_TOMBSTONED_PENDING_BATCH2_READBACK`  
**NEXT:** `M3_FINITE_QUEUE_BATCH_2_READBACK_PENDING`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `69/100`

## Regla de continuidad prevalente

M1/M2 y M3-0 no se reabren. Batch 1 está `CLOSED_PASS_DIRECT_REMOTE_READBACK`. Batch 2 neutraliza CP124, CP125, CP127, CP130 y CP131 en un único commit; no puede considerarse cerrado hasta que el HEAD remoto coincida exactamente con ese commit y el receipt terminal sea materializado.

PR #7 permanece `closed`, `draft`, `unmerged`. La rama viva única es `docs-tya-v6-v71-audit`. GitHub Actions es telemetría no autoritativa.

## Autoridad canónica viva

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — congelado, no modificar.
3. `backend/config/cxorbia-m3-quiescence-lock.json` — `CLOSED_PASS`.
4. `backend/config/cxorbia-m3-direct-readback-gate.json`.
5. `backend/config/cxorbia-historical-authority-tombstones.json`.
6. `backend/config/cxorbia-consumed-one-shot-gates.json` + aliases.
7. evidencia M2/M3/Batch 1/Batch 2 + validator authority.
8. checkpoint/execution/source lock/Claude/Pendientes como mirrors.
9. `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md` para porcentaje ejecutivo.

## Batch 2

Familia basada en evidencia F0 Tranche 11/12: source writers/materializers históricos y provider/deploy primitives históricas. Los scripts quedan fail-closed desde la primera instrucción; el request V105/V106 queda `authorized=false`, `consumed=false`, `currentExecutionAuthority=false`, `replayAuthorized=false`. No hubo ejecución.

## Siguiente exacto

`M3_FINITE_QUEUE_BATCH_2_READBACK_PENDING`: resolver HEAD remoto, comparar delta, confirmar PR #7 cerrado/no mergeado, cero workflow/core/modules/provider-runtime funcional, cero provider/data/deploy; luego cerrar receipt y avanzar a Batch 3 con 13 residuales si todo coincide.

Histórico de continuidad: `M3_FINITE_QUEUE_BATCH_1` permanece cerrado y no se repite.

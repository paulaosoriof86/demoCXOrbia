# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `M3_0_CLOSED_PASS`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `3_OF_30_TOMBSTONED + M3_0_QUIESCENCE_CLOSED_PASS`  
**NEXT:** `M3_FINITE_QUEUE_BATCH_1`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `69/100`

## Regla de continuidad prevalente

M1 y M2 no se reabren. M3-0 queda terminal `CLOSED_PASS` y no se reaudita por cambio de conversación. La cola finita conserva 27 residuales y debe continuar por lotes atómicos, no por 27 iteraciones humanas independientes.

PR #7 permanece `closed`, `draft`, `unmerged` durante la cola M3 para eliminar fan-out `pull_request`. No crear otra rama ni PR. La rama viva sigue siendo `docs-tya-v6-v71-audit`.

## Autoridad source-only M3

GitHub Actions deja de ser autoridad de ejecución durante M3. El source-only gate vigente es `tools/continuity/validate-cxorbia-m3-direct-readback.js` + `backend/config/cxorbia-m3-direct-readback-gate.json`, sustentado por readback remoto directo. Actions queda como telemetría no autoritativa.

La prueba final M3-0 produjo exactamente un run automático, el checkpoint canónico, pero GitHub lo marcó failure mientras su único job seguía queued, con cero steps y sin runner. No hubo workflow histórico inesperado, commit bot, provider/data/deploy ni cambio funcional frontend. Esto se clasifica como degradación del transporte Actions, no como fallo de fuente.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
3. `backend/config/cxorbia-m3-quiescence-lock.json` — terminal `CLOSED_PASS`.
4. `backend/config/cxorbia-m3-direct-readback-gate.json`.
5. `app/docs/evidence/RC15-M3-0-QUIESCENCE-BARRIER-LATEST.json`.
6. evidencia M2/F0 + evidencia M3 + validator authority + tombstones + consumed ledger + aliases.
7. checkpoint/execution/source lock y mirrors obligatorios.
8. `app/docs/PRODUCTION-REAL-PROGRESS-LOCK-CXORBIA-TYA.md` para el porcentaje ejecutivo real.

## Siguiente exacto

`M3_FINITE_QUEUE_BATCH_1`: seleccionar una familia finita del universo M2 bloqueado, inertizar workflow/request/authority de esa familia en un único commit, hacer readback remoto directo, demostrar reducción exacta de residuales y cero provider/data/deploy, y encadenar el receipt al siguiente lote.

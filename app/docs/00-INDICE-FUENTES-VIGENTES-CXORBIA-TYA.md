# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M1-STATE-SYNC-20260825-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**M1:** `CLOSED_PASS`  
**NEXT:** `M2_FINITE_F0_CLOSURE`  
**PHASE_A:** `98/100`

## Estado canónico reconciliado

Tramo 14 es la evidencia F0 más reciente y manda sobre mirrors anteriores: 142 hallazgos clasificados; 32 HOLD/P0 acumulados; 2 contenidos (`CP093`, `CP119`); 30 HOLD residuales; exhaustividad 2/4; workflows y workflow_dispatch clasificados; requests y provider write entrypoints aún abiertos. Nuevo HOLD: `RC15-CP-142`; CP117 abierto; CP118 drift conocido.

## Orden canónico

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/evidence/RC15-M1-CANONICAL-STATE-LATEST.json`.
4. `app/docs/evidence/RC15-F0-INVENTORY-LOCK-LATEST.json`.
5. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` + Tramo 14 detalle.
6. checkpoint/execution/source locks reconciliados.
7. addenda M1 de CAMBIOS/Claude/PENDIENTES.

`HEAD_BEFORE=6bc249a06fdeb3a5df1cdf4532e35a932e883dca`. `HEAD_AFTER` se resuelve por readback remoto del único commit M1; no se auto-incrusta.

## Siguiente exacto

`M2_FINITE_F0_CLOSURE`: cerrar solo el universo del F0_INVENTORY_LOCK hasta 4/4. No abrir Tramo 15, no tocar G2-B, no deploy/merge/provider/data/frontend writes.

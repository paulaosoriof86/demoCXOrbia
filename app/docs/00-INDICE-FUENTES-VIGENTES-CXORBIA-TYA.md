# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `MECHANISM_CERTIFIED_PASS`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación. CP011 y CP142 están inertizados sin ejecución; quedan 28 residuales.

El mecanismo M3 quedó certificado sobre el source-only gate run `32909591852`: sintaxis, master-plan freeze, autoridad canónica, state sync M3, continuity lock M3 y checkpoint Phase A pasaron. En ese HEAD hubo un único workflow push automático; el provider preflight no se autoejecutó. Provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/frontend writes = 0.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad dinámica e invariantes.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN e inmutable.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json` — certificación del mecanismo.
6. `backend/config/cxorbia-validator-authority.json` — set de validadores autoritativo M3.
7. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
8. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
9. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
10. checkpoint/execution/source lock y mirrors obligatorios.

## Regla anti-desincronización certificada

Toda materialización canónica M3 usa un único commit Git atómico + readback remoto + gate source-only. `productionState.functionalSourceLock` es el lock funcional y no se confunde con el HEAD de control-plane. Provider preflight queda manual/inert hasta M4/F3. Conversaciones, PR body, requests/event artifacts, aliases, validadores y workflows históricos nunca reactivan autoridad.

## Siguiente exacto

Consumir exclusivamente la cola finita de 28 residuales del inventario M2. No reabrir M1/M2, no Tramo 15, no nueva metodología. M4/F3 solo después de M3 `CLOSED_PASS`; G2-B sigue `RECOVERY_NO_PROVIDER_SIDE_EFFECT` y sin retry/replay.

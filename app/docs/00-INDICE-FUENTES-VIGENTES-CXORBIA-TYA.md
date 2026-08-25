# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `MECHANISM_REPAIR_APPLIED_CERTIFICATION_PENDING_READBACK`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado sobre el inventario M1: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación. M3 ya inertizó CP011 y CP142 sin ejecución: quedan 28 residuales.

La revisión de certificación detectó dos defectos reales del mecanismo anterior: el continuity lock seguía declarando F0/validadores obsoletos mientras los mirrors ya declaraban M3, y la materialización secuencial produjo 78 ejecuciones push fallidas de workflows históricos. En el HEAD pre-reparación, los cuatro workflows implicados fallaron sin jobs; el runtime run no produjo artefactos. No se observó ejecución de provider desde esas fallas.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad dinámica e invariantes.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN e inmutable.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json` — gate de certificación del mecanismo.
6. `backend/config/cxorbia-validator-authority.json` — único set de validadores autoritativo en M3.
7. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
8. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
9. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
10. checkpoint/execution/source lock, CAMBIOS-BACKEND, RESUMEN-PARA-CLAUDE y PENDIENTES-PROTOTIPO — mirrors obligatorios.

## Regla anti-desincronización

Toda materialización canónica M3 debe hacerse en **un único commit Git atómico** y pasar readback remoto antes de considerarse cerrada. No se permite Contents API secuencial para estado canónico M3. Requests, event artifacts, aliases, PR body, conversaciones, validadores históricos y workflows históricos nunca autorizan ejecución actual.

Los cuatro workflows históricos que generaron ruido push quedan inertizados: `workflow_dispatch` únicamente, `contents:read` y sin provider/data/deploy/Auth capability.

## Siguiente exacto

Primero completar readback remoto y Actions del commit atómico de reparación. Si pasa, certificar el mecanismo y continuar exclusivamente `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`. No reabrir M1/M2, no Tramo 15, no provider/data/deploy/merge/frontend writes.

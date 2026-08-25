# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `MECHANISM_REPAIR_V2_AWAITING_SOURCE_ONLY_GATE`  
**NEXT:** `M3_MECHANISM_SOURCE_ONLY_GATE` → `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`  
**PHASE_A:** `98/100`

## Estado canónico

F0 permanece cerrado sobre el inventario M1: 142 hallazgos clasificados, 32 HOLD/P0 acumulados, 2 contenidos y 30 residuales al entrar a M3; exhaustividad 4/4 y cero superficie write-capable sin clasificación. CP011 y CP142 siguen inertizados sin ejecución: quedan 28 residuales.

La certificación del mecanismo encontró dos defectos adicionales después de la primera reparación: el workflow de checkpoint todavía ejecutaba un validador pre-M3 que produjo un falso `FUNCTIONAL_SOURCE_DRIFT`, y el preflight G2-B se autoejecutaba en M3 aunque corresponde a M4/F3, fallando `G2B_SOURCE_FIREWALL_GATE_MISSING` contra un source-fix histórico. Ambos son defectos de control-plane, no del producto.

## Orden canónico vivo

1. `backend/config/cxorbia-phase-a-continuity-lock.json` — autoridad dinámica e invariantes.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` — master plan FROZEN e inmutable.
3. `app/docs/evidence/RC15-M2-FINITE-F0-CLOSURE-LATEST.json` — universo finito F0/M2.
4. `app/docs/evidence/RC15-M3-F1-F2-CANONICAL-AUTHORITY-LATEST.json` — estado operativo M3.
5. `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json` — certificación del mecanismo.
6. `backend/config/cxorbia-validator-authority.json` — único set de validadores autoritativo en M3.
7. `backend/config/cxorbia-historical-authority-tombstones.json` — cola finita e inertizaciones.
8. `backend/config/cxorbia-consumed-one-shot-gates.json` — solo ejecuciones realmente consumidas.
9. `backend/config/cxorbia-evidence-aliases.json` — aliases sin autoridad.
10. checkpoint/execution/source lock y mirrors obligatorios.

## Regla anti-desincronización

Toda materialización canónica M3 se hace en un único commit Git atómico + readback. `cxorbia-phase-a-live-checkpoint.yml` queda reducido a un gate source-only de M3 sin provider. `cxorbia-live-hr-provider-capability-preflight.yml` queda manual/inert durante M3 y no puede autoejecutarse por commits de control-plane.

Requests, event artifacts, aliases, PR body, conversaciones, validadores históricos y workflows históricos nunca autorizan ejecución actual. El source funcional congelado sigue siendo `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; los commits de docs/control-plane no constituyen drift funcional.

## Siguiente exacto

Materializar reparación V2 atómicamente, resolver HEAD por readback y exigir un único gate source-only M3. Solo con PASS se declara `MECHANISM_CERTIFIED_PASS` y se continúa la cola finita de 28 residuales. No reabrir M1/M2, no Tramo 15, no provider/data/deploy/merge/frontend writes.

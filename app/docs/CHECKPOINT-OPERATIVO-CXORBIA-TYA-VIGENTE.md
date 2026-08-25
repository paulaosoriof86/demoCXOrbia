# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `MECHANISM_REPAIR_V2_AWAITING_SOURCE_ONLY_GATE`  
**NEXT:** `M3_MECHANISM_SOURCE_ONLY_GATE`  
**PHASE_A:** `98/100`

## Evidencia nueva de causa raíz del mecanismo

La primera reparación redujo el ruido histórico, pero no podía certificarse todavía. En el HEAD `0df5cae7e4a1fe9dd968170eab27269b12a8204a` ocurrieron dos fallas reproducibles y source/control-plane:

- Run `32908444518`: 17 pasos source-safe pasaron; el único fallo fue `verify-phase-a-live-execution-checkpoint.mjs` con `FUNCTIONAL_SOURCE_DRIFT`. El script leía `functionalSourceLock` en una ubicación obsoleta y delegaba al validador de continuidad superseded.
- Run `32908444528`: el preflight G2-B se autoejecutó durante M3 y falló `G2B_SOURCE_FIREWALL_GATE_MISSING` contra el source-fix histórico `1d2cfecb...`. Esa comprobación corresponde a M4/F3, no a M3.

No se observaron provider/data/deploy writes en ninguna de las dos fallas.

## Reparación V2

- `cxorbia-phase-a-live-checkpoint.yml` pasa a ser el gate canónico source-only de M3; no instala Firebase Admin ni accede a proveedor.
- `verify-phase-a-live-execution-checkpoint.mjs` pasa a leer `productionState.functionalSourceLock` y a delegar exclusivamente a validadores M3.
- `cxorbia-live-hr-provider-capability-preflight.yml` queda `workflow_dispatch`/hold durante M3; no se autoejecuta por commits de control-plane y no tiene provider authority.
- `cxorbia-validator-authority.json` registra explícitamente estas reglas.
- La materialización V2 debe ser un único commit Git atómico y el gate source-only debe pasar sobre ese HEAD exacto.

## Avance M3 preservado

CP011 y CP142 permanecen `INERTIZED_WITHOUT_EXECUTION`; 30 → 28 residuales. No se reabre M1/M2 ni F0.

## Provider/G2-B

Cloud Run preservado `cxorbia-live-hr-dev-00011-f2f`. G2-B continúa `RECOVERY_NO_PROVIDER_SIDE_EFFECT`, retry/replay=false, providerMutationAuthorizedNow=false.

## Siguiente exacto

Aplicar la reparación V2 atómica y certificarla con el único gate M3 source-only. Si PASS, registrar `MECHANISM_CERTIFIED_PASS` y continuar inmediatamente los 28 residuales finitos. No nueva auditoría, no Tramo 15, no provider/data/deploy/merge/frontend writes.

# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**NEXT:** `M3_MECHANISM_SOURCE_ONLY_GATE`  
**PHASE_A:** `98/100`

## Cerrado y preservado

F0/M2 permanece 4/4: 142 hallazgos, 32 HOLD/P0 acumulados, 2 contenidos, 30 residuales al entrar a M3, cero superficie write-capable sin clasificar. CP011 y CP142 permanecen inertizados sin ejecución; quedan 28 residuales.

## Defectos de mecanismo tratados en V2

1. `verify-phase-a-live-execution-checkpoint.mjs` pre-M3 leía `functionalSourceLock` en la ruta equivocada y producía `FUNCTIONAL_SOURCE_DRIFT` falso ante commits de control-plane.
2. `cxorbia-live-hr-provider-capability-preflight.yml` se autoejecutaba durante M3 y validaba supuestos G2-B/M4 contra un source-fix histórico, fallando `G2B_SOURCE_FIREWALL_GATE_MISSING`.

Ambos se corrigen sin provider/data/deploy/frontend writes. El checkpoint automático queda source-only M3; el preflight proveedor queda manual/inert hasta M4/F3.

## Pendiente inmediato

Cerrar `M3_MECHANISM_SOURCE_ONLY_GATE` sobre el HEAD exacto de reparación V2. Solo después marcar `MECHANISM_CERTIFIED_PASS` y continuar exclusivamente los 28 residuales del inventario M2. CP117/CP118 no se cierran hasta cobertura/normalización finita real. No Tramo 15.

## Producto / Claude / Academia

Sin tarea frontend nueva. No parchear UI. Sin impacto funcional en Academia por esta reparación.

## G2-B

Terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. M4/F3 solo después de M3 CLOSED_PASS.

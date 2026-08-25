# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**M1:** `CLOSED_PASS`  
**M2:** `CLOSED_PASS`  
**M3:** `ACTIVE_MECHANISM_CORRECTED_2_OF_30_TOMBSTONED`  
**NEXT:** `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`  
**PHASE_A:** `98/100`

## Avance M3 comprobable

Se creó un set de validadores M3 explícitamente autoritativo para que los validadores antiguos hard-codeados a M1/M2 no vuelvan a dirigir la continuidad. La autoridad está registrada en `backend/config/cxorbia-validator-authority.json` y el gate canónico es `tools/continuity/validate-cxorbia-canonical-authority.js`.

F1 inertizó dos autoridades históricas concretas sin ejecutar sus capacidades:
- `RC15-CP-011` Corte4 protected smoke: `enabled=false`, budgets Auth/provider/data=0, `INERTIZED_WITHOUT_EXECUTION`.
- `RC15-CP-142` M9 promotion/rollback: `enabled=false`, promociones=0, rollbacks=0, `INERTIZED_WITHOUT_EXECUTION`.

Resultado de tratamiento M3: **30 → 28 HOLD residuales**. El ledger de consumidos no se adulteró: una autoridad nunca ejecutada no se marca como consumida.

## Mecanismo permanente

`backend/config/cxorbia-historical-authority-tombstones.json` separa autoridad histórica de ejecuciones realmente consumidas y fija una cola finita tomada únicamente del inventario M2. Los aliases quedaron explícitamente sin autoridad de ejecución. Los validadores M3 derivan el estado del cierre M2 y de la evidencia M3 actual, no de literales de una iteración anterior.

## Incidente de materialización

El conector de contenidos materializó las piezas iniciales M3 en commits consecutivos, no en el único commit atómico previsto. No hubo provider/data/deploy side effects. Por ello el hito no se considera cerrado hasta completar readback integral del conjunto sincronizado; el incidente está documentado en `app/docs/CAMBIOS-BACKEND-M3-MECANISMO-20260825.md`.

## Provider/G2-B

Cloud Run actual preservado `cxorbia-live-hr-dev-00011-f2f`. G2-B continúa `RECOVERY_NO_PROVIDER_SIDE_EFFECT`, sin retry/replay. Provider mutation authorized now=false.

## Siguiente

Completar readback del hito y continuar la cola finita F1 de 28 residuales. No nueva auditoría, no Tramo 15, no provider/data/deploy/merge/frontend writes.

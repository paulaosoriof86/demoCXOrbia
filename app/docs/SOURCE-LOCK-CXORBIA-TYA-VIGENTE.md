# SOURCE LOCK CXORBIA TyA — VIGENTE

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

## Source funcional y plan

Source funcional congelado permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; source-fix G2-B `1d2cfecba0a89b637398d747a628e549d9823c68`. Master plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`: sin cambio.

## Fuente de M3

`HEAD_BEFORE=474303fd8f05dae093d8fd8c3f2db262e15cb73e`. M3 no modifica frontend funcional ni el source funcional congelado; modifica únicamente control-plane histórico, validadores, evidencia y documentación. El `HEAD_AFTER` se resuelve por readback remoto y no se auto-incrusta.

El set de validadores autoritativo de M3 está fijado en `backend/config/cxorbia-validator-authority.json`. Los validadores históricos superseded quedan como evidencia y no gobiernan continuidad.

## F0/M2 preservado

El universo finito sigue siendo el snapshot M2 `6bc249a06fdeb3a5df1cdf4532e35a932e883dca` / tree `b664ccfb2a84c365347b73e620a153c309381783`, exhaustividad 4/4. M3 no abre Tramo 15.

## Provider

Cloud Run preservado `cxorbia-live-hr-dev-00011-f2f`. En este hito M3: provider/data/deploy writes=0; G2-B no se ejecuta.

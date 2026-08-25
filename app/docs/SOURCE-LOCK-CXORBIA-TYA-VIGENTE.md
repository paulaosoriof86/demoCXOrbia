# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-25  
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`  
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `M3_F1_F2_INERTIZATION_CANONICAL_AUTHORITY` — `ACTIVE`  
**NEXT:** `M3_MECHANISM_SOURCE_ONLY_GATE`  
**PHASE_A:** `98/100`

## Source funcional y plan

Source funcional congelado permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; source-fix G2-B histórico `1d2cfecba0a89b637398d747a628e549d9823c68`. Master plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`: sin cambio.

## Fuente de reparación V2

`HEAD_BEFORE=0df5cae7e4a1fe9dd968170eab27269b12a8204a`, tree `22ccdbc494a904aaacfcc3de970700099a9df615`. `HEAD_AFTER` se resuelve por readback remoto después de un único commit Git atómico.

El source funcional no se compara con el HEAD de control-plane. La referencia canónica es `productionState.functionalSourceLock`. La reparación V2 modifica únicamente workflows/control-plane/validadores/docs; no modifica `/app` funcional.

## Gate M3

`.github/workflows/cxorbia-phase-a-live-checkpoint.yml` es el gate source-only activo de M3, sin provider access. `.github/workflows/cxorbia-live-hr-provider-capability-preflight.yml` queda manual/inert y reservado para una futura revalidación M4/F3 bajo nueva autoridad canónica.

## F0/M2 preservado

Universo finito M2 `6bc249a06fdeb3a5df1cdf4532e35a932e883dca` / tree `b664ccfb2a84c365347b73e620a153c309381783`, exhaustividad 4/4. No Tramo 15.

## Provider

Cloud Run preservado `cxorbia-live-hr-dev-00011-f2f`. Reparación V2: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge = 0.

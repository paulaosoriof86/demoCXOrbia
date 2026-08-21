# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**SYNC_EPOCH:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `G2B_RECOVERY_NO_PROVIDER_SIDE_EFFECT_NEW_EXPLICIT_DECISION_REQUIRED`

## Fuente funcional y producción
Source funcional validado/congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Source-fix G2-B aislado: `1d2cfecba0a89b637398d747a628e549d9823c68`.

Producción: project `cxorbia-backend-dev`; Hosting `cxorbia-dev` / site `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` `us-central1`; URL `https://cxorbia-backend-dev.web.app`.

## Provider lock actual
Última recuperación: `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; Cloud Run `cxorbia-live-hr-dev-00010-n78`; Hosting release `sites/cxorbia-backend-dev/releases/1787196507030000`. No provider mutation materializada.

Readiness posterior: `FORENSIC_PROVIDER_LANE_READY` en el HEAD padre `84c072bfc1033b8c10789ae0c5e758948cd44ca4`, con provider writes=0. Readiness no autoriza ejecución.

## Control de autoridad
El estado vivo no se deriva de flags históricos del execute ni del request sintético. Prevalecen continuity lock + receipt terminal + recovery request consumido + ledger one-shot.

No rebuild, replay, redeploy, stage sintético ni merge sin la transición autorizada correspondiente.

# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único
`I5_G1_PASS__I5_G2_ACTIVE__98_2`. G1 cerró `PRODUCTION_CUTOVER_EXECUTED` sobre el mismo source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Producción canónica: `https://cxorbia-backend-dev.web.app`; project `cxorbia-backend-dev`; Hosting `cxorbia-dev` / `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

No hubo rebuild ni provider redeploy porque el contrato acepta expresamente current identifiers/URL como producción y no requiere prod files separados. Business/data writes=0; merge=false; legacy intacto.

## Frontend / Claude
No tocar producto por G1. `/app/modules`, `/app/core`, adapters/data y entrypoint siguen congelados por same-artifact. No nueva candidata ni reauditoría sin P0.

## G2
Único siguiente bloque: smoke/hypercare/freeze post-cutover. Si no aparece P0 reproducible, `PRODUCTION_FROZEN_PASS_100`.

## Academia
Sin reconstrucción de cursos/manuales por G1. Solo registrar que el entorno limpio existente es ahora producción canónica y que la URL oficial operativa es `https://cxorbia-backend-dev.web.app`; cualquier cambio funcional deberá venir de evidencia G2, no de la promoción.

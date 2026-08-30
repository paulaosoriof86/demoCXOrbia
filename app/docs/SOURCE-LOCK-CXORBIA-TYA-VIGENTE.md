# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-LIVE-ROW-CONTENT-PASS-MECHANISM-SYNC-14`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100`  
**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`

## Baseline congelada y sucesor live

La baseline histórica aceptada permanece `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`, Cloud Run `cxorbia-live-hr-dev-00013-rns`.

La composición actualmente servida por Hosting conserva esa baseline y sustituye únicamente el adapter F10 autorizado:

- `app/adapters/tya-canonical-state-semantics-v2.js`;
- source repair commit `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`;
- blob `941051c96a26017363acfc72f7e88edbe70c68ba`;
- SHA-256 `e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e`;
- Hosting release `sites/cxorbia-backend-dev/releases/1788058988151000`;
- Hosting version `sites/cxorbia-backend-dev/versions/958ed37dde65d592`;
- deploy run `33289344796`, artefacto `9725498210`.

La matriz predeploy `backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json` sigue siendo la autoridad de los 41 blobs. Su estado live efectivo se lee en `backend/config/cxorbia-f10-approved-module-authority-live-overlay-v1.json`. El readback remoto posterior al deploy comprobó 41/41, 0 mismatches, entrypoint y `app.js` exactos.

## Autoridad de datos live

La certificación actual es run `33297814889`, artefacto `9727971958`: forced fresh provider + 44 firmas operacionales sanitizadas + navegador Admin autenticado produjeron el mismo digest `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`. `sourceRevision` fue distinto entre refresh y se conserva únicamente como trazabilidad.

## Hard preserve

No restore V182, no cambio de módulos/core, no nueva candidata/rama/PR/workflow por este incidente, no redeploy automático, no hardcode de cifras/meses, no legacy DB. Cliente/Cliente 360 es un frente separado.

**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`.

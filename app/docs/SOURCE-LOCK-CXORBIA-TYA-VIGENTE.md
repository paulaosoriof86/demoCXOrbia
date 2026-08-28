# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-IAM-P1-NONBLOCKING-PRECUTOVER-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_IAM_METADATA_WARNING_RECONCILED_NONBLOCKING`  
**NEXT:** `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits de control-plane/evidence/docs no sustituyen ningún SHA del release.

## F8 — IAM como warning no bloqueante

El intento temporal Secret Manager viewer anterior permanece consumido y sin replay: la credencial DEV automatizada no tiene `resourcemanager.projects.setIamPolicy`; grant no intentado; provider writes=0; metadata/payload read=0.

La identidad humana `roles/owner` observada se conserva como evidencia administrativa, pero **no forma parte del camino crítico actual**. No se probará ni automatizará solo para cerrar `F7-P1-002`.

F7 es autoridad terminal `GO_WITH_WARNINGS`, P0=0, y clasificó la brecha de inventario IAM/secrets como P1. F8 ya completó los readbacks relevantes del runtime exacto y aisló el remanente a `secretmanager.secrets.list`, sin secreto en plaintext ni secret-backed env en el runtime congelado. Por ello el listado de metadata queda `WARNING_NONBLOCKING`.

Evidencia: `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`.

## Frontera dura

No hay autorización activa de provider mutation. No repetir el intento IAM consumido, no ampliar roles, no crear WIF/service account/credencial, no deployar, no reconstruir, no reimportar y no tocar el release congelado.

El siguiente gate es read-only: `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

Backup/export + restore y cutover requieren autorización explícita separada antes de cualquier mutación.

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de escribir.

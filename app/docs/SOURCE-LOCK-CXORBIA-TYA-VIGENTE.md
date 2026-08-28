# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-HUMAN-OWNER-ROUTE-OBSERVED-BRIDGE-HOLD-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_HUMAN_OWNER_ROUTE_OBSERVED_AUTOMATION_BRIDGE_HOLD`  
**NEXT:** `F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits de control-plane/evidence/docs no sustituyen ningún SHA del release.

## F8 — IAM y ruta Owner

El intento temporal Secret Manager viewer anterior permanece consumido: run `33118612042`; la credencial DEV automatizada no tiene `resourcemanager.projects.setIamPolicy`; grant no intentado; provider writes=0; metadata/payload read=0.

La evidencia nueva demuestra una identidad humana `roles/owner` en el proyecto exacto. Esto no altera el source lock ni el release y no se convierte automáticamente en credencial de CI.

No existe un puente seguro automatizado demostrado desde el carril actual hacia esa sesión humana: búsqueda focalizada de OIDC/WIF en repo=sin ruta; conector GCP/IAM de esta sesión=ausente. No solicitar raw credentials ni crear IAM/WIF/service account/workflow sin autorización.

## Frontera dura

No hay autorización activa de provider mutation. No repetir el intento consumido, no ampliar roles, no deployar, no reconstruir, no reimportar y no tocar el release congelado.

El siguiente requisito es establecer o disponer de un **puente seguro de ejecución Owner**. La comprobación efectiva de `resourcemanager.projects.setIamPolicy` debe ocurrir dentro de ese carril autenticado antes de cualquier grant.

## PR y siguiente

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de escribir.

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

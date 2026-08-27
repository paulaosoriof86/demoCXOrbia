# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-TEMP-IAM-AUTH-CAPABILITY-HOLD-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TEMP_SECRET_METADATA_VIEWER_CAPABILITY_HOLD`  
**NEXT:** `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits de este bloque son harness/evidence/control-plane/docs. No sustituyen ningún SHA del release.

## Intento temporal Secret Manager viewer

Paula autorizó el grant temporal mínimo, un metadata readback y revocación inmediata. El intento single-use corrió en `7acaee59deb5c80b9161370b1a8f1e56b7f3ff34` / run `33118612042`.

Antes de mutar, el gate probó que la única credencial DEV carece de `resourcemanager.projects.setIamPolicy`. Por diseño fail-closed el grant no se intentó: provider writes=0. Metadata de Secret Manager no se leyó; payload access/read/export=0; no existió binding temporal que revocar. Código temporal retirado en `c72de8dde23eaeb664eca54c4cee31d3aa40a96a`.

La autorización single-use está consumida y no puede reintentarse automáticamente. Evidencia: `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`.

## Frontera dura

No hay autorización activa de provider mutation. No repetir el intento, no ampliar roles, no deployar, no reconstruir, no reimportar y no tocar el release congelado.

El bloqueo actual requiere una ruta provider con capacidad IAM suficiente antes de poder volver a plantear el metadata readback. Cualquier nuevo intento de mutación requerirá autorización explícita nueva.

## PR y siguiente

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de escribir.

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`.

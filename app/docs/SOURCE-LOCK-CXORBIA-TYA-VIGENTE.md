# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-PROVIDER-SECURITY-IAM-HOLD-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_PROVIDER_SECURITY_QUOTA_IAM_HOLD`  
**NEXT:** `F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_EXPLICIT_AUTHORIZATION_REQUIRED`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release ID `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits F8 posteriores modifican únicamente harness/control-plane/evidence/docs y **no sustituyen** ningún SHA del release congelado.

## F8 provider security read-only

Evidencia: `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`.

Run `33117362096` dejó PASS en Cloud Run target/revision, IAM readback, Service Usage y quotas. La clasificación de variables fue corregida: no hay nombres de secreto crudo detectados; `CXORBIA_DEV_VISUAL_PROFILE_TOKEN_SHA256` y `CXORBIA_DEV_VISUAL_PROFILE_TOKEN_EXPIRES_AT` son metadata derivada y no motivan mutación del runtime.

El único HOLD vigente es de capacidad IAM del precheck: falta `secretmanager.secrets.list` para listar metadata de Secret Manager. Secret Manager está habilitado; secret payload access/read/export=0.

## Frontera dura

Provider mutation sigue `false`. No conceder IAM, no deployar, no reconstruir, no reimportar y no tocar el release congelado sin autorización explícita vigente.

La siguiente mutación propuesta, si Paula la autoriza, queda limitada a un grant temporal `roles/secretmanager.viewer` para metadata, readback exacto y revocación. No incluye `secretmanager.versions.access`.

## PR y control plane

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de cualquier escritura.

## Siguiente exacto

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.

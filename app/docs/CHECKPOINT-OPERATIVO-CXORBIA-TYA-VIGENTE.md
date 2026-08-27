# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-TEMP-IAM-AUTH-CAPABILITY-HOLD-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`  
**NEXT:** `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` permanece exacto: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`, Cloud Run `cxorbia-live-hr-dev-00013-rns`, image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`, Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`, Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## Intento IAM autorizado — cierre causal

Autorización exacta: grant temporal `roles/secretmanager.viewer`, un metadata readback y revocación inmediata; sin payloads de secretos, otras mutaciones, deploy ni cutover.

Evidencia: `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`.

Run `33118612042`, job `98679566949`, artifact `9665544809`, digest `sha256:1aca6f94f4e47694d92bd541e9653dffd3fb5c3e39d63eb47e299a9fc25409b1`.

El preflight previo a mutación probó `F8_ONE_SHOT_SET_IAM_CAPABILITY_UNAVAILABLE`: la única credencial DEV disponible no tiene `resourcemanager.projects.setIamPolicy`. El grant **no se intentó**. Resultado: provider writes=0, metadata readback no ejecutado, revoke no requerido, binding temporal final ausente, secret payload read/export=0.

La autorización single-use queda consumida por el intento y sin replay automático. El código temporal se retiró inmediatamente en commit `c72de8dde23eaeb664eca54c4cee31d3aa40a96a`.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`; no P0 de producto.

## PASS preservados

Shopper actual read-only PASS; Cloud Run exacto PASS; Cloud Run IAM readback PASS; plaintext sensitive env keys=0; Service Usage 4/4 ENABLED; quotas 4/4 PASS sin overrides.

## Estado seguro y siguiente

Readiness `95/100`. Provider/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0.

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`.

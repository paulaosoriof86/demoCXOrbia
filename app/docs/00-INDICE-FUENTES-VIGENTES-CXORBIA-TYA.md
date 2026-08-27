# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-TEMP-IAM-AUTH-CAPABILITY-HOLD-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TEMP_SECRET_METADATA_VIEWER_CAPABILITY_HOLD`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`  
**NEXT:** `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `4.0.0`;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. release manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia provider security `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
6. evidencia del intento IAM autorizado `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json`;
7. evidencia F8 Shopper y evidencias terminales F7/F6/F5/F4/F3/M3 conservadas por referencia;
8. fuentes maestras vigentes de continuidad, ejecución directa/empalme, Academia, patrones reutilizables y antidesvío;
9. checkpoint, source lock, progress lock, CAMBIOS/addendum, Claude y Pendientes como mirrors;
10. PR #7 permanece mirror-only, cerrado y no mergeado;
11. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, deploy, reimport ni sustitución del release ocurrió en este bloque.

## Autorización temporal IAM — resultado real

Paula autorizó exclusivamente: grant temporal `roles/secretmanager.viewer` al principal DEV de precheck en `cxorbia-backend-dev`, un readback de metadata Secret Manager y revocación inmediata. No autorizó payloads de secretos, otras mutaciones, deploy ni cutover.

El intento single-use se ejecutó en commit `7acaee59deb5c80b9161370b1a8f1e56b7f3ff34`, run `33118612042`, job `98679566949`, artifact `9665544809`, digest `sha256:1aca6f94f4e47694d92bd541e9653dffd3fb5c3e39d63eb47e299a9fc25409b1`.

El preflight fail-closed demostró que la única credencial DEV disponible **no posee** `resourcemanager.projects.setIamPolicy`. Por eso el grant no se intentó, metadata no se leyó y provider writes quedaron en `0`. No hubo rol temporal que revocar y el binding final permanece ausente. Secret payload endpoint/read/export=`0`.

La autorización single-use queda consumida por el intento y no es reejecutable automáticamente. El código temporal de mutación fue retirado inmediatamente en `c72de8dde23eaeb664eca54c4cee31d3aa40a96a`.

Clasificación: `MECHANISM_P0_STOP_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`; `productP0Proven=false`.

## PASS preservados

Cloud Run exacto/revisión congelada PASS; Cloud Run IAM readback PASS; `plaintextSensitiveKeyCount=0`; Service Usage 4/4 ENABLED; cuotas 4/4 PASS sin overrides; Shopper runtime actual PASS con 6 visitas propias y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers.

## Estado seguro y siguiente exacto

`PRODUCTION_REAL_READINESS` permanece `95/100`. Provider/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploy/rebuild/reimport/merge=0.

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE`.

No se solicita acción manual de Paula en este corte. No repetir el intento consumido ni inferir autorización de cutover/deploy.

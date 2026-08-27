# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F8-PROVIDER-SECURITY-IAM-HOLD-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_PROVIDER_SECURITY_QUOTA_IAM_HOLD`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `HOLD_PROVIDER_SECURITY_IAM_READ_CAPABILITY`  
**NEXT:** `F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_EXPLICIT_AUTHORIZATION_REQUIRED`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## 1. Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `3.9.0`;
3. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, blob `0ea2cd9802e687938086886d8d03648f105a7d64`, SHA-256 `7b49f7df172f8b322c3ae38bdf55f50936696d2d6f7b5086ae8a68e97827dafa`;
4. release manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia F8 Shopper `app/docs/evidence/RC15-F8-SHOPPER-HARNESS-RECOVERY-LATEST.json`;
6. evidencia F8 provider security/quota `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
7. evidencia terminal F7/F6/F5/F4/F3/M3 conservada por referencia;
8. fuentes maestras vigentes de continuidad, ejecución directa/empalme, Academia, patrones reutilizables y antidesvío;
9. checkpoint, source lock, progress lock, CAMBIOS, Claude y Pendientes como mirrors sincronizados;
10. PR #7 permanece `mirror-only`, cerrado y no mergeado;
11. resolver siempre HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

## 2. Release congelado preservado

Release ID `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

- functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- Cloud Run `cxorbia-live-hr-dev-00013-rns`;
- image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los prechecks F8 no reconstruyeron ni redeployaron el release.

## 3. F8 — estado probado

Shopper quedó recertificado en read-only con identidad exacta, 6 visitas propias y HR viva de 15 períodos / 30 hojas / 660 visitas / 214 shoppers. El gate legal permanece visible y su aceptación no se automatiza.

Provider security/quota run `33117362096`:

- Cloud Run target y revision congelada: PASS;
- Cloud Run IAM readback: PASS; existe `roles/run.invoker` público como observación arquitectónica, protegido por gates fail-closed de aplicación ya probados;
- variables de entorno: `plaintextSensitiveKeyCount=0`; `TOKEN_SHA256` y `TOKEN_EXPIRES_AT` quedaron correctamente reclasificadas como metadata derivada, no secreto crudo;
- Service Usage: 4/4 APIs requeridas `ENABLED`;
- quotas: 4/4 readbacks PASS, sin overrides;
- Secret Manager API: `ENABLED`;
- único HOLD restante: la credencial DEV disponible carece de `secretmanager.secrets.list`; no existen las dos rutas alternas históricas en Actions;
- secret payload reads/export = 0.

Clasificación terminal del bloqueo actual: `MECHANISM_P0_STOP_PROVIDER_IAM_READ_CAPABILITY`; no existe P0 de producto demostrado.

## 4. Frontera de autorización

F8 read-only está autorizado, pero **provider mutation sigue sin autorización**. Para cerrar el único HOLD de seguridad se requiere autorización explícita para un cambio IAM temporal y mínimo: conceder `roles/secretmanager.viewer` al principal DEV de precheck, ejecutar el metadata readback exacto y revocar el rol. Ese rol permite metadata/listado, pero no incluye `secretmanager.versions.access` a payloads.

No se avanza a carga/failure-injection, backup/restore de cutover ni deployment mientras este HOLD siga abierto.

## 5. Estado seguro

Provider writes=0; data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploys=0; rebuilds=0; reimports=0; merge=false. `PRODUCTION_REAL_READINESS` permanece `95/100`.

## 6. Siguiente exacto

`WAIT_FOR_EXPLICIT_F8_TEMPORARY_SECRET_MANAGER_METADATA_VIEWER_AUTHORIZATION`.

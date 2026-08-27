# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F7-INTEGRAL-READINESS-GO-WITH-WARNINGS-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F7_INTEGRAL_READINESS_GO_WITH_WARNINGS`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**NEXT:** `F8_CUTOVER_EXPLICIT_AUTHORIZATION_REQUIRED`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## 1. Autoridad canónica viva

1. este índice;
2. fuentes maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, blob `0ea2cd9802e687938086886d8d03648f105a7d64`, SHA-256 `7b49f7df172f8b322c3ae38bdf55f50936696d2d6f7b5086ae8a68e97827dafa`;
4. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `3.7.0`;
5. manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
6. evidencia F7 `app/docs/evidence/RC15-F7-INTEGRAL-READINESS-LATEST.json`;
7. evidencia terminal F6/F5/F4/F3/M3 conservada por referencia;
8. checkpoint, source lock, progress lock, CAMBIOS, Claude y Pendientes como mirrors sincronizados;
9. PR #7 permanece `mirror-only`, cerrado y no mergeado;
10. resolver siempre HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

El master plan permanece congelado; el cursor operativo vivo es continuity lock + evidencia terminal + mirrors.

## 2. F6 preservado sin cambios

Release ID `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

- functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- Cloud Run `cxorbia-live-hr-dev-00013-rns`;
- image digest `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy ni reimport fue ejecutado en F7.

## 3. F7 cerrado

Decisión: `GO_WITH_WARNINGS`; P0=`0`, P1=`4`, P2=`2`.

PASS/readback suficiente: identidad inmutable del release, aislamiento tenant/project, migración 616/616, Auth/RBAC, HR 14 periodos/28 hojas/616 visitas, shoppers/certificaciones/visitas, finanzas con unresolved routed-to-review, multi-proyecto, E2E/regresión F5, rollback/telemetría previos, consistencia Claude y Academia visible.

Warnings no bloqueantes:

- run `33085991102`: `firebase-admin` ausente en predeploy local; sin provider mutation/deploy;
- falta recheck provider-side fresco de IAM/secrets/cuotas antes de F8;
- falta prueba acotada fresca de carga/cuotas/failure injection antes de F8;
- backup/export + restore de cutover debe verificarse en F8 antes de mutación;
- alert delivery/runbook y profundidad de contenido Academia quedan como seguimiento no P0.

Durante F7: provider/data/Auth/HR/pagos/Rules/Storage/Make/Gemini writes, deploys, rebuilds, reimports y merge = `0`.

## 4. Siguiente exacto

`WAIT_FOR_F8_EXPLICIT_AUTHORIZATION`.

F8 no está autorizado por el GO_WITH_WARNINGS de F7. Requiere autorización específica en conversación actual y debe cerrar sus prechecks antes de cualquier mutación provider.

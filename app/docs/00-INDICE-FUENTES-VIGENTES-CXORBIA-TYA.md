# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8_5-CANONICAL-LINEAGE-PASS-08`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F9_POSTPRODUCTION_ACCEPTANCE`  
**currentMasterStep:** `F9_POSTPRODUCTION_ACCEPTANCE_98_TO_100`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**NEXT:** `F9_POSTPRODUCTION_ACCEPTANCE_98_TO_100`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Autoridad canónica viva

1. este índice;
2. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json` como matriz histórica de autoridad de módulos;
4. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json` + errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`;
5. evidencia F8.5 `app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json`;
6. evidencia F8 terminal y estado IAM cero-residuo;
7. mirrors checkpoint/source-lock/progress y addenda CAMBIOS/Claude/Pendientes;
8. PR #7 mirror-only, cerrado y no mergeado;
9. única rama viva: `docs-tya-v6-v71-audit`.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8 cerrado PASS cero residuo

Provider run `33193514608`, job `98924733768`: backup/export + restore aislado + 9/9 colecciones + cleanup + reconciliación exacta PASS, sin redeploy. IAM temporal revocado y verificado con run `33187198967`, attempt 4, job `98940746944`; los cinco permisos administrativos temporales volvieron a quedar ausentes. Residuo IAM=0. Readiness `95 → 98`.

## F8.5 cerrado PASS

La matriz de composición certifica `approvedLineagePreserved=true` y conserva autoridades M1/V161C/V174/V182/C6. V182 es autoridad solo para su alcance aprobado; los root fixes C6 posteriores prevalecen donde existen.

Se confirmaron sucesores autorizados relevantes, incluidos Shoppers `f961253f18c388ae04619bb5175269015c8349c3` y Mis Visitas `9d8f44b0fea7f2513018339e54a0bef4ae152ea0`.

La comparación `f9802fdd... → ef990a86...` tiene merge-base igual al functional source y no presenta cambios posteriores al freeze en `app/modules/**`, `app/core/**`, `app/app.js`, `app/styles/**` ni `app/index-backend-dev.html`. Hosting conserva el tuple congelado; el manifest certifica exact source y la errata read-only prueba que el sentinel vivo coincide con functional source, runtime source y rama. No existe P0 de linaje ni tarea frontend nueva.

F8.5 no cambia el porcentaje: `PRODUCTION_REAL_READINESS=98/100`.

## Siguiente acción exacta

`F9_POSTPRODUCTION_ACCEPTANCE_98_TO_100`.

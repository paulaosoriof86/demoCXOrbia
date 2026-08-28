# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F9-WINDOW-OPEN-09`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F9_POSTPRODUCTION_ACCEPTANCE`  
**currentMasterStep:** `F9_WINDOW_IN_PROGRESS_TERMINAL_NOT_BEFORE_20260829T171906Z`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `IN_PROGRESS_24H_WINDOW_OPEN`  
**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Autoridad canónica viva

1. este índice;
2. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
3. evidencia F9 en curso `app/docs/evidence/RC15-F9-POSTPRODUCTION-ACCEPTANCE-WINDOW-LATEST.json`;
4. `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json` como matriz histórica de autoridad de módulos;
5. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json` + errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`;
6. evidencia F8.5 `app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json`;
7. evidencia F8 terminal y estado IAM cero-residuo;
8. mirrors checkpoint/source-lock/progress y CAMBIOS/Claude/Pendientes;
9. PR #7 mirror-only, cerrado y no mergeado;
10. única rama viva: `docs-tya-v6-v71-audit`.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8 / F8.5 cerrados

F8: provider run `33193514608`, backup/export + restore aislado + 9/9 colecciones + cleanup + reconciliación exacta PASS, sin redeploy. IAM temporal revocado y residuo cero verificado.

F8.5: matriz M1/V161C/V174/V182/C6 y fixes sucesores certificada contra functional source y release/Hosting congelado. P0 de linaje=0. No restaurar V182 completo ni reabrir módulos cerrados sin evidencia nueva.

## F9 en curso

El master plan exige una ventana formal objetivo de 24 horas después del cutover. El run F8 terminó `2026-08-28T17:19:06Z` (`11:19:06 -06:00`); F9 no es elegible para `POSTPROD_ACCEPTED` antes de `2026-08-29T17:19:06Z` (`11:19:06 -06:00`). Readiness permanece `98/100`.

Evidencia inicial post-cutover ya disponible: F8 PASS, IAM post-cutover zero-residue PASS y F8.5 source/release lineage PASS. El bounded-load F8 permanece baseline comparativa previa, no cierre F9.

La sesión actual intentó cuatro GET read-only pero no alcanzó Hosting por fallo de resolución DNS del entorno. Clasificación: `SESSION_EXTERNAL_HTTP_TRANSPORT_GAP_NOT_PRODUCT_FAILURE`; P0 nuevo=0. No crear/revivir workflow, credencial, IAM, rama, PR o transporte paralelo por esa limitación.

Fresh readbacks F9 pendientes: Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas/observabilidad.

**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`.

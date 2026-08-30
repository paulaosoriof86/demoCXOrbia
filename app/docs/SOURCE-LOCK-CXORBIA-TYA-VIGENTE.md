# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_OPERATIONAL_EVIDENCE_SOURCE_REPAIRED_PREDEPLOY_VALIDATION`  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado

## Release desplegado y source congelado

El source funcional del release actualmente desplegado permanece:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

Release: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 conserva `PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE` para ese release.

## Sucesor source F10 autorizado — todavía no desplegado

El incidente F10 produjo un sucesor **focal** del read model, sin reemplazar el frontend aprobado:

- functional commit: `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`;
- archivo único: `app/adapters/tya-canonical-state-semantics-v2.js`;
- blob: `941051c96a26017363acfc72f7e88edbe70c68ba`;
- SHA-256: `e832759e03238559617b71daa4daa52a00b2c6dbd2d2266e6df0ae391f853b2e`;
- atomic apply: run `33283725070`, estado `APPLIED_AND_VERIFIED`;
- source gate: `PASS_F10_SOURCE_PATCH_AND_APPROVED_MODULE_LINEAGE_INTACT__PREDEPLOY_HOLD`;
- deploy: `false`.

La comparación neta entre `9777bdc7d5a0d4a7cc7c92ed1bdf16a3b934f5a4` y `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0` contiene exclusivamente ese adapter. No se tocaron `app/modules/**`, `app/core/**`, `app/app.js` ni `app/index-backend-dev.html`.

## Lock de versiones aprobadas

`backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json` es la matriz ejecutable de autoridad F10. En la verificación posterior al patch:

- 26 módulos Phase A aprobados: `0` mismatches;
- 10 módulos soporte congelados: `0` mismatches;
- 5 módulos post-Phase-A cargados: blobs preservados, sin convertirlos en autoridad Phase A;
- entrypoint blob: `7a5f169dd0e239d46fa4af09cf67f2eb4329a477`;
- app.js blob: `2043d33dee611adacebc947c8423ed1739c1a8da`.

Por ello queda prohibido volver a diagnosticar “versión vieja de módulos” basándose solo en un KPI: se requiere drift reproducible del blob esperado o del asset servido.

## Cursor operativo separado del release lock

La autoridad de cursor es el overlay `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`, epoch `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`.

Incidente activo: `F10-HR-KPI-FRESHNESS-20260829-01`, estado `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`, P0 de producto=`false`.

La lectura provider fresca ya está certificada para revisión `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`; el patch separa direct HR operational evidence de canonical lifecycle inference.

Esto distingue:

- **qué versión está desplegada:** release congelado F8.5;
- **qué versión source está preparada:** sucesor F10 `639273...`;
- **qué módulos deben permanecer:** blobs exactos de la matriz;
- **qué dato debe consumir el KPI operacional:** evidencia directa HR de una revisión provider fresca;
- **qué está abierto:** browser exact-source + deploy autorizado + live same-revision revalidation;
- **qué no se reabre:** F5-F9, módulos aprobados y restauraciones globales.

## Hard locks

- no restaurar V182 completo;
- no cambiar módulos/core aprobados por este incidente;
- no nueva candidata/rama/PR/workflow por rutina;
- no deploy/rebuild/reimport hasta gate predeploy y autorización explícita;
- no legacy DB;
- no Make/Gemini/pagos sin gate;
- no owner visual acceptance hasta que el sucesor F10 esté desplegado y validado en browser contra una revisión HR fresca.

**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`.

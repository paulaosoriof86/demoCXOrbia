# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F9-WINDOW-OPEN-09`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F9_POSTPRODUCTION_ACCEPTANCE`  
**currentMasterStep:** `F9_WINDOW_IN_PROGRESS_TERMINAL_NOT_BEFORE_20260829T171906Z`  
**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Manifest histórico + errata overlay preservan ese tuple exacto. No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8 terminal

F8 permanece `CLOSED_PASS_ZERO_RESIDUE`: backup/export y restore aislado PASS; 9/9 colecciones top-level; cleanup PASS; autorización consumida; IAM temporal revocado y verificado; no reejecutar F8.

## F8.5 terminal PASS

Autoridad histórica: `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`, con `approvedLineagePreserved=true` y matriz M1/V161C/V174/V182/C6. V182 no es autoridad global reinstalable; los root fixes C6 posteriores prevalecen donde existen.

Comparación del functional source lock contra el HEAD auditado F8.5: cero cambios posteriores al freeze en `app/modules/**`, `app/core/**`, `app/app.js`, `app/styles/**` y `app/index-backend-dev.html`. Hosting conserva release/version congelados; el sentinel certificado coincide con functional source, runtime source y rama. Veredicto F8.5 PASS, P0=0.

## F9 abierto

`F9_POSTPRODUCTION_ACCEPTANCE` está `IN_PROGRESS`. La ventana formal objetivo es 24 horas después del cutover. Anchor conservador: cierre del run F8 `33193514608` a `2026-08-28T17:19:06Z`. No declarar `POSTPROD_ACCEPTED` ni readiness 100 antes de `2026-08-29T17:19:06Z` (`11:19:06 -06:00`).

Evidencia inicial post-cutover: F8 PASS, IAM zero-residue PASS y F8.5 lineage/release PASS. El bounded-load previo solo sirve como baseline comparativa.

La lectura HTTP directa de esta sesión quedó detenida por resolución DNS del entorno antes de alcanzar Hosting. No se clasifica como defecto de producto ni autoriza nuevo workflow, credencial, IAM, rama, PR o transporte.

Fresh readbacks aún requeridos: Auth, HR, HR↔plataforma, shoppers, visitas, evidencias, liquidaciones/pagos, errores runtime, performance, drift y alertas/observabilidad.

Hard locks: no nueva candidata/rama/PR/workflow; no rebuild/redeploy/reimport; no restaurar V182 completo; no reabrir módulos cerrados sin evidencia nueva; no legacy DB; Make/Gemini/pagos solo con gate.

**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`.

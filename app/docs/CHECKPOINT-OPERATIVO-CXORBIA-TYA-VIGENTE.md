# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F9-WINDOW-OPEN-09`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `IN_PROGRESS_24H_WINDOW_OPEN`  
**NEXT:** `F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## F8 / F8.5 cerrados

F8 provider run `33193514608`: backup retenido; restore temporal aislado; 9/9 colecciones; cleanup PASS; release exacto reconciliado sin redeploy. IAM temporal revocado y verificado; residuo IAM=0. Readiness `95 → 98`.

F8.5 certificó matriz M1/V161C/V174/V182/C6 + fixes sucesores contra functional source y release/Hosting congelado. V182 no es baseline global reinstalable. P0 de linaje=0; no hubo writes frontend/provider ni deploy.

## F9 en curso

Ventana formal objetivo: 24 horas post-cutover. Anchor: cierre F8 `2026-08-28T17:19:06Z` (`11:19:06 -06:00`). Cierre terminal F9 no permitido antes de `2026-08-29T17:19:06Z` (`11:19:06 -06:00`). Readiness permanece `98/100`.

Post-cutover ya observado: F8 terminal PASS, IAM zero-residue PASS y F8.5 lineage/release PASS. Baseline previa de performance/failure: 24/24 GET, 5xx=0, fallos contrato=0, p95=181.87 ms.

Fresh readbacks pendientes dentro de la ventana: Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas/observabilidad.

Incidente de sesión: cuatro GET read-only hacia Hosting no alcanzaron producción por resolución DNS del entorno. `SESSION_EXTERNAL_HTTP_TRANSPORT_GAP_NOT_PRODUCT_FAILURE`; P0 nuevo=0; no se crea/revive transporte alternativo.

## Siguiente gate exacto

`F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`.

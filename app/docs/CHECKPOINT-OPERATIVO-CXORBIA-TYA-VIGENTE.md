# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_OPERATIONAL_EVIDENCE_SOURCE_REPAIRED_PREDEPLOY_VALIDATION`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

## Release y versiones preservadas

Release desplegado/congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 mantiene PASS de linaje aprobado. La matriz F10 volvió a verificar 26 módulos Phase A, 10 soporte y 5 post-Phase-A cargados con `0` mismatches. Entry point `7a5f169dd0e239d46fa4af09cf67f2eb4329a477`; `app.js` `2043d33dee611adacebc947c8423ed1739c1a8da`.

El único patch funcional F10 es el adapter sucesor `app/adapters/tya-canonical-state-semantics-v2.js`, commit `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`, blob `941051c96a26017363acfc72f7e88edbe70c68ba`. Comparado contra `9777bdc7d5a0d4a7cc7c92ed1bdf16a3b934f5a4`, el net functional delta es exactamente ese archivo; `app/modules/**`, `app/core/**`, entrypoint y `app/app.js` no cambiaron.

## Incidente operativo activo

Incidente: `F10-HR-KPI-FRESHNESS-20260829-01`.

Estado: `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`; P0 de producto=`false`; F5-F9 no se reabren retroactivamente.

La frescura independiente ya fue demostrada por el run `33281688280`: revisión `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`, `sourceReadAt=2026-08-29T23:44:58.827Z`, `cacheOrigin=runtime_refresh`, 660 visitas, 0 row-key duplicadas.

La causa raíz adjudicada es `BACKWARD_LIFECYCLE_PROMOTION_USED_AS_VISIBLE_OPERATIONAL_EVIDENCE`: el modelo canónico promovía realización/cuestionario desde evidencia posterior de submit y Dashboard consumía esas facetas como si fueran evidencia directa HR.

El patch aplicado separa:

- **canonical lifecycle:** conserva inferencias para historia/auditoría;
- **operational evidence:** usa fechas/evidencias directas HR para KPI actual;
- **liquidationCandidate:** deriva de submitido;
- **liquidationConfirmed/paymentConfirmed:** permanecen estados financieros separados.

Gate ejecutable del source: `PASS_F10_OPERATIONAL_EVIDENCE_SEMANTICS`. Atomic apply run `33283725070`: `APPLIED_AND_VERIFIED`, sin blockers, commit funcional `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`.

## Semántica esperada sobre la revisión fresca de agosto

- total 44;
- realizadas 30 (`GT 24 / HN 6`);
- pendientes de realizar 14;
- cuestionario pendiente 4 (`GT 4`);
- sin agendar operativas 4 (`GT 3 / HN 1`);
- submitidas/candidatas a liquidación 30;
- liquidaciones confirmadas 0;
- pagos confirmados 0.

No hardcodear estos valores: son evidencia de la revisión citada, no configuración del producto.

## Estado de módulos

- **Linaje/versiones aprobadas:** PASS exacto; no reabrir por rutina.
- **Dashboard / HR Source / Periodos / Histórico / Visitas / Postulaciones / Reservas / Shoppers:** módulo aprobado preservado; read-model F10 reparado en source; browser exact-source y posterior live deploy/revalidation pendientes.
- **Finanzas:** conciliación histórica cerrada preservada; 30 candidatas no equivalen a 30 liquidaciones confirmadas.
- **Cliente/Cliente 360:** HOLD separado; no mezclar con HR.
- **Academia/Documentos:** blobs aprobados preservados; actualizar manuales solo si el cambio visible final se acepta.

## Control plane

La autoridad efectiva actual es `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`, epoch `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`. Ningún mirror/validator histórico puede devolver el cursor a fases anteriores o diagnosticar una versión antigua sin drift reproducible de blob/asset.

## Seguridad

Provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; nueva rama/PR/workflow=0; legacy DB access=false.

## Siguiente bloque exacto

`F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`.

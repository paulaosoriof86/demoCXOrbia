# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_HR_KPI_FRESHNESS_AND_CONTROL_PLANE_RECONCILIATION`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado  
**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`

## Autoridad canónica viva — orden obligatorio

1. este índice;
2. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
3. `backend/config/cxorbia-phase-a-continuity-lock.json` como historia + `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` como cursor efectivo actual;
4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`;
6. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`;
7. incidente F10 `app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json`;
8. certificación de linaje F8.5 `app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json`;
9. manifest de composición `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
10. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md` y `app/docs/PENDIENTES-PROTOTIPO.md`;
11. mirrors raíz `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, que no pueden competir ni quedar atrasados;
12. PR #7 únicamente como mirror histórico no autoritativo; está cerrado/draft/no mergeado;
13. única rama viva `docs-tya-v6-v71-audit`.

## Release y linaje preservados

Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 continúa certificando el linaje aprobado M1/V161C/V174/V182/C6 + fixes sucesores autorizados. El incidente F10 **no demuestra que se haya servido una versión antigua** y no autoriza restaurar V182 ni reabrir módulos ya cerrados.

## Incidente F10 activo

`F10-HR-KPI-FRESHNESS-20260829-01` está `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`, P0 de producto=`false`.

El run `33257681796` queda limitado a autenticación/navegación y consistencia interna del snapshot; no certifica frescura independiente porque comparó UI y `periodOperationalSummary` de la misma instancia. La validación de HR dinámica debe usar una lectura provider forzada identificada por `revision`/`sourceReadAt` y reconciliar la UI contra esa misma revisión.

La pérdida semántica entre el modelo canónico y los KPIs visibles, especialmente `submitted → liquidationCandidate` frente a liquidación/pago confirmado, permanece abierta y debe corregirse focalmente sin hardcodear cifras.

Cliente/Cliente 360 mantiene un HOLD separado; no se mezcla con la reconciliación HR.

## Regla antidesincronización

Ningún archivo llamado `VIGENTE`, mirror raíz, workflow, request histórico o validador puede dirigir la ejecución a M2/M3/F8 después de este epoch. Si contradice el overlay efectivo y este índice, se considera **histórico/stale**, no autoridad.

No certificar un módulo por `route render` solamente: la versión aprobada, el asset servido y la autoridad de datos deben validarse por separado.

## Seguridad

Sin provider/business/Auth/Firestore/HR/Storage/Rules/payment writes; sin Make/Gemini; sin deploy/rebuild/reimport/merge; sin nueva rama/PR/workflow; legacy DB prohibida.

## Siguiente acción exacta

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.

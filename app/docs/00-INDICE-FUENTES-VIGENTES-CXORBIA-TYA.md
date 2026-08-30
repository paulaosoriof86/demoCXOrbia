# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_OPERATIONAL_EVIDENCE_SOURCE_REPAIRED_PREDEPLOY_VALIDATION`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

## Autoridad canónica viva — orden obligatorio

1. este índice;
2. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
3. `backend/config/cxorbia-phase-a-continuity-lock.json` como historia + `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` como cursor efectivo actual;
4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`;
6. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`;
7. incidente F10 `app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json`;
8. reconciliación provider fresca `app/docs/evidence/RC15-F10-FRESH-HR-SEMANTIC-ADJUDICATION-LATEST.json`;
9. gate del patch source F10 `app/docs/evidence/RC15-F10-OPERATIONAL-EVIDENCE-SOURCE-GATE-LATEST.json`;
10. matriz exacta de módulos `backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json`;
11. certificación de linaje F8.5 `app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json`;
12. manifest de composición `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
13. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md` y `app/docs/PENDIENTES-PROTOTIPO.md` más sus addenda F10 vigentes;
14. mirrors raíz únicamente si coinciden con la autoridad actual; si no, no pueden competir con este índice/overlay;
15. PR #7 únicamente como mirror histórico no autoritativo; está cerrado/draft/no mergeado;
16. única rama viva `docs-tya-v6-v71-audit`.

## Release, source sucesor F10 y linaje preservado

Release desplegado/congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 continúa certificando el linaje aprobado M1/V161C/V174/V182/C6 + fixes sucesores autorizados. La matriz F10 verifica **26 módulos Phase A + 10 módulos soporte + 5 módulos post-Phase-A cargados**, con `0` mismatches. `app/index-backend-dev.html` conserva blob `7a5f169dd0e239d46fa4af09cf67f2eb4329a477` y `app/app.js` conserva `2043d33dee611adacebc947c8423ed1739c1a8da`.

El único cambio funcional F10 posterior al source base del incidente es el sucesor autorizado:

- commit `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- blob `941051c96a26017363acfc72f7e88edbe70c68ba`;
- decisión `PASS_F10_SOURCE_PATCH_AND_APPROVED_MODULE_LINEAGE_INTACT__PREDEPLOY_HOLD`.

No se modificó ningún `app/modules/**`, `app/core/**`, `app/app.js` ni el entrypoint. Por tanto, el incidente F10 **no demuestra ni provoca una versión antigua de módulos**.

## Incidente F10 activo — causa adjudicada

`F10-HR-KPI-FRESHNESS-20260829-01` está `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`, P0 de producto=`false`.

El run fresco independiente `33281688280` certificó revisión provider `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`, `sourceReadAt=2026-08-29T23:44:58.827Z`, `cacheOrigin=runtime_refresh`, 660 visitas y 0 row-key duplicadas. La causa observada no fue un módulo viejo ni cache stale en esa revisión: fue la promoción retrospectiva de hitos canónicos usada indebidamente como evidencia operacional visible.

La fuente fresca de agosto exige separar:

- realizadas explícitas: `30` (`GT 24 / HN 6`);
- pendientes de realizar: `14`;
- cuestionario pendiente: `4` (`GT 4`);
- sin agendar operativas: `4` (`GT 3 / HN 1`);
- submitidas/candidatas a liquidación: `30`;
- liquidaciones confirmadas: `0`;
- pagos confirmados: `0`.

El patch F10 preserva el ciclo canónico para historia/auditoría y crea una verdad operacional separada basada en evidencia directa HR para los KPIs. `submitted` sigue siendo candidata a liquidación y nunca se convierte en liquidación/pago confirmado.

Cliente/Cliente 360 mantiene un HOLD separado; no se mezcla con esta reparación.

## Estado de visualización

La reparación F10 está aplicada y verificada **en source**, pero **no está desplegada**. El Hosting activo sigue siendo el release congelado anterior, que ya tenía el linaje correcto de módulos; por eso la versión de módulos desplegada continúa siendo la aprobada, pero los KPIs reparados todavía no pueden declararse visibles en Hosting.

No solicitar owner visual acceptance hasta completar el gate exact-source/browser y, después, un deploy explícitamente autorizado seguido de browser/live HR same-revision revalidation.

## Regla antidesincronización

Ningún archivo llamado `VIGENTE`, mirror raíz, workflow, request histórico o validador puede dirigir la ejecución a M2/M3/F8 ni volver a diagnosticar "módulos viejos" sin demostrar drift de blob/asset. Si contradice el overlay efectivo, la matriz y este índice, se considera **histórico/stale**, no autoridad.

No certificar un módulo por `route render` solamente: versión aprobada, asset servido y autoridad de datos se validan por separado.

## Seguridad

Sin provider/business/Auth/Firestore/HR/Storage/Rules/payment writes; sin Make/Gemini; sin deploy/rebuild/reimport/merge; sin nueva rama/PR/workflow; legacy DB prohibida.

## Siguiente acción exacta

`F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`.

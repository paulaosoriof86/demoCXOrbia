# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_HR_KPI_FRESHNESS_AND_CONTROL_PLANE_RECONCILIATION`  
**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado

## Source lock funcional y release de producción

El source funcional congelado permanece exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

Release: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 conserva el veredicto `PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`. El incidente F10 no demuestra drift de bytes del frontend y no cambia este source lock.

## Cursor operativo separado del source lock

La autoridad de cursor actual es el overlay `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`, epoch `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`.

Incidente activo: `F10-HR-KPI-FRESHNESS-20260829-01`, estado `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`, P0 de producto=`false`.

Esto distingue explícitamente:

- **qué versión debe servirse:** source/release congelado + linaje F8.5;
- **qué dato debe consumir:** autoridad HR fresca por revisión;
- **qué está abierto:** read-model/KPI/QA de F10;
- **qué no se reabre:** F5-F9 y restauraciones globales de candidatas.

## Regla de versión aprobada

No inferir una regresión de versión solo porque un KPI sea incorrecto. Primero se comprueba linaje/source/asset. Si ese plano coincide, el defecto se adjudica al read model, semántica o fuente antes de tocar módulos.

Módulos post-Phase-A o superficies expresamente excluidas de la autoridad Phase A no se declaran certificadas por F8.5 más allá del alcance documentado.

## Frescura HR

Una lectura normal con cache no certifica sincronización instantánea. Para QA operativo debe forzarse provider fresh read y capturarse `revision`/`sourceReadAt`; Dashboard y módulos dependientes se comparan contra esa misma autoridad, fila a fila y por país/estado.

## Hard locks

- no restaurar V182 completo;
- no nueva candidata/rama/PR/workflow por rutina;
- no rebuild/redeploy/reimport del release congelado sin gate de incidente y autorización explícita;
- no legacy DB;
- no Make/Gemini/pagos sin gate;
- no owner visual acceptance de KPIs HR hasta cerrar la reconciliación fresca.

**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_HR_KPI_FRESHNESS_AND_CONTROL_PLANE_RECONCILIATION`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100` histórico del release aceptado  
**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`

## Release preservado

Release activo/congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8.5 mantiene PASS de linaje aprobado y paridad del release. El incidente actual no demuestra drift de módulos ni autoriza restauración global, rebuild, redeploy o reimport.

## Incidente operativo activo

Incidente: `F10-HR-KPI-FRESHNESS-20260829-01`.

Estado: `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`; P0 de producto=`false`; F5-F9 no se reabren retroactivamente.

La conclusión previa del run `33257681796` queda limitada: sí hubo autenticación/navegación Admin+Shopper y coherencia interna, pero la prueba de KPIs usó `periodOperationalSummary` del mismo snapshot de `CX.data`. No demostró una lectura independiente de Google Sheets en el mismo instante.

Causas demostradas:

1. self-parity del QA en vez de frescura independiente;
2. HR runtime `stale-while-revalidate`, donde solo `fresh=1` espera la actualización provider;
3. pérdida de semántica canónica entre R20 y CX.data/KPIs, especialmente `submitted → liquidationCandidate` separado de liquidación/pago confirmado.

Pendiente de adjudicación fila a fila: delta de realizadas/pendientes, cuatro cuestionarios pendientes y estados actuales por país.

## Estado de módulos

- **Linaje/versiones aprobadas:** preservado según F8.5; no reabrir por rutina.
- **Dashboard / HR Source / Periodos / Histórico / Visitas / Postulaciones / Reservas / Shoppers / Liquidaciones:** exactitud dinámica retenida hasta reconciliar todos contra una única revisión provider fresca.
- **Finanzas históricas:** conciliación cerrada preservada; no usarla como sustituto del KPI operacional de candidatas.
- **Shopper:** identidad/histórico checkpoint-backed preservados; login humano por contraseña y visitas actuales requieren recertificación sobre la revisión fresca.
- **Cliente/Cliente 360:** HOLD separado; no mezclar con HR.
- **Academia/Documentos:** render preservado; solo se actualizan si cambia una definición funcional visible.

## Control plane

La autoridad efectiva actual es `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`. Cualquier mirror/validator que todavía indique M2, M3, F8 o readiness anterior se considera stale y debe sincronizarse antes de dirigir una ejecución.

## Seguridad

Provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; nueva rama/PR/workflow=0; legacy DB access=false.

## Siguiente bloque exacto

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.

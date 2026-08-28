# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F9-POSTPROD-ACCEPTED-10`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_CONTINUOUS_POSTPRODUCTION_MONITORING`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**NEXT:** `F10_PERMANENT_OPERATING_MODEL_AND_CONTINUOUS_POSTPRODUCTION_MONITORING`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100`

## Autoridad canónica viva

1. este índice;
2. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
3. base continuity lock `backend/config/cxorbia-phase-a-continuity-lock.json` + overlay terminal no destructivo `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`;
4. evidencia terminal F9 `app/docs/evidence/RC15-F9-POSTPRODUCTION-ACCEPTANCE-LATEST.json`;
5. evidencia F8.5 `app/docs/evidence/RC15-F8-5-CANONICAL-MODULE-LINEAGE-CERTIFICATION-LATEST.json`;
6. evidencia F8 `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json` y estado IAM cero-residuo;
7. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json` + errata overlay vigente;
8. `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json` como matriz histórica de autoridad de módulos;
9. checkpoint/source-lock/progress y CAMBIOS/Claude/Pendientes sincronizados;
10. PR #7 mirror-only, cerrado, draft y no mergeado;
11. única rama viva: `docs-tya-v6-v71-audit`.

## Release de producción preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

F8 demostró backup/export, restore temporal aislado, 9/9 colecciones, cleanup y reconciliación exacta del release sin redeploy. F8.5 certificó que el linaje aprobado M1/V161C/V174/V182/C6 y fixes sucesores coincide con el source/release vivo. No hubo reconstrucción, reimport ni sustitución del release en F9.

## F9 terminal — POSTPROD_ACCEPTED

La frase del master plan es `Ventana formal objetivo: 24 horas después del cutover`; **objetivo** no equivale a mínimo obligatorio ni a criterio `not-before`. La documentación inicial de F9 endureció indebidamente esa frase. Esa sobre-restricción quedó corregida sin modificar el master plan.

Con instrucción explícita vigente de Paula para cerrar F9 hoy, se aplicó aceptación acelerada el mismo día sobre la evidencia ya certificada del release: F5 lifecycle integral PASS y cero residuo; F7 readiness integral sin P0; F8 backup/restore/reconciliation PASS; IAM temporal con residuo cero; F8 bounded-load 24/24 GET, 5xx=0, contract failures=0 y p95=181.87 ms; F8.5 source/release lineage PASS.

**Decisión:** `POSTPROD_ACCEPTED`.  
**PRODUCTION_REAL_READINESS:** `98 → 100`.  
**Producto P0 demostrado:** `0`.

No se afirma que hayan transcurrido 24 horas de observación. Los controles continuos de Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas pasan a F10 como monitoreo permanente; eso no reabre F9 sin P0 reproducible.

## Seguridad del cierre F9

Provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=`0`; Make/Gemini=`0`; deploy/rebuild/reimport/merge=`0`; nueva rama/PR/workflow=`0`; legacy DB access=`false`.

El fallo DNS de la sesión fue `SESSION_EXTERNAL_HTTP_TRANSPORT_GAP_NOT_PRODUCT_FAILURE`; no se utilizó como excusa para crear transporte paralelo y no cambia el veredicto del producto.

## Siguiente acción exacta

`F10_PERMANENT_OPERATING_MODEL_AND_CONTINUOUS_POSTPRODUCTION_MONITORING`.

# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-CLOSED-ZERO-RESIDUE-F8_5-IN-PROGRESS-07`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`  
**currentMasterStep:** `F8_5_IDENTIFY_LAST_APPROVED_MODULES_AND_COMPARE_CANONICAL_TO_LIVE_HOSTING`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**NEXT:** `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` como lock de release/gates previo aún autoritativo;
3. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`;
6. autorización F8 histórica `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json`;
7. autorización IAM excepcional `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-AUTHORIZATION-LATEST.json`;
8. ejecución F8 terminal `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json`;
9. estado IAM temporal revocado `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-STATE-LATEST.json`;
10. mirrors checkpoint/source-lock/progress y addenda CAMBIOS/Claude/Pendientes;
11. PR #7 mirror-only, cerrado y no mergeado;
12. única rama viva: `docs-tya-v6-v71-audit`.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8 cerrado PASS cero residuo

Run provider `33193514608`, job `98924733768`, trigger exacto `dec6e8b451d6dd42303ff244703c798d22628975`, attempt 1.

Decisión: `PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY`; autorización consumida=true; providerWrites=4. Backup/export completado y retenido; base temporal creada; import completado; 9/9 colecciones top-level coinciden; base temporal eliminada; cleanup completo; release exacto reconciliado; deploy/rebuild/reimport=0; production business data/Firestore document/Auth/HR/Rules/pagos/Make/Gemini writes=0; legacy DB access=false.

Revocación IAM verificada con run `33187198967`, attempt 4, job `98940746944`, checkout vivo `be029042e9c937b3c29301be3e4e1b4524702e4f`. Tras retirar `roles/datastore.owner`, reaparecieron exactamente como ausentes los cinco permisos temporales: export/import/create/delete/operations.get. `datastore.databases.getMetadata` permanece como permiso basal previo. Bucket existente sigue verificado; provider writes=0; job F8 mutador=skipped. Residuo IAM=0.

Por cierre F8 cero-residuo, `PRODUCTION_REAL_READINESS` avanza `95 → 98`.

## F8.5 obligatorio antes de visualización

Está en ejecución `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. Debe identificar la última versión **aprobada** de cada módulo y comparar canónica versus Hosting vivo en `app/modules/**`, `app/core/**` relevante, entrypoints/index, scripts, adapters y rutas. Cualquier mismatch bloquea visualización humana y se clasifica por archivo/módulo antes de cualquier corrección.

La rama accidental `__invalid_should_not_create__` permanece inerte/no autoritativa y no debe usarse.

**NEXT:** `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`.

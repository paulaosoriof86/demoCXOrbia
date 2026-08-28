# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TEMP-IAM-EFFECTIVE-CAPABILITY-PASS-05`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__TEMP_DATASTORE_OWNER_EFFECTIVE__CAPABILITY_PASS`  
**NEXT:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No hubo rebuild, redeploy, reimport ni sustitución del release. La errata overlay corrige únicamente el fingerprint Hosting F6 defectuoso y preserva el tuple completo del release.

## F8

La autorización single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` continúa no consumida. El primer intento real se detuvo antes de mutación; provider writes=0.

El bloqueo de transporte quedó resuelto mediante el workflow existente y la identidad DEV ya existente. Paula autorizó y aplicó temporalmente `roles/datastore.owner` sobre esa identidad. El recheck read-only del run `33187198967`, attempt 3, job `98923457703`, checkout `e9875eb278316396aaf58fe7b31423228fb0940f`, cerró `PASS_F8_CUTOVER_CAPABILITY_READONLY`: `missingPermissions=[]`, bucket verificado y `issues=[]`.

Durante ese recheck el job F8 quedó `skipped` por marker inactivo; no hubo autenticación/mutación F8 ni consumo de la autorización.

El executor v6 pasó `node --check` en CI y ahora exige: manifest histórico exacto + errata exacta + release exacto + seis permisos Firestore + bucket GCS same-project realmente existente, ubicación compatible y permisos de objeto. La autorización se consume únicamente al iniciar el export.

Estado seguro actual: provider writes=0; backup/export=0; restore=0; cutover=0; deploy=0; rebuild=0; reimport=0; business/Auth/HR/Storage/Rules/pagos/Make/Gemini writes=0; legacy DB access=false; autorización F8 consumida=false.

## Después de F8

Revocar/verificar el binding temporal IAM y ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. No invitar a visualización humana antes de PASS transversal de última versión aprobada por módulo versus canónica y Hosting vivo.

**Siguiente gate exacto:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`.
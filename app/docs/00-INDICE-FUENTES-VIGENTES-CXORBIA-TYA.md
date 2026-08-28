# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TEMP-IAM-EFFECTIVE-CAPABILITY-PASS-05`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TEMP_IAM_GRANTED_CAPABILITY_PASS_READY_FOR_SUCCESSOR_MARKER`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__TEMP_DATASTORE_OWNER_EFFECTIVE__CAPABILITY_PASS`  
**NEXT:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` como lock de release/gates previo aún autoritativo;
3. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`, que corrige únicamente el fingerprint Hosting F6 sin cambiar el release;
6. evidencia F7 terminal `app/docs/evidence/RC15-F7-INTEGRAL-READINESS-LATEST.json`;
7. autorización F8 single-use `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json`;
8. autorización IAM excepcional `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-AUTHORIZATION-LATEST.json`;
9. evidencia de causa raíz/frontera IAM `app/docs/evidence/RC15-F8-IAM-BRIDGE-ROOT-CAUSE-LATEST.json`;
10. executor `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` schema v6;
11. entrypoint `tools/release/tya-f8-backup-restore-cutover-cli.mjs`;
12. workflow existente `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml`, reutilizado con gate exacto; no se creó workflow nuevo;
13. checkpoint/source-lock/progress y addenda CAMBIOS/Claude/Pendientes como mirrors;
14. PR #7 mirror-only, cerrado y no mergeado;
15. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de cualquier mutación provider.

## Release congelado preservado

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió. La huella Hosting histórica incorrecta de F6 quedó corregida únicamente mediante errata overlay; el asset vivo coincide con functional source congelado, runtime source congelado y rama actual.

## F8 — estado vivo

La autorización `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` sigue `AUTHORIZED_NOT_YET_CONSUMED`; el primer intento real se detuvo antes de mutación por metadata F6 incorrecta. Backup/export=0, restore=0, cutover=0, deploy=0 y provider writes=0 hasta este punto.

El transporte GCP dejó de ser bloqueo: existe identidad DEV válida y el workflow existente autentica correctamente. Paula autorizó y aplicó un binding temporal/condicionado de `roles/datastore.owner` sobre la identidad DEV existente. El recheck read-only del run `33187198967`, attempt 3, job `98923457703`, sobre HEAD `e9875eb278316396aaf58fe7b31423228fb0940f` terminó `PASS` completo: `PASS_F8_CUTOVER_CAPABILITY_READONLY`, `missingPermissions=[]`, bucket GCS existente/verificado y `issues=[]`.

El mismo run mantuvo el job F8 single-use en `skipped` porque no existe successor marker activo; por tanto la autorización F8 no se consumió durante el recheck.

### Bucket y executor

El bucket default anunciado por Firebase era inexistente. El executor v6 solo acepta ahora bucket GCS listado realmente en el mismo proyecto, con metadata, ubicación compatible y permisos de objetos verificados. `node --check` del executor v6 pasó en CI.

### Gate obligatorio posterior

Después de F8 terminal y revocación verificada del IAM temporal, ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. No invitar a visualización humana hasta que se determine la última versión aprobada de cada módulo y se compare contra canónica y Hosting vivo para `app/modules/**`, `app/core/**` relevante, entrypoints, scripts, adapters y rutas. Cualquier mismatch bloquea visualización.

### Control-plane

La rama accidental `__invalid_should_not_create__` es inerte/no autoritativa, no contiene trabajo único y no tiene PR. Nunca usarla. La única rama viva es `docs-tya-v6-v71-audit`.

**NEXT:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`.
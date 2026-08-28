# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TEMP-IAM-EFFECTIVE-CAPABILITY-PASS-05`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TEMP_IAM_GRANTED_CAPABILITY_PASS_READY_FOR_SUCCESSOR_MARKER`  
**NEXT:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest histórico `backend/config/cxorbia-phase-a-release-manifest-v1.json`; errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

La errata no cambia source SHA, runtime SHA, revision, digest, Hosting release/version ni contenido funcional; corrige únicamente la huella Hosting F6 no verificada originalmente. El asset vivo coincide con el functional source congelado, runtime source congelado y rama actual.

## F8 autorizado y listo para successor marker

La autorización `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` sigue no consumida. El transporte GCP ya está operativo con la identidad DEV existente.

Paula autorizó y aplicó un binding temporal/condicionado de `roles/datastore.owner` sobre la identidad DEV existente. Recheck read-only: run `33187198967`, attempt 3, job `98923457703`, checkout exacto `e9875eb278316396aaf58fe7b31423228fb0940f`, decisión `PASS_F8_CUTOVER_CAPABILITY_READONLY`, `missingPermissions=[]`, bucket existente verificado, `issues=[]`.

Durante ese recheck, el job F8 single-use permaneció `skipped` porque no existía successor marker activo; autorización consumida=false y provider writes=0.

El executor v6 exige manifest histórico exacto, errata exacta, release exacto, seis permisos Firestore y bucket GCS same-project real/verificado. No redeploy/rebuild/reimport si el tuple permanece exacto.

## Hard locks

- No crear credencial/service account/bucket/workflow/rama/PR como sustituto.
- No acceder a datos legacy.
- No Make/Gemini/pagos.
- No tocar frontend en F8.
- El successor marker debe ser el único archivo del commit trigger y declarar como `expectedParentHead` el HEAD vivo inmediatamente anterior.
- No reusar el marker histórico ni reejecutar un attempt F8 consumido.

## Gate posterior a F8

Después de F8 terminal y revocación verificada del IAM temporal: `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. No visualización humana antes de PASS de última versión aprobada de cada módulo versus canónica y Hosting vivo.

La rama accidental `__invalid_should_not_create__` es inerte/no autoritativa y no debe usarse. La única rama viva continúa `docs-tya-v6-v71-audit`.

**NEXT:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`.
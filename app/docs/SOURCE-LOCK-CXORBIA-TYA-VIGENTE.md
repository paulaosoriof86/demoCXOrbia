# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TERMINAL-PASS-PENDING-IAM-REVOCATION-06`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TERMINAL_PASS_PENDING_TEMP_IAM_REVOCATION_VERIFICATION`  
**NEXT:** `F8_REVOKE_TEMP_DATASTORE_OWNER_VERIFY_ZERO_RESIDUE_THEN_F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`. Manifest histórico + errata overlay preservan ese tuple exacto.

## F8 provider terminal PASS

Run `33193514608`, job `98924733768`, exact trigger HEAD `dec6e8b451d6dd42303ff244703c798d22628975`, parent `b4e33ea79de104e89a3ea91258e51040ab66092e`, attempt 1.

`PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY`; autorización consumida=true; automaticRetryAllowed=false. Backup/export completado; temp DB creada; import completado; 9/9 colecciones top-level coinciden; temp DB eliminada; cleanup completo; release exacto reconciliado; deploy/rebuild/reimport=0; production business/Firestore document/Auth/HR/Rules/pagos/Make/Gemini writes=0.

No reejecutar F8. No crear successor marker adicional. La autorización single-use está consumida.

## IAM temporal

`roles/datastore.owner` temporal debe retirarse ahora y verificarse. Hasta residuo cero, F8 queda `TERMINAL_PROVIDER_PASS_PENDING_TEMP_IAM_REVOCATION_VERIFICATION` y readiness 95.

## Gate posterior

Tras revocación verificada: F8 `CLOSED_PASS_ZERO_RESIDUE`, readiness 98, y ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION` antes de visualización humana.

Hard locks: sin nuevo deploy/rebuild/reimport; sin nueva credencial/IAM adicional/workflow/rama/PR; sin legacy DB; sin Make/Gemini/pagos; sin cambios frontend desde backend.

**NEXT:** `F8_REVOKE_TEMP_DATASTORE_OWNER_VERIFY_ZERO_RESIDUE_THEN_F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`.
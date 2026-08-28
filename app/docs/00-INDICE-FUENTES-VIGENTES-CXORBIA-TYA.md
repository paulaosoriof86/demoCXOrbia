# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-IAM-P1-NONBLOCKING-PRECUTOVER-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_IAM_METADATA_WARNING_RECONCILED_NONBLOCKING`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `READY_PRECUTOVER_GATES_WITH_NONBLOCKING_WARNINGS`  
**NEXT:** `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `4.2.0`;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. release manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia terminal F7 `app/docs/evidence/RC15-F7-INTEGRAL-READINESS-LATEST.json`;
6. evidencia provider F8 `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
7. evidencia de reconciliación `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`;
8. evidencias del intento IAM consumido y de ruta humana Owner como historia causal, no como requisito de cutover;
9. evidencias F8 Shopper y terminales F6/F5/F4/F3/M3 por referencia;
10. fuentes maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío;
11. checkpoint/source lock/progress lock/CAMBIOS/Claude/Pendientes como mirrors;
12. PR #7 permanece mirror-only, cerrado y no mergeado;
13. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, deploy, reimport ni sustitución del release ocurrió en este bloque.

## F8 — reconciliación antidesvío

F7 cerró `GO_WITH_WARNINGS`, P0=`0`, y clasificó la brecha de inventario fresco IAM/secrets como `F7-P1-002`. F8 ya obtuvo los readbacks materiales del runtime exacto: Cloud Run/revisión congelada PASS, `plaintextSensitiveKeyCount=0`, `secretBackedEnvCount=0`, Service Usage 4/4 PASS y cuotas 4/4 PASS. El único dato no legible es el listado de metadata de Secret Manager por ausencia de `secretmanager.secrets.list`; no se leyó ni exportó ningún payload de secreto.

La clasificación inferior que convirtió esa ausencia de metadata en bloqueo de mecanismo no puede elevar un P1 a P0 sin evidencia de producto. El master plan F8 congelado tampoco establece ese listado específico como criterio terminal. En consecuencia `F7-P1-002` queda preservado como warning de seguridad no bloqueante y **se retira del camino crítico la construcción de un puente Owner/IAM**.

La evidencia de una identidad humana `roles/owner` se conserva únicamente como dato administrativo; no hace falta automatizarla, probar su `setIamPolicy` ni crear WIF/service account/binding para continuar el cutover actual.

## Estado seguro y siguiente exacto

`PRODUCTION_REAL_READINESS` permanece `95/100`. Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; deploy/rebuild/reimport/merge=`0`.

`F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

Después de ese gate read-only, el backup/export + restore verificable y cualquier cutover/provider mutation seguirán requiriendo autorización explícita específica. El master plan V1.1 permanece congelado y la secuencia F8→F9→F10 no cambia.

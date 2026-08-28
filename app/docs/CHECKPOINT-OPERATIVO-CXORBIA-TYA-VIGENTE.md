# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-IAM-P1-NONBLOCKING-PRECUTOVER-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `READY_PRECUTOVER_GATES_WITH_NONBLOCKING_WARNINGS`  
**NEXT:** `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` permanece exacto: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`, Cloud Run `cxorbia-live-hr-dev-00013-rns`, image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`, Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`, Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## F8 — corrección del camino crítico

La búsqueda de un puente seguro Owner queda cerrada como desvío innecesario para el cutover actual.

F7 había cerrado `GO_WITH_WARNINGS`, P0=0, y `F7-P1-002` era P1. F8 ya confirmó sobre el release exacto: Cloud Run/revisión PASS, IAM de Cloud Run leído, `plaintextSensitiveKeyCount=0`, `secretBackedEnvCount=0`, APIs 4/4 habilitadas y cuotas 4/4 PASS sin overrides. Solo permanece inaccesible el listado de metadata Secret Manager por `secretmanager.secrets.list`; payloads de secretos no fueron leídos ni exportados.

Por tanto la ausencia de esa metadata se conserva como warning P1 y no exige crear WIF, service account, credenciales, IAM bindings ni automatizar la identidad humana Owner. La evidencia histórica del intento IAM consumido permanece íntegra y sin replay.

Evidencia de reconciliación: `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`.

## Estado seguro y siguiente

Readiness `95/100`. Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; deploy/rebuild/reimport/merge=`0`.

Siguiente gate exacto, sin intervención manual: `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

Después, el backup/export + restore verificable y el cutover continúan sujetos a autorización explícita específica antes de cualquier mutación provider.

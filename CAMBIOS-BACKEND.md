# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## 2026-08-20 — I5-G1 · PRODUCTION CUTOVER

### Resultado
`PRODUCTION_CUTOVER_EXECUTED`. Avance **98/100**. Producción canónica: `https://cxorbia-backend-dev.web.app`.

### Autorización consumida
Paula autorizó explícitamente: `AUTORIZO I5-G1: ejecutar el cutover de producción del mismo artefacto, sin rebuild y sin autorizar business/data writes.`

### Método aplicado
El contrato vigente define `PROMOTE_EXISTING_CLEAN_PROJECT`, `acceptCurrentIdentifiersAndUrlAsProduction=true` y `requiresSeparateProdFiles=false`. El mismo Hosting/Cloud Run ya desplegado y probado se promovió lógicamente a producción; no correspondía ni se ejecutó un nuevo provider deploy. Esto preserva el requisito same-artifact/no-rebuild.

### Archivos creados/tocados en este bloque
- creado `backend/config/cxorbia-g1-production-cutover.json`;
- actualizado `backend/config/cxorbia-phase-a-continuity-lock.json`;
- actualizado `backend/config/cxorbia-production-promotion-gate-evidence.json`;
- actualizado `backend/config/cxorbia-evidence-aliases.json`;
- actualizado `tools/production/validate-production-promotion-gates.js`;
- actualizado `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`;
- actualizado `tools/release/tya-rc-phase-a-drift-gate.mjs` para aceptar el estado post-G1 únicamente cuando el lock demuestra cutover ejecutado, producción activa, 0 redeploy, 0 rebuild y 0 business/data writes;
- sincronizados índice, Execution State, Source Lock, Checkpoint, Plan Operativo, Phase A Lock y Go-Live Tracker;
- sincronizados `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`;
- creado `app/docs/ACADEMIA-ADDENDUM-I5-G1-PRODUCTION-CUTOVER-20260820.md`.

### Corrección de validador post-cutover
El primer RC drift gate disparado después del commit G1 falló con `production_must_remain_unauthorized_before_G1`: era una condición histórica del propio validador, válida solo antes de cerrar G1. No demostró regresión de producto ni provider drift. Se corrigió la condición para que en `I5-G2` exija exactamente el estado opuesto y seguro: `productionIsAuthorized=true`, `productionCutoverExecuted=true`, `productionState.active=true`, providerRedeploy=false, rebuild=false y businessDataWritesAuthorized=false. Los scopes runtime protegidos continúan intactos.

### Seguridad
Provider redeploy=0; Hosting deploy=0; Cloud Run deploy=0; rebuild=0; merge=false; business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes=0. `tya-plataforma` intacto.

### Siguiente
`I5-G2_PRODUCTION_SMOKE_HYPERCARE_AND_FREEZE` ACTIVE. Cierre esperado `PRODUCTION_FROZEN_PASS_100`.

### Clasificación
- **Reusable CXOrbia:** promoción lógica del deployment limpio existente, receipt terminal, same-artifact/no-redeploy y drift gate consciente del estado pre/post cutover.
- **Exclusivo TyA:** project/Hosting/Cloud Run/URL y evidencia de roles/HR/Finanzas.
- **Claude/prototipo:** sin cambios de UI o runtime funcional.
- **Academia:** addendum G1; sin cambio funcional de contenido.
- **Sin impacto Claude:** control-plane, validators y documentación.

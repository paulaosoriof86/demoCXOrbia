# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado
**98% / 2% pendiente.** G1 PASS `PRODUCTION_CUTOVER_EXECUTED`. Producción canónica activa en `https://cxorbia-backend-dev.web.app` con same artifact y no redeploy.

## Pendiente activo único
`I5-G2_PRODUCTION_SMOKE_HYPERCARE_AND_FREEZE`: validar producción real y cerrar RC12. No existe otro bloque intermedio.

## No reabrir
I1–I4, R1–R4 y G1 están congelados. No repetir cutover, no rebuild, no nueva candidata/rama/PR/workflow/PREPROD y no rerun de requests consumidos sin `P0_PROVEN` nuevo.

## Frontend
Sin P0 frontend activo. `modules/cliente-extra.js` / exports continúa como hallazgo histórico separado no bloqueante salvo evidencia nueva.

## Academia
Sin pendiente de reconstrucción por G1. Registrar producción canónica/URL; G2 determinará si existe alguna incidencia real que afecte manuales, cursos, roles o notificaciones.

## Seguridad
G1: 0 provider redeploy, 0 business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes, 0 merge, 0 rebuild. Legacy intacto.

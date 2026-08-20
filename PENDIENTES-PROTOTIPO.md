# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado
**98% / 2% pendiente.** G1 PASS/FROZEN. **G2-A PASS/FROZEN**. No P0 de producto nuevo.

## Único pendiente G2-B
`LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE` dentro de la misma plataforma productiva, visible para Paula, cubriendo Admin, Shopper, Cliente, HR, histórico, visitas, Finanzas, sincronización, scopes, navegación, reload/new-tab y observabilidad. Datos `CXORBIA_E2E_SYNTH_*`, cleanup y readback obligatorios.

Estado: `AUTHORIZED_SYNTHETIC_STAGE_PENDING_EXECUTION`. La autorización permite exclusivamente create/update/delete de datos sintéticos; Auth sintético create/delete si resulta indispensable; Storage sintético upload/delete si es necesario. No autoriza HR externa, modificaciones/reset de usuarios reales, pagos reales, Make/Gemini, deploy, rebuild ni merge.

Pendientes exactos: 1) ejecutar stage/test one-shot; 2) dejar escenario visible y capturar observaciones reales de Paula; 3) ejecutar cleanup; 4) post-clean readback con cero residuales `CXORBIA_E2E_SYNTH_*`; 5) congelar G2/RC12 y 100% solo si no existe P0 reproducible.

## No reabrir
I1–I4, R1–R4, G1 y G2-A. No crear G3, otra candidata, rama, PR, workflow o PREPROD. Solo P0 reproducible puede reabrir producto.

## Frontend/Academia
Sin P0 frontend activo. Las observaciones de G2-B se registrarán por módulo y solo generarán ajuste de Academia si prueban diferencia funcional real.

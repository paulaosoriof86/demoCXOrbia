# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-26  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`  
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`  
**F4:** `TERMINAL_STOP_MECHANISM_P0_POST_HOSTING_READBACK_NOT_STABILIZED`  
**NEXT:** `WAITING_EXPLICIT_PLAN_CHANGE_OR_READONLY_RECERTIFICATION_DECISION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Cerrado y preservado

M3 y F3 permanecen cerrados. El único intento F4 ya fue consumido. Cloud Build, Cloud Run, smoke directo y Hosting deploy pasaron una vez; no hay autorización para repetirlos.

## Pendiente inmediato único

Resolver por decisión explícita el STOP `MECHANISM_P0 — POST_HOSTING_READBACK_NOT_STABILIZED`.

La evidencia demuestra que, inmediatamente después del release Hosting, el gate recibió un adapter remoto sin los marcadores G2-B obligatorios y falló antes del smoke API. El source-fix sí contiene esos marcadores. Falta una certificación read-only estable y vinculada al release para poder demostrar o descartar que Hosting ya sirve el contenido correcto tras propagación.

No ejecutar una recertificación ni modificar provider por inferencia. El plan vigente terminó F4 en STOP; cualquier continuación requiere decisión explícita. Si se autoriza una recertificación read-only, no puede consumir ni reutilizar el lease F4 y no puede desplegar nada.

## Bloqueos

- F4 `RECOVERY_PASS_FULL`: no demostrado.
- F5 aceptación sintética: bloqueada.
- Residuo sintético post-recovery: no certificado.
- Estado Hosting post-propagación: `NOT_CERTIFIED_BY_F4_TERMINAL_EVIDENCE`.

## Producto / Claude / Academia

No existe P0 de producto demostrado por este STOP. No tocar `/app/modules`, `/app/core` ni UI. Sin tarea frontend nueva para Claude. Academia: sin impacto funcional en este bloque.

# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F7_GO_WITH_WARNINGS__WAIT_F8_AUTH`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 queda `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, no rebuild/redeploy del release congelado, no reimportar datos y no crear nueva candidata por rutina.

## Warnings vivos F7

1. P1: reparar dependencia `firebase-admin` del predeploy run `33085991102` antes de reutilizar ese carril.
2. P1: revalidar provider-side IAM/secrets/cuotas en precheck F8.
3. P1: ejecutar prueba acotada de carga/cuotas/failure injection sobre release exacto antes del cutover.
4. P1: verificar backup/export + restore antes de cualquier mutación F8.
5. P2: ensayar alert delivery/runbook.
6. P2: completar auditoría profunda de contenido Academia por rol/módulo sin convertirla en rediseño bloqueante.

Ninguno es P0 demostrado. No autoriza adelantar F8 ni parchear UI.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- base nueva y limpia; legacy solo export/import útil;
- multi-tenant `tenantId` + `projectId`;
- Cinépolis proyecto configurable, no lógica global;
- conflictos HR/identidad no se sobrescriben silenciosamente;
- estados honestos para funciones no activas;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- Academia profunda, editable, por rol/módulo y sincronizada con cambios reales.

## Pendientes posteriores

- F8 `95 → 98`: cutover exacto, requiere autorización específica vigente y prechecks fail-closed.
- F9 `98 → 100`: aceptación postproducción.
- F10: operación permanente.

## Acción actual

`WAIT_FOR_F8_EXPLICIT_AUTHORIZATION`.

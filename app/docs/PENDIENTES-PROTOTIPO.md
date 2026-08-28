# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_BOUNDED_PASS__BACKUP_RESTORE_AUTH_GATE`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, IAM Owner bridge, no rebuild/redeploy del release congelado, no reimportar datos y no crear candidata por rutina.

## F8 — cerrado

- `F7-P1-002`: metadata Secret Manager no listable; P1 documentado y no bloqueante.
- `F7-P1-003`: `CLOSED/PASS` con run `33131739261`: 24/24 GET, concurrencia 4, 0 5xx, 0 contract failures, p95 181.87 ms, fail-closed acotado, 15 períodos y 660 visitas. Run `33131536618` = falso negativo de harness, no P0.
- No existe evidencia de drift del release congelado; redeploy no requerido ahora.

## Pendiente real actual

`F7-P1-004`: backup/export + restore verificable previo al cierre F8. Junto con cualquier cutover/provider mutation, requiere autorización explícita específica vigente. No hay un ejecutor F8 activo y ya autorizado identificado en el control-plane vivo inspeccionado; no revivir workflows históricos/consumidos.

**NEXT:** `F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE`.

## Warnings no bloqueantes posteriores

1. P1 `F7-P1-002`: metadata Secret Manager.
2. P2 `F7-P2-001`: alert delivery/runbook rehearsal.
3. P2 `F7-P2-002`: profundidad de Academia por rol/módulo.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 inmutable mientras no exista gate que autorice sustitución;
- base nueva y limpia; legacy solo export/import útil;
- multi-tenant `tenantId` + `projectId`;
- Cinépolis configurable, no lógica global;
- conflictos HR/identidad no se sobrescriben silenciosamente;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- P1/P2 se documentan y no bloquean sin P0 probado;
- Academia profunda, editable, por rol/módulo y sincronizada con cambios reales.

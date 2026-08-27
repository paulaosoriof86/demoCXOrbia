# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_EXTERNAL_OWNER_ROUTE_IDENTIFIED__EFFECTIVE_TEST_PENDING`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, no rebuild/redeploy del release congelado, no reimportar datos y no crear nueva candidata por rutina.

## F8 — pendiente real único de este bloque

La ruta automatizada DEV existente sigue sin `resourcemanager.projects.setIamPolicy`; el intento temporal autorizado permanece consumido y no tuvo provider writes.

Nueva evidencia visual del proyecto exacto `cxorbia-backend-dev` demuestra que existe una identidad humana con rol `Propietario` / `Owner`. Por documentación oficial, ese rol incluye `resourcemanager.projects.setIamPolicy`; sin embargo, antes de declarar capacidad efectiva debe ejecutarse `projects.testIamPermissions` con esa sesión humana para descartar deny/restricciones efectivas.

### Próxima comprobación permitida

`F8_VERIFY_EXTERNAL_OWNER_EFFECTIVE_SET_IAM_CAPABILITY`.

Comprobar únicamente `resourcemanager.projects.setIamPolicy` mediante `projects.testIamPermissions` en modo read-only/capability-only.

Esta comprobación no concede roles. Si PASS, cualquier grant temporal posterior requiere autorización explícita nueva y separada; la autorización anterior no revive.

## Warnings F7 que permanecen después de resolver IAM

1. P1: prueba acotada fresca de carga/cuotas/failure injection sobre release exacto.
2. P1: backup/export + restore verificable antes de mutaciones/cutover que lo requieran.
3. P2: alert delivery/runbook rehearsal.
4. P2: completar auditoría profunda de contenido Academia por rol/módulo.

No convertir estos warnings en P0 sin evidencia reproducible.

## Reglas vigentes

- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- release F6 inmutable mientras no exista gate que autorice sustitución;
- base nueva y limpia; legacy solo export/import útil;
- multi-tenant `tenantId` + `projectId`;
- Cinépolis proyecto configurable, no lógica global;
- conflictos HR/identidad no se sobrescriben silenciosamente;
- estados honestos para funciones no activas;
- Make/Gemini/pagos solo con gate real;
- datos sensibles protegidos y fuera del repo;
- Academia profunda, editable, por rol/módulo y sincronizada con cambios reales.

## Pendientes posteriores

- F8 `95 → 98`: capability test efectivo, metadata readback y demás gates exactos antes del cutover terminal.
- F9 `98 → 100`: aceptación postproducción.
- F10: operación permanente.

## Acción actual

`F8_VERIFY_EXTERNAL_OWNER_EFFECTIVE_SET_IAM_CAPABILITY` — prueba read-only desde la identidad humana Owner; no grant, deploy ni cutover.

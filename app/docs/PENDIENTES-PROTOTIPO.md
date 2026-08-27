# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_IAM_CAPABILITY_HOLD__EXTERNAL_ROUTE_REQUIRED`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, no rebuild/redeploy del release congelado, no reimportar datos y no crear nueva candidata por rutina.

## F8 — pendiente real único de este bloque

Estado: `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`.

La ruta DEV disponible no tiene `resourcemanager.projects.setIamPolicy`. El intento temporal autorizado ya está consumido y no tuvo provider writes. No se leyó metadata Secret Manager ni payloads de secretos.

La búsqueda de una ruta reutilizable quedó cerrada en los canales disponibles: repo/workflows, plugins/conectores, Drive y Gmail. No apareció evidencia suficiente de un principal provider autenticable por el mecanismo actual con capacidad `setIamPolicy`.

Sí existe un canal humano Google Cloud autenticado en la cuenta conectada, pero todavía no está probado que esa identidad tenga Owner/Project IAM Admin —o permiso equivalente— específicamente sobre `cxorbia-backend-dev`.

### Próxima comprobación permitida

Identificar una identidad administrativa candidata en Google Cloud y comprobar únicamente la capacidad `resourcemanager.projects.setIamPolicy` en modo read-only/capability-only.

Esta comprobación no concede roles. Si PASS, cualquier grant temporal posterior requiere autorización explícita separada.

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

- F8 `95 → 98`: completar cutover exacto solo después de cerrar la frontera IAM y los gates restantes.
- F9 `98 → 100`: aceptación postproducción.
- F10: operación permanente.

## Acción actual

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE` — lado externo/humano de Google Cloud; no repetir búsqueda interna ni el intento consumido.

# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__PROD_READINESS_95__F8_HUMAN_OWNER_ROUTE_OBSERVED__SECURE_BRIDGE_HOLD`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5 y F6 permanecen terminales. F7 permanece `GO_WITH_WARNINGS_NO_P0`.

Phase A=`100/100`; Production Real Readiness=`95/100`; release congelado=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

No reabrir synthetic lifecycle, F7, R24/Corte 4, no rebuild/redeploy del release congelado, no reimportar datos y no crear nueva candidata por rutina.

## F8 — pendiente real único de este bloque

La ruta automatizada DEV existente sigue sin `resourcemanager.projects.setIamPolicy`; el intento temporal autorizado permanece consumido y no tuvo provider writes.

La evidencia del proyecto exacto demuestra una identidad humana `roles/owner`. Por tanto ya no está pendiente “encontrar un administrador”; está pendiente un **carril seguro de ejecución** que permita usar capacidad administrativa sin pedir claves, convertir la cuenta humana en secreto ni crear infraestructura IAM sin autorización.

La búsqueda focalizada no encontró OIDC/WIF existente en el repo ni conector GCP/IAM disponible en esta sesión.

### Próxima frontera

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

Antes de cualquier grant:
1. disponer de un canal autenticado seguro;
2. probar efectivamente `resourcemanager.projects.setIamPolicy` en modo capability-only;
3. solo si PASS, pedir autorización explícita nueva para cualquier IAM mutation.

No se solicita acción manual a Paula en este corte y no se revive la autorización anterior.

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

- F8 `95 → 98`: cerrar puente seguro/capability IAM, metadata readback y demás gates exactos hasta cutover terminal.
- F9 `98 → 100`: aceptación postproducción.
- F10: operación permanente.

## Acción actual

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE` — sin grant, deploy, cutover ni intervención manual solicitada en este corte.

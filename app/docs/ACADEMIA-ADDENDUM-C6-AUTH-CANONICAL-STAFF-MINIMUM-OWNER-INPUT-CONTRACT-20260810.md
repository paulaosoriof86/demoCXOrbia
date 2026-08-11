# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia antes de producción.

## Principios reutilizables

- identidad empresarial, rol y alcance son dimensiones separadas;
- `TyA completo` no equivale a wildcard;
- el alcance de un usuario debe definirse explícitamente al crearlo y poder modificarse después bajo autorización;
- `Proyectos específicos` debe venir de un inventario vivo y auditable, no de texto libre ni IDs hardcodeados;
- `TyA completo` se materializa como projectIds exactos;
- un proyecto nuevo no debe ampliar privilegios silenciosamente: los usuarios con alcance completo requieren revisión/confirmación explícita de expansión;
- cambios de rol/alcance deben dejar audit trail y readback;
- alta, edición, deshabilitación y reactivación son operaciones diferentes;
- credenciales y claims técnicos no se enseñan ni exponen como contenido de usuario.

## Estado de staff inicial

La decisión empresarial de los cuatro accesos iniciales quedó cerrada como `TYA_COMPLETE`. Solo se documentan aliases/digests source-safe; no nombres, correos, UIDs ni credenciales.

## Backend reusable

El contrato `backend/contracts/c6-live-user-admin-v1.json` v1.1 y el handler `backend/runtime/hr-live-service/user-admin.mjs` formalizan:

- scope obligatorio en alta;
- scope editable;
- inventario canónico vivo;
- RBAC;
- audit/readback/rollback;
- cero hard delete por defecto.

Para manuales futuros, la pantalla Usuarios & Permisos debe explicar en lenguaje humano la diferencia entre `TyA completo` y `Proyectos específicos`, incluida la revisión cuando aparezcan proyectos nuevos. No mostrar fingerprints, claims, provider email ni detalles de implementación.

## HR viva

M6 permanece cerrado. La HR viva y su observabilidad siguen siendo conceptos separados; no repetir mapeo por fallos de telemetría.

**Impacto Academia:** conceptual/documental. No bloquea producción ni exige una nueva lección antes del cutover.

**Avance de cierre certificado:** 82%.
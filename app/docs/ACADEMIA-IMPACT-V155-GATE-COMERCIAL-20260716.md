# ACADEMIA — IMPACTO V155 GATE COMERCIAL

Fecha: 2026-07-16

## Clasificación

`Academia`: impacto directo en contenido y audiencia; sin cambio backend.

## Regla

Los roles admin, operaciones, coordinador, aliado, shopper y cliente son audiencias comerciales. Sus cursos y manuales no deben exponer términos internos como:

- backend/runtime;
- source-safe;
- pending_backend;
- reviewQueue/auditEvents;
- sourceRef/connectionRef;
- manifest/source lock/BUILD_ID;
- rutas `app/docs`;
- dry-run.

El contenido técnico puede conservarse únicamente para una audiencia interna realmente protegida y no accesible desde el build o la URL comercial.

## Hallazgo V155

El curso técnico `a_backend` ya quedó oculto correctamente, pero manuales y cursos comerciales todavía contienen jerga técnica. El P0 no se cierra hasta ejecutar un barrido automatizado de DOM, modales, tooltips, toasts, manuales y cursos por cada rol comercial.

## Lenguaje funcional

Usar conceptos como:

- Pendiente de conexión.
- Pendiente de activación.
- Vista previa.
- Pendiente de validación.
- En revisión.
- Sistema central.

## Estado

- No modificar rutas, contratos o estados internos solo por copy.
- Mantener honestidad funcional.
- No se requiere cambio TyA/Cinépolis.
- Sin deploy, producción, imports ni writes.
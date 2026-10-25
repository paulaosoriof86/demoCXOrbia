# ACADEMIA ADDENDUM — I3.2 RUNTIME GATE + DIAGNÓSTICO GRANULAR

**Fecha:** 2026-08-17 13:27 -06:00

## Impacto

El bloque I3.2 confirma un patrón reusable para manuales, cursos y capacitación técnica CXOrbia:

1. `source PASS` no equivale a `runtime PASS`;
2. `deploy PASS` y paridad remota exacta tampoco equivalen por sí solos a una ruta funcional;
3. un handoff no se declara operativo solo porque `#app` esté visible y el login oculto: debe existir router/shell montado, contexto de proyecto/periodo y ausencia de gates previos pendientes;
4. las aserciones E2E deben separar causas y dejar evidencia granular; un error agrupado no autoriza parchear producto por intuición;
5. aceptación legal nunca se automatiza para hacer pasar pruebas;
6. un request one-shot consumido no se rerun; se corrige focalmente y se abre un gate nuevo solo si es necesario.

## Rutas por rol

No cambia el contenido funcional de Admin/Shopper/Cliente. Sí cambia el criterio de certificación técnica de una ruta: `Auth + membership + authority + router mounted + project/period context + gate legal resuelto cuando aplique + provider-backed persistence`.

## Estado

Sin cambio a cursos de negocio todavía. Incorporar este patrón cuando I4.10 cierre manuales/rutas/notificaciones. No tocar contenido frontend ni aceptar V0.4 automáticamente.

Clasificación: Reusable CXOrbia = sí; Exclusivo cliente = evidencia TyA DEV; Claude/prototipo = sin cambio; Academia = patrón técnico; Sin impacto Claude = sí.

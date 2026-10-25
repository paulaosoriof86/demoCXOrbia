# ACADEMIA ADDENDUM — I3.2B NO_PERIODS_VISIBLE · LIFECYCLE DE MEMBERSHIP VERIFICADA

**Fecha:** 2026-08-17 14:09 -06:00

## Patrón reusable

Un principal puede estar correctamente autenticado y una membership correctamente verificada, pero el primer render puede usar un scope incorrecto si un wrapper reconstruye la sesión antes de que la metadata verificada sea republished.

En TyA, el runtime probó 15 periodos/660 visitas y `cinepolis-2026-08` activos, pero el rail mostraba `Sin periodos disponibles`. La causa fue la ventana síncrona `Auth wrapper rebuild → CX.app.enter() → router.mount() → post-enter membership republish`.

## Criterio técnico para manuales/cursos

No certificar una ruta solo por Auth/data ready. Debe verificarse que el scope usado por el primer render provenga de una autoridad ya verificada y que proyecto raíz ≠ ID de periodo.

Fallback transitorio permitido únicamente si tenant/namespace/role/projectIds coinciden exactamente con la membership ya verificada. Nunca confiar en `scopeProjectId` crudo, matching visual o hardcode de UI.

## Legal

El mismo runtime mostró legal loaded/provider-backed/not pending; por tanto el gate legal no fue causa del fallo actual. La aceptación sigue siendo humana y el receipt durable completo se valida en I3.7.

## Estado

Source fix + QA preflight PASS; runtime post-fix requiere I3.2C. No cambios a módulos/cursos funcionales todavía.

Clasificación: Reusable CXOrbia = sí; Exclusivo cliente = evidencia TyA/Cinépolis; Claude/prototipo = sin cambios UI/core; Academia = patrón de lifecycle/readiness; Sin impacto Claude = sí salvo no revertir el fix.

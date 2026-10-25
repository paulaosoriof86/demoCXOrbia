# ACADEMIA — Impacto C6 Login root fix y STOP remoto

**Fecha:** 2026-08-05

## Contenido que ya puede actualizarse

Los materiales por rol pueden reflejar como validado en DEV:

- entrada mediante el Login integrado V7.2;
- autenticación Staff;
- autenticación Shopper;
- autenticación Cliente;
- continuidad de sesión después de recarga;
- continuidad en nueva pestaña;
- aislamiento entre namespaces Staff y Shopper;
- ausencia de exposición de credenciales y tokens.

## Evidencia operativa que debe incorporarse

- El Login visible usa `.lg2-card`.
- Los bridges admiten tanto `.lg2-card` como `.login-card` para compatibilidad acumulativa.
- El acceso no depende de selectores de usuario demo ni de credenciales visibles.
- Shopper conserva acceso a su identidad exacta y al menos una visita propia en el smoke remoto.
- Cliente conserva tenant/proyecto y sesión en recarga/nueva pestaña.

## Contenido que aún no debe declararse cerrado

No marcar como validado el recorrido completo del módulo Panorama Cliente. El gate acumulativo se detuvo en `client_route_wait` después de solicitar `cli_dashboard`.

Hasta el diagnóstico focal, los manuales deben separar:

- **Login Cliente:** validado;
- **sesión Cliente:** validada;
- **render/navegación completa de Panorama Cliente:** pendiente de diagnóstico read-only.

## Rutas por rol y notificaciones

- No cambian rutas, permisos ni notificaciones.
- No se activaron Make, Gemini, correo, WhatsApp ni pagos.
- No se modificaron cursos, certificaciones o evaluaciones.

## Próxima actualización de Academia

Después del diagnóstico de `client_route_wait`, registrar si el hallazgo corresponde a:

1. defecto real de render/navegación del Portal Cliente; o
2. predicado/timing del harness remoto.

No preparar contenido correctivo antes de esa clasificación.

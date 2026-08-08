# ACADEMIA — Impacto C6 DEV root funcional PASS y HOLD de higiene QA

**Fecha:** 2026-08-05  
**Clasificación:** Academia · Sin cambio funcional

## Estado

La URL raíz DEV ya abre la entrada humana canónica y los gates funcionales desde `/` pasaron para Staff, Shopper, Cliente, portales, Finanzas y Reservas.

## Impacto en Academia

No se modificaron:

- módulos de Academia;
- cursos y lecciones;
- certificaciones;
- manuales;
- rutas por rol;
- notificaciones;
- contenidos ni navegación educativa.

```text
ACADEMIA_FUNCTIONAL_IMPACT=false
COURSE_CONTENT_CHANGED=false
ROLE_ROUTES_CHANGED=false
NOTIFICATIONS_CHANGED=false
```

## HOLD técnico

El estado HOLD pertenece exclusivamente al guard de higiene del workflow, que observó un archivo efímero de autenticación antes del cleanup. No representa una regresión de Academia ni del producto.

## Documentación y capturas

Los manuales y capturas pueden actualizarse únicamente después de la validación humana de Paula sobre la release DEV existente. No se requiere otro deploy.

## Seguridad

Un Hosting DEV ejecutado; cero Cloud Run, writes, Make, Gemini, pagos, merge o producción.

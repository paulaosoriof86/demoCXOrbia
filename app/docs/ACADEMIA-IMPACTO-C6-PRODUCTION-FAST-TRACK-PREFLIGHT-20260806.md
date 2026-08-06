# ACADEMIA — Impacto C6 fast-track de producción source-only

**Fecha:** 2026-08-06

## Aprendizaje reusable

Un entorno validado en DEV no está listo para producción mientras el repositorio no materialice y verifique explícitamente:

- alias de proyecto de producción;
- target de Hosting de producción;
- servicio backend de producción;
- credenciales y permisos separados;
- rollback y smoke asociados al target correcto.

## Caso CXOrbia TyA

La configuración vigente referencia únicamente `cxorbia-backend-dev`, `cxorbia-dev` y `cxorbia-live-hr-dev`. Por tanto, un deploy desde esa configuración seguiría siendo DEV aunque la aplicación fuera funcional.

## Impacto en cursos y manuales

Agregar al contenido de despliegue y operación una lección sobre separación DEV/PROD, verificación de target antes del deploy y prohibición de usar un proyecto legacy como backend nuevo.

No hay cambios en rutas por rol, notificaciones o interfaz de Academia en este bloque.

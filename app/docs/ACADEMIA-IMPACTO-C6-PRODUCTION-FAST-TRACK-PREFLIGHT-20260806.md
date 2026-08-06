# ACADEMIA — Impacto C6 fast-track de producción source-only

**Fecha:** 2026-08-06

## Aprendizaje reusable

Un entorno validado técnicamente no se convierte en producción solo por ejecutar un deploy. Antes debe existir un contrato explícito de promoción que determine cuál de estas estrategias se adopta:

- promover el proyecto limpio existente y aceptar sus identificadores, URL, target y servicio actuales como producción; o
- utilizar otro proyecto limpio con configuración separada.

En ambos casos se deben verificar permisos, credenciales, rollback, smoke y prohibición de reutilizar la base legacy como backend nuevo.

## Caso CXOrbia TyA

La configuración vigente referencia `cxorbia-backend-dev`, `cxorbia-dev` y `cxorbia-live-hr-dev`, con región `us-central1`, directorio `app` y UTF-8 correctos. Esa configuración puede ser candidata a promoción, pero solo mediante autorización expresa. No se asume que deba crearse otro proyecto ni que el entorno actual pueda convertirse automáticamente en producción.

## Gate documentado

`tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs` valida source-only el contrato de promoción y acepta únicamente:

```text
PROMOTE_EXISTING_CLEAN_PROJECT
SEPARATE_CLEAN_PROD_PROJECT
```

El estado actual es `HOLD_PRODUCTION_STRATEGY_UNMATERIALIZED` porque todavía no existe contrato autorizado.

## Impacto en cursos y manuales

Agregar al contenido de despliegue y operación una lección sobre estrategia explícita de promoción, verificación del target exacto, rollback y separación obligatoria respecto de la base legacy.

No hay cambios en rutas por rol, notificaciones o interfaz de Academia en este bloque.

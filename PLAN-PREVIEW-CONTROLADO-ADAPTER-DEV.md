# PLAN-PREVIEW-CONTROLADO-ADAPTER-DEV.md

## Objetivo

Preparar preview controlado del adapter Firebase en DEV sin tocar producción.

## Archivos

- app/core/backend-firebase.js
- app/core/backend-config-preview-dev.js
- app/index-backend-dev.html

## Seguridad

- CX.BACKEND.enabled sigue en false en app/core/backend-config.js.
- El preview solo se activa desde index-backend-dev.html.
- Requiere token de URL.
- La clave DEV temporal no queda en GitHub.
- No se modifica /app/modules.
- No se hace deploy de Hosting productivo.
- No hay merge.
- No se toca producción.

## Token preview

```text
?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV
```

## Siguiente paso

Probar preview local o canal DEV, solo con autorización separada.

# Handoff frontend runner TyA

Fecha: 2026-07-03

## Archivos agregados

- tools/docs/build-tya-frontend-handoff.mjs
- tools/docs/run-tya-frontend-handoff.ps1

## Objetivo

Generar paquete local resumido para la siguiente entrega visual.

## Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\docs\run-tya-frontend-handoff.ps1
```

## Salida

- tmp/tya-frontend-handoff/TYA_FRONTEND_HANDOFF.md
- tmp/tya-frontend-handoff/manifest.json

## Seguridad

- Sin deploy.
- Sin carga de datos.
- Sin escritura en base.

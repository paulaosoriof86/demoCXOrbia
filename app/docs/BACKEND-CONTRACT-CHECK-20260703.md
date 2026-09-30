# Backend contract check

Fecha: 2026-07-03

## Objetivo

Validar que el contrato backend data exista y siga inactivo.

## Archivos agregados

- tools/backend/cx-backend-contract-check.mjs
- tools/backend/run-cx-backend-contract-check.ps1

## Salidas locales

- tmp/cx-backend-contract-check/cxBackendContractCheck.md
- tmp/cx-backend-contract-check/cxBackendContractCheck.json

## Comando

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\backend\run-cx-backend-contract-check.ps1
```

## Seguridad

- Sin deploy.
- Sin importacion.
- Sin escritura.

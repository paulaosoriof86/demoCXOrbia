# RUNBOOK-BACKEND-RUNTIME-VALIDACION-20260629

## Objetivo

Validar que los archivos runtime de backend existan antes del preview DEV.

## Comando

```text
node firebase/client-write-tools/validate-backend-runtime-files.mjs
```

## Qué revisa

```text
app/core/backend-firebase.js
app/core/backend-finance-benefits.js
app/core/backend-operational-actions.js
app/core/backend-cxdata-finance-read.js
app/index-backend-dev.html
app/core/backend-config-preview-dev.js
```

## Salidas

```text
firebase/private-output/backend-runtime-files-validation.json
firebase/private-output/backend-runtime-files-validation-summary.md
```

## No hace

No ejecuta Firebase, no escribe datos, no modifica módulos y no toca producción.

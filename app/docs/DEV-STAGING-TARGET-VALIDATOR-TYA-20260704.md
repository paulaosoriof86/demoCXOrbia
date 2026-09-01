# DEV staging target validator TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-dev-staging-target-validator.mjs`

## Proposito

Validar variables de entorno para una futura revision de runner DEV habilitado.

Este validador no escribe, no importa y no despliega.

## Variables esperadas

- `CXORBIA_TYA_TARGET_ENV=DEV`
- `CXORBIA_TYA_TENANT_ID=tya`
- `CXORBIA_TYA_PROJECT_ID=tya-migration-dev`
- `CXORBIA_TYA_BATCH_ID=tya-dev-import-YYYYMMDD-HHMMSS`
- `CXORBIA_TYA_ENABLE_DEV_WRITE_RUNNER=I_UNDERSTAND_DEV_ONLY`

## Salidas locales si se ejecuta

En `tmp/tya-dev-staging-target-validator`:

- `devStagingTargetValidator.json`
- `devStagingTargetValidator.md`

## Estado

- Validador local.
- Sin runtime de escritura.
- Sin deploy.
- Sin produccion.
- Sin cambios frontend.

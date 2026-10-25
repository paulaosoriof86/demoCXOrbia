# Future enabled runner contract TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-future-enabled-runner-contract.mjs`

## Proposito

Definir el contrato tecnico para un runner habilitado futuro, sin crearlo ni ejecutarlo.

Este bloque mantiene `executeAllowed=false` y no escribe en ninguna base.

## Entradas locales esperadas

- `tmp/tya-controlled-dev-write-plan/controlledDevWritePlan.json`
- `tmp/tya-controlled-dev-authorization-review/controlledDevAuthorizationReview.json`
- `tmp/tya-readiness-consolidated-v5/readinessConsolidatedV5.json`
- `tmp/tya-dev-import-dry-run-package/tyaDevImportDryRunPackage.json`

## Salidas locales si se ejecuta

En `tmp/tya-future-enabled-runner-contract`:

- `futureEnabledRunnerContract.json`
- `futureEnabledRunnerContract.md`

## Flags obligatorios para cualquier runner futuro separado

- `CXORBIA_TYA_ENABLE_DEV_WRITE_RUNNER`
- `CXORBIA_TYA_TARGET_ENV`
- `CXORBIA_TYA_TENANT_ID`
- `CXORBIA_TYA_PROJECT_ID`
- `CXORBIA_TYA_BATCH_ID`

## Abort conditions

- Sin autorizacion explicita de Paula.
- Ambiente distinto de DEV.
- tenantId incorrecto.
- projectId incorrecto.
- batchId ausente o repetido.
- Conteos distintos al dry-run.
- Ruta fuera de tenant/project.
- Intento de crear Auth users.
- Intento de escribir pagos finales.
- Intento de disparar notificaciones.
- Intento de escribir evidencias Storage.
- Cualquier indicador de produccion.

## Estado

- Contrato documental.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin cambios frontend.

# DEV staging route count manifest TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-dev-staging-route-count-manifest.mjs`

## Proposito

Preparar el manifest de rutas y conteos esperados por coleccion para cualquier runner futuro.

Este bloque no escribe, no importa, no despliega y no toca frontend.

## Entradas locales esperadas

- `tmp/tya-readiness-consolidated-v5/readinessConsolidatedV5.json`
- `tmp/tya-controlled-dev-write-plan/controlledDevWritePlan.json`
- `tmp/tya-future-enabled-runner-contract/futureEnabledRunnerContract.json`

## Salidas locales si se ejecuta

En `tmp/tya-dev-staging-route-count-manifest`:

- `devStagingRouteCountManifest.json`
- `devStagingRouteCountManifest.md`

## Scope esperado

- tenantId: `tya`
- projectId: `tya-migration-dev`
- batchId: `{batchId}`

## Rutas de preview previstas

- `tenants/tya/migrationBatches/{batchId}`
- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/visits`
- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/shoppers`
- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/communicationsHistory`
- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/operativeCandidates`

## Validaciones obligatorias futuras

- Todas las rutas deben incluir tenantId.
- Todas las rutas de proyecto deben incluir projectId.
- Todas las rutas de datos deben incluir batchId.
- Los conteos esperados deben coincidir con el dry-run.
- Todo debe quedar como preview o metadata.
- No se permiten registros finales operativos o financieros.
- No se permite Auth, Storage, Make ni produccion.

## Estado

- Manifest documental y local.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin cambios frontend.

# Controlled DEV write plan TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-controlled-dev-write-plan.mjs`

## Proposito

Preparar un plan DEV controlado sin ejecutar runtime.

Este bloque deja claro que el siguiente paso es revisar alcance, batch, rutas, reglas y rollback.

## Entradas locales esperadas

- `tmp/tya-controlled-dev-authorization-review/controlledDevAuthorizationReview.json`
- `tmp/tya-dev-import-dry-run-package/tyaDevImportDryRunPackage.json`
- `tmp/tya-readiness-consolidated-v5/readinessConsolidatedV5.json`

## Salidas locales si se ejecuta

En `tmp/tya-controlled-dev-write-plan`:

- `controlledDevWritePlan.json`
- `controlledDevWritePlan.md`

## Alcance objetivo propuesto

- environment: DEV only, pendiente de confirmacion.
- tenantId: `tya`.
- projectId: `tya-migration-dev`.
- batchId con patron `tya-dev-import-YYYYMMDD-HHMMSS`.

## Colecciones previstas solo para preview DEV

- `tenants/{tenantId}/migrationBatches/{batchId}`
- `tenants/{tenantId}/projects/{projectId}/migrationPreview/visits`
- `tenants/{tenantId}/projects/{projectId}/migrationPreview/shoppers`
- `tenants/{tenantId}/projects/{projectId}/migrationPreview/communicationsHistory`
- `tenants/{tenantId}/projects/{projectId}/migrationPreview/operativeCandidates`

## Fuera de alcance

- Produccion.
- Auth users.
- Notificaciones activas.
- Pagos finales.
- Storage/evidencias.

## Estado

- Plan documental y local.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin cambios frontend.

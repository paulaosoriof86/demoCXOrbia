# DEV staging prewrite validator TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-dev-staging-prewrite-validator.mjs`

## Proposito

Validar el contrato previo a cualquier escritura futura, sin ejecutar runtime.

Este validador comprueba que el manifest de rutas, target DEV y autorizacion sigan en modo seguro.

## Entradas locales esperadas

- `tmp/tya-dev-staging-route-count-manifest/devStagingRouteCountManifest.json`
- `tmp/tya-dev-staging-target-validator/devStagingTargetValidator.json`
- `tmp/tya-controlled-dev-authorization-review/controlledDevAuthorizationReview.json`

## Salidas locales si se ejecuta

En `tmp/tya-dev-staging-prewrite-validator`:

- `devStagingPrewriteValidator.json`
- `devStagingPrewriteValidator.md`

## Checks principales

- Manifest existe.
- Target validator existe.
- Authorization review existe.
- Todas las rutas incluyen tenantId.
- Todas las rutas de proyecto incluyen projectId.
- Todas las rutas de datos incluyen batchId.
- Ninguna coleccion permite registros finales.
- Conteos esperados no son negativos.
- Todo mantiene `executeAllowed=false`.

## Estado

- Validador documental y local.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin cambios frontend.

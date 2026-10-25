# CX.data backend adapter contract V78 TyA

Fecha: 2026-07-04

## Archivo creado

- `tools/migration/tya-cx-data-backend-adapter-contract.mjs`

## Proposito

Definir como la interfaz existente `CX.data` podra conectarse al backend DEV sin romper modulos del prototipo V78.

Este bloque no implementa el adapter en runtime. Solo fija el contrato para evitar cambios dispersos en frontend.

## Regla de oro aplicada

- No modificar `app/modules` desde backend.
- No modificar `app/core` desde backend salvo un unico punto de conexion futuro y autorizado.
- Preservar nombres, formas de retorno y expectativas actuales de `CX.data`.
- Mantener V78 como baseline visual vigente.

## Scope backend propuesto

- tenantId: `tya`
- projectId: `tya-migration-dev`
- previewRoot: `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}`

## Mapa inicial de interfaz

| Area CX.data | Ruta backend DEV | Estado |
|---|---|---|
| visits | `migrationPreview/{batchId}/visits` | preview only |
| shoppers | `migrationPreview/{batchId}/shoppers` | provisional preview |
| communicationsHistory | `migrationPreview/{batchId}/communicationsHistory` | history only inactive |
| operativeCandidates | `migrationPreview/{batchId}/operativeCandidates` | candidate only |
| migrationBatches | `tenants/tya/migrationBatches/{batchId}` | metadata only |

## Usos bloqueados

- Produccion.
- Auth users.
- Storage/evidencias.
- Make notifications.
- Registros financieros finales.
- Registros operativos finales.

## Estado

- Contrato documental y local.
- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.

# DEV preview schema manifest TyA

Fecha: 2026-07-04

## Proposito

Definir las formas esperadas de documentos para preview DEV, alineadas con V78 y con el contrato `CX.data`.

Este manifiesto no ejecuta runtime, no cambia frontend y no escribe base de datos.

## Baseline

- Prototipo vigente: V78.
- Source lock: activo.
- Carril frontend: Claude.
- Carril backend: ChatGPT/Codex.

## Esquemas preview

### batchMetadata

Ruta:

- `tenants/tya/migrationBatches/{batchId}`

Campos requeridos:

- batchId
- tenantId
- projectId
- source
- status
- createdAt
- counts
- policies

Politica:

- metadata only.

### visits

Ruta:

- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/visits`

Campos requeridos:

- id
- tenantId
- projectId
- sourceBatchId
- country
- status
- sourceRefs

Politica:

- sanitized preview only.

### shoppers

Ruta:

- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/shoppers`

Campos requeridos:

- id
- tenantId
- projectId
- sourceBatchId
- displayNamePolicy
- identityPolicy

Politica:

- provisional identity preview only.

### communicationsHistory

Ruta:

- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/communicationsHistory`

Campos requeridos:

- id
- tenantId
- projectId
- sourceBatchId
- historyOnly
- channel
- status

Politica:

- history only inactive.

### operativeCandidates

Ruta:

- `tenants/tya/projects/tya-migration-dev/migrationPreview/{batchId}/operativeCandidates`

Campos requeridos:

- id
- tenantId
- projectId
- sourceBatchId
- candidateType
- reviewStatus

Politica:

- candidate only, no final records.

## Bloqueos generales

- No produccion.
- No usuarios Auth.
- No evidencias Storage.
- No notificaciones Make.
- No pagos finales.
- No estados operativos finales.

## Estado

- Manifiesto documental.
- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.

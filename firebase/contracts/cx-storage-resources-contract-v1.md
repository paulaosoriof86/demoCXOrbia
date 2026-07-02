# Contrato Storage / Resources v1

## Objetivo

Preparar el uso de Firebase Storage para logos, recursos, manuales, academia, documentos y evidencias sin tocar módulos UI.

## Estado

Preparado documentalmente. Storage sigue cerrado en `storage.rules` hasta autorización y validación DEV.

## Paths sugeridos

- `tenants/{tenantId}/brand/{fileId}`
- `tenants/{tenantId}/projects/{projectId}/resources/{fileId}`
- `tenants/{tenantId}/projects/{projectId}/manuals/{fileId}`
- `tenants/{tenantId}/projects/{projectId}/evidence/{visitId}/{fileId}`
- `tenants/{tenantId}/academy/{fileId}`

## Metadata Firestore

Colección sugerida:

- `tenants/{tenantId}/resources/{resourceId}`

Campos mínimos:

- `tenantId`
- `projectId`
- `visitId`
- `shopperId`
- `kind`
- `title`
- `fileName`
- `mimeType`
- `sizeBytes`
- `storagePath`
- `visibleRoles`
- `visibleCountries`
- `status`
- `createdAt`
- `createdByUid`

## Seguridad esperada

- Admin/ops/coordinador pueden cargar recursos del tenant/proyecto autorizado.
- Shopper solo carga evidencia propia asociada a una visita propia.
- Cliente solo lee recursos/evidencias del proyecto asignado.
- Otro tenant no lee ni escribe archivos de TyA.
- No se debe permitir ejecución de archivos ni tipos no autorizados.

## Nota

El bridge backend debe trabajar con metadata Firestore. La carga binaria real a Storage queda pendiente hasta reglas Storage y autorización separada.

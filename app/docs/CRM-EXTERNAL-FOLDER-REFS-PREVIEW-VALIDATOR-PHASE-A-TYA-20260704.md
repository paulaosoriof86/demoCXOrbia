# CRM external folder refs preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de CRM external folder refs. Este bloque valida entidades CRM y referencias a carpetas externas sin abrir proveedores, sin leer documentos, sin escribir proveedores, sin guardar links privados crudos y sin procesar contenidos de documentos.

## Archivos creados

- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `tools/migration/tya-crm-external-folder-refs-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Storage, lectura/escritura proveedor externo, OAuth, Make e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de links crudos, links firmados, tokens, secretos, contenido documental y adjuntos raw.
4. Entidades CRM con `tenantId`, `projectId`, `crmEntityId`, `crmEntityType`, owner, visibilidad y estado de revision.
5. Referencias externas con `externalFolderRefId`, `externalProviderType`, `externalFolderRef`, `visibilityScope` y `accessStatus`.
6. Que una referencia a carpeta no signifique proveedor conectado ni carpeta creada.
7. Que el vinculo entidad-carpeta use llaves estables, no coincidencia visual por nombre.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "crmEntities": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "crmEntityId": "crm_visit_ref_001",
      "crmEntityType": "visit",
      "displayLabelRef": "visit_label_ref_001",
      "ownerRole": "ops",
      "visibilityScope": "project_admin_ops",
      "reviewStatus": "preview_ready"
    }
  ],
  "externalFolderRefs": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "externalFolderRefId": "folder_ref_001",
      "crmEntityId": "crm_visit_ref_001",
      "crmEntityType": "visit",
      "externalProviderType": "onedrive_business_ref",
      "externalFolderRef": "opaque_folder_ref_001",
      "visibilityScope": "project_admin_ops",
      "accessStatus": "ref_preview_only"
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-crm-external-folder-refs-preview-validator.mjs
node tools/migration/tya-crm-external-folder-refs-preview-validator.mjs --input path/to/crm-external-folder-refs-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `crm_entity_preview_ready`
- `folder_ref_preview_ready`
- `provider_configuration_required`
- `permission_review_required`
- `blocked_private_link`
- `blocked_sensitive_content`
- `manual_review_required`
- `conflict_review_required`

## Reglas clave

- Una referencia de carpeta no equivale a proveedor conectado.
- Una referencia de carpeta no equivale a carpeta creada.
- No guardar URL privada, URL firmada, link con token, contenido documental ni adjuntos raw.
- No abrir OneDrive/SharePoint/Google Drive/Dropbox desde este preview.
- No crear carpetas externas desde este preview.
- Usar referencias opacas: `externalFolderRef`, `externalLinkRef`, `documentCollectionRef`.
- Usar permisos por rol: admin/ops/finance/shopper/client/superadmin.
- Cliente solo debe ver resumen read-only si el proyecto lo permite; no documentos internos ni auditoria privada.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de entidades CRM y folder refs.
2. Integrar este validator en runner local seguro.
3. Crear preview validator de shopper communication history.
4. Relacionar CRM folder refs con email/manual logs, notification outbox, postulaciones, visitas, liquidaciones y Academia sin activar proveedores.
5. Preparar payload draft de proveedor externo sin activar OAuth/API.

## Pendientes prototipo / Claude derivados

1. CRM/documentos no debe decir carpeta creada, conectada o sincronizada si gate esta apagado.
2. Mostrar estados: ref preview, provider pending, permission review, blocked private link, manual review.
3. No exponer URL privada, link firmado, contenido de documentos ni adjuntos.
4. Vincular carpetas a entidad estable, no por nombre visual.
5. Separar vista interna admin/ops/finance de vista cliente read-only.

## Impacto Academia

Academia debe crear/profundizar curso de CRM/doc refs por rol, provider pending, privacidad documental, permission review, checklists antes de vincular carpeta o exponer referencia, y glosario de `crmEntityId`, `externalFolderRefId`, `externalProviderType`, `visibilityScope`, `accessStatus`, `blocked_private_link`, `permission_review_required`.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Storage writes, sin proveedor externo, sin OAuth, sin Make, sin Gemini, sin lectura documental y sin datos sensibles.

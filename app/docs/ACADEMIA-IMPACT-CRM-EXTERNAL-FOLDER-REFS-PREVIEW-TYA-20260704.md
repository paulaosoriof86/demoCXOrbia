# Academia impact - CRM external folder refs preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `tools/migration/tya-crm-external-folder-refs-preview-validator.mjs`
- `app/docs/CRM-EXTERNAL-FOLDER-REFS-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir el manejo de CRM/documentos/carpetas externas en aprendizaje operativo por rol, dejando claro que una referencia no equivale a conexion real, lectura de documentos ni carpeta creada.

## Rutas por rol

### Ops

Debe aprender:

- como vincular una referencia documental a una visita, postulacion o asignacion;
- como identificar provider pending;
- como reportar referencia ambigua;
- como evitar abrir o pegar links privados;
- como escalar permiso/revision.

### Admin

Debe aprender:

- como revisar CRM entities;
- como revisar folder refs;
- como manejar visibilidad por rol;
- como separar documentos internos de vista cliente;
- como aprobar o rechazar una referencia.

### Finanzas

Debe aprender:

- que documentos financieros tienen visibilidad restringida;
- que referencias de pago no deben exponer banco o cuentas;
- como se vinculan liquidaciones/pagos a folder refs sin datos crudos.

### Shopper

Debe aprender:

- que solo puede ver sus propias referencias permitidas;
- que documentos privados quedan protegidos;
- que un estado pendiente backend no es rechazo.

### Cliente

Debe aprender:

- que la vista cliente es read-only;
- que ve resumen permitido, no auditoria interna ni documentos privados;
- como interpretar provider pending y ref preview.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar proveedores documentales futuros;
- por que OAuth/API no se activa desde preview;
- como auditar roles, permisos y visibilidad;
- como preparar politica de integracion documental por tenant/proyecto.

## Manuales a crear o actualizar

1. Manual CRM folder references.
2. Manual external provider pending.
3. Manual document privacy.
4. Manual permission review.
5. Manual CRM entity linking.
6. Manual client read-only summaries.
7. Manual provider gates.

## Lecciones requeridas

### Leccion 1 - Referencia no es conexion

Debe explicar que `externalFolderRef` es una referencia opaca y no una carpeta conectada ni creada.

### Leccion 2 - No pegar links privados

Debe explicar por que no se guardan URLs privadas, links firmados o URLs con tokens.

### Leccion 3 - Visibilidad por rol

Debe explicar scopes como admin/ops, finance restricted, shopper own only, client read-only y superadmin only.

### Leccion 4 - CRM entity linking

Debe explicar que la carpeta se vincula por `crmEntityId`, no por coincidencia visual de nombre.

### Leccion 5 - Provider pending

Debe explicar que OneDrive/SharePoint/Google Drive son providers futuros y requieren gate.

## Checklists interactivos

### Antes de vincular carpeta

- Existe tenant/proyecto.
- Existe crmEntityId estable.
- Existe externalFolderRefId.
- No hay URL privada.
- No hay token/secreto.
- Visibilidad definida.
- AccessStatus honesto.

### Antes de exponer referencia a un rol

- Rol permitido.
- No contiene documento privado.
- No expone link crudo.
- No expone datos financieros sensibles.
- Si cliente, solo resumen read-only.

### Antes de marcar proveedor conectado

- Gate aprobado.
- OAuth/API configurado fuera del repo.
- Politica de acceso definida.
- Prueba controlada documentada.

## Glosario requerido

- crmEntityId
- crmEntityType
- externalFolderRefId
- externalProviderType
- externalFolderRef
- visibilityScope
- accessStatus
- ref_preview_only
- provider_pending_configuration
- permission_review_required
- blocked_private_link
- blocked_sensitive_content

## Estado seguro

Documento academico. No activa runtime, no lee documentos, no abre proveedor, no escribe Firestore/Storage, no llama Make y no cambia frontend.

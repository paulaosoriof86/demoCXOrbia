# Resumen para Claude addendum - CRM external folder refs preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para CRM external folder refs sin conexion real con proveedores documentales.

Archivos agregados:

- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `tools/migration/tya-crm-external-folder-refs-preview-validator.mjs`
- `app/docs/CRM-EXTERNAL-FOLDER-REFS-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CRM-EXTERNAL-FOLDER-REFS-PREVIEW-20260704.md`

No se activo runtime, proveedor externo, OAuth ni lectura documental.

## Reglas que debe reflejar el prototipo

1. Referencia de carpeta no equivale a carpeta creada.
2. Referencia de carpeta no equivale a proveedor conectado.
3. No mostrar carpeta sincronizada si gate esta apagado.
4. No exponer URL privada, link firmado, token, contenido documental ni adjunto.
5. Usar referencias opacas: `externalFolderRef`, `externalLinkRef`, `documentCollectionRef`.
6. Vincular carpeta a entidad estable: `crmEntityId`, no nombre visual.
7. Separar visibilidad admin/ops/finance/shopper/client.
8. Cliente debe ver resumen read-only, no auditoria interna ni documentos privados.

## Pendientes frontend concretos

### CRM / documentos

- Mostrar estado ref preview.
- Mostrar provider pending.
- Mostrar permission review.
- Mostrar blocked private link.
- No decir conectado, creado o sincronizado.

### Entidades

- Vincular a postulacion, visita, asignacion, liquidacion, payment batch, academy item o support case por llave estable.
- No usar coincidencia visual por nombre.

### Cliente

- Vista cliente solo read-only summary.
- No mostrar documentos internos ni privados.

## Academia que Claude debe actualizar

- Curso Ops: document traceability y folder refs.
- Curso Admin: CRM entities, folder refs, permission review.
- Curso Finanzas: referencias restringidas sin banco/cuenta cruda.
- Curso Cliente: lectura de resumen permitido.
- Curso Superadmin: provider gates y OAuth/API futuro.
- Manual CRM folder references.
- Manual document privacy.
- Checklist antes de vincular carpeta.
- Checklist antes de exponer referencia a un rol.
- Glosario: crmEntityId, externalFolderRefId, externalProviderType, visibilityScope, accessStatus, blocked_private_link.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- OAuth/API/proveedor externo real.
- Firestore/Storage/Make/Gemini reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales ni lectura documental real.

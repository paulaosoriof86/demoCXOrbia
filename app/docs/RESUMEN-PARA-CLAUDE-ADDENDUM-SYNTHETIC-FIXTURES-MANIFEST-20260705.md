# Resumen para Claude - Synthetic fixtures manifest Phase A

Fecha: 2026-07-05

## Que se agrego desde backend

Se agrego un pack de fixtures sinteticos minimos para ejecutar validators preview sin fuentes reales.

Rutas nuevas:

- `tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/assignment-sync-conflict.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/visit-lifecycle-reservation.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/postulation-dynamic-form.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/notification-outbox.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/email-user-mailbox.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/crm-external-folder-refs.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/shopper-communication-history.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/shopper-ranking-scoring.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/project-tenant-rule-versioning.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/rule-change-changelog-notification.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/release-readiness-snapshot.phase-a.preview.json`
- `tools/migration/synthetic-fixtures/phase-a/liquidation-cinepolis-source-safe.phase-a.preview.json`

## Que debe reflejar el prototipo

El prototipo no debe mostrar estos fixtures como datos reales. Deben entenderse como validacion preview del backend.

Cuando se agregue dashboard/readiness UI, los estados visibles correctos son:

- `preview_ready`
- `ready_for_review`
- `review_required`
- `blocked_missing_input`
- `blocked_real_gate_off`
- `blocked_prototype_pending`
- `blocked_sensitive_data`
- `manual_review_required`

Estados que NO se deben mostrar mientras gates esten apagados:

- production ready
- deployed
- imported
- Firestore connected/write successful
- HR synchronized
- WhatsApp sent
- email sent
- Make synced
- Gemini generated/published automatically
- payment moved/paid automatically

## Señales recientes que deben incorporarse semanticamente

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

## P0 que siguen vivos

Corregir textos visibles que prometen integracion real:

- `cuestionario enviado`
- `HR sincronizada`
- `WhatsApp enviado`
- `Correo enviado`
- `Sincronía automática`
- `sincroniza la HR externa`
- `mueve la liquidación`

Debe reemplazarse por lenguaje honesto segun corresponda:

- cuestionario completado / pendiente de revision
- HR sync pendiente / preview / requiere revision
- WhatsApp fallback manual / copia lista / pendiente confirmacion manual
- correo draft / proveedor pendiente / registro manual
- sincronizacion futura con gate apagado
- liquidacion candidata / pago pendiente / movimiento preview / revision manual

## Archivos que Claude no debe tocar

No modificar:

- `tools/migration/**`
- `app/contracts/**`
- documentos backend salvo que Paula indique explicitamente
- gates de produccion
- fuentes reales
- integraciones reales

Claude debe trabajar sobre la ultima baseline auditada de continuidad backend, no sobre una version anterior, y debe corregir UI/UX sin activar runtime ni proveedores.

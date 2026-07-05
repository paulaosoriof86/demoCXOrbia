# Notification outbox preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de notification outbox. Este bloque valida eventos de notificacion, plantillas, destinatarios seguros y fallback manual sin enviar email, WhatsApp, push, Make ni escribir HR/Firestore.

## Archivos creados

- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-notification-outbox-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `app/contracts/email-provider-agnostic-user-mailbox-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Storage, HR, Make, email, WhatsApp, push e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de cuerpos crudos, adjuntos raw, telefonos/correos crudos y datos privados.
4. Notificacion con `tenantId`, `projectId`, `notificationId`, `eventType`, `channel`, `templateId`, `templateVersion`, `recipientRole` y `recipientRef`.
5. Canal permitido: in-app preview, draft de email, fallback manual, provider pendiente o tarea manual.
6. Plantilla con variables seguras y referencias opacas.
7. Que ningun estado diga enviado real sin confirmacion manual externa.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "notifications": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "notificationId": "notif_ref_001",
      "eventType": "postulation_approved_pending_assignment_sync",
      "channel": "whatsapp_web_fallback",
      "templateId": "tpl_postulation_approved_v1",
      "templateVersion": "1.0.0",
      "recipientRole": "shopper",
      "recipientRef": "shopper_ref_001",
      "shopperId": "shopper_ref_001",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "templateVariables": {
        "projectName": "Cinepolis",
        "visitRef": "visit_ref_001",
        "statusLabel": "pendiente HR sync"
      },
      "outboxStatus": "queued_preview_only",
      "manualFallbackStatus": "copy_button_available"
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-notification-outbox-preview-validator.mjs
node tools/migration/tya-notification-outbox-preview-validator.mjs --input path/to/notification-outbox-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `outbox_preview_ready`
- `manual_action_required`
- `provider_configuration_required`
- `blocked_sensitive_payload`
- `blocked_missing_recipient`
- `template_review_required`
- `manual_confirmation_required`
- `conflict_review_required`

## Reglas clave

- Preview de notificacion no equivale a envio real.
- Draft de email no equivale a email enviado.
- Fallback manual no equivale a envio confirmado hasta que el usuario lo marque.
- Provider pendiente no equivale a proveedor conectado.
- No incluir banco, documentos, NDA, telefonos/correos crudos, cuerpos crudos ni adjuntos privados.
- Usar `recipientRef`, no datos crudos de contacto.
- Usar textos honestos: preview, borrador, pendiente backend, accion manual, requiere revision, proveedor no configurado.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de notificaciones.
2. Integrar este validator en runner local seguro.
3. Crear preview validator de email/user mailbox sin conexion real.
4. Relacionar outbox con postulaciones, assignment sync, agenda, cuestionario y liquidaciones sin activar proveedores.
5. Preparar Make/email payload draft sin activar.

## Pendientes prototipo / Claude derivados

1. Toasters no deben decir enviado/sincronizado si solo hay preview.
2. WhatsApp Web debe mostrarse como copiar/manual/confirmar, no envio automatico.
3. Email debe mostrarse como borrador/provider pendiente si no hay proveedor real.
4. In-app notifications deben separarse de envios externos.
5. Plantillas deben ser configurables por tenant/proyecto/evento/version.
6. No exponer datos privados en notificaciones shopper.

## Impacto Academia

Academia debe crear/profundizar curso de notificaciones por rol, manual de outbox, manual de fallback manual, checklist antes de usar dato privado en plantilla, checklist antes de confirmar envio externo y glosario de `notificationId`, `templateId`, `templateVersion`, `recipientRef`, `outboxStatus`, `manualFallbackStatus`.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Storage writes, sin HR writes, sin Make, sin Gemini, sin proveedor de email, sin WhatsApp real y sin datos sensibles.

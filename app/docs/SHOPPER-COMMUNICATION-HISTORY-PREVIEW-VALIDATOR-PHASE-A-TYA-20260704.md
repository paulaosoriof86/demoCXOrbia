# Shopper communication history preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de shopper communication history. Este bloque valida historiales de comunicacion shopper con referencias seguras a notificaciones, email/manual log, WhatsApp fallback, soporte y CRM sin leer comunicaciones reales, sin enviar mensajes, sin importar historiales crudos y sin guardar cuerpos, telefonos, correos ni adjuntos privados.

## Archivos creados

- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-communication-history-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Storage, Make, email, WhatsApp, proveedores externos e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de cuerpos crudos, telefonos crudos, correos crudos, adjuntos, tokens, secretos y URLs riesgosas.
4. Comunicacion con `tenantId`, `projectId`, `communicationId`, `threadId`, `participantRef`, `participantRole`, canal, direccion, tipo y estado.
5. Vinculo con entidad estable: shopper, visita, HR row, postulacion, asignacion, notification, mailAction o CRM entity.
6. Que WhatsApp fallback y email draft/manual log no se marquen como enviados reales.
7. Que pagos/liquidaciones no incluyan datos bancarios.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "communications": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "communicationId": "comm_ref_001",
      "threadId": "thread_ref_001",
      "participantRef": "shopper_ref_001",
      "participantRole": "shopper",
      "shopperId": "shopper_ref_001",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "notificationId": "notif_ref_001",
      "channel": "whatsapp_web_fallback_manual",
      "direction": "outbound_manual_log",
      "interactionType": "schedule_confirmation",
      "communicationStatus": "manual_confirmation_required",
      "manualConfirmationStatus": "pending_user_confirmation",
      "safeSummary": {
        "summaryRef": "safe_summary_ref_001",
        "statusLabel": "pendiente confirmacion manual"
      }
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-shopper-communication-history-preview-validator.mjs
node tools/migration/tya-shopper-communication-history-preview-validator.mjs --input path/to/shopper-communication-history-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `communication_history_preview_ready`
- `manual_log_ready`
- `draft_preview_ready`
- `manual_confirmation_required`
- `provider_configuration_required`
- `blocked_sensitive_payload`
- `blocked_missing_refs`
- `conflict_review_required`
- `manual_review_required`

## Reglas clave

- Historial de comunicacion guarda eventos, resumen seguro y referencias, no conversaciones crudas.
- No guardar cuerpos de WhatsApp/email, telefonos, correos, adjuntos ni audios.
- `participantRef` reemplaza datos crudos de contacto.
- WhatsApp Web fallback requiere confirmacion manual si se envio por fuera.
- Email draft preview no es enviado.
- Email manual log no es prueba de proveedor.
- Comunicacion de pago/liquidacion no debe incluir banco ni cuenta.
- Legacy communications solo entran como resumen sanitizado y source-safe.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de communications.
2. Integrar este validator en runner local seguro.
3. Ejecutar validators de liquidaciones/corte junio cuando exista fuente segura.
4. Conectar communication history con notification outbox/email/CRM solo a nivel preview.
5. Preparar Make/email/WhatsApp payloads futuros sin activar.

## Pendientes prototipo / Claude derivados

1. Shopper history no debe mostrar cuerpos crudos de WhatsApp/email.
2. No debe mostrar telefonos/correos crudos ni adjuntos privados.
3. Mostrar estados: preview, draft, manual log, pendiente backend, confirmacion manual, provider pending y bloqueado sensible.
4. Separar notificacion in-app de comunicacion externa.
5. Vincular historial por llaves estables, no por coincidencia visual.
6. No decir enviado/sincronizado/entregado sin confirmacion manual o provider gate futuro.

## Impacto Academia

Academia debe crear/profundizar curso de historial de comunicaciones shopper por rol, trazabilidad manual, WhatsApp fallback, email draft/manual log, privacidad en comunicaciones, support case notes y glosario de `communicationId`, `threadId`, `participantRef`, `manualConfirmationStatus`, `communicationStatus`, `manual_log_ready`, `draft_preview_ready`.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Storage writes, sin lectura de correo/WhatsApp, sin envio real, sin Make, sin Gemini, sin proveedor externo y sin datos sensibles.

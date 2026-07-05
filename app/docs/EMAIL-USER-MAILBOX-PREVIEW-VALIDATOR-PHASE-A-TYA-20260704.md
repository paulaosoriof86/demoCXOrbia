# Email user mailbox preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de email/user mailbox sin conexion real. Este bloque valida configuracion de buzones por usuario, drafts, trazabilidad manual y acciones de correo sin leer correo real, sin enviar correo real, sin OAuth/SMTP y sin guardar secretos.

## Archivos creados

- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-email-user-mailbox-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/email-provider-agnostic-user-mailbox-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, lectura email, envio email, drafts reales, OAuth, SMTP, Make e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de cuerpos crudos, adjuntos raw, emails crudos, tokens, secretos y credenciales.
4. Buzon por usuario con `tenantId`, `userId`, `mailboxId`, `emailAddressRef`, ownership, provider, connectionStatus y permisos.
5. Acciones de correo con `mailActionId`, tipo, recipientRef, entityRef, templateId y version.
6. Placeholder/manual-only no puede leer ni enviar correo real.
7. Draft preview y manual log no equivalen a correo enviado.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "mailboxes": [
    {
      "tenantId": "tya",
      "userId": "user_ref_001",
      "mailboxId": "mailbox_ref_001",
      "emailAddressRef": "role_alias_ref_ops_001",
      "mailboxOwnershipType": "role_alias_email",
      "providerType": "manual_log_only",
      "connectionStatus": "manual_only",
      "canRead": false,
      "canSend": false,
      "canDraft": false,
      "canLogManual": true,
      "privacyScope": "tenant_project_ops"
    }
  ],
  "mailActions": [
    {
      "tenantId": "tya",
      "userId": "user_ref_001",
      "mailboxId": "mailbox_ref_001",
      "mailActionId": "mail_action_ref_001",
      "mailActionType": "manual_log_only",
      "recipientRef": "shopper_ref_001",
      "entityType": "postulation",
      "entityRef": "postulation_ref_001",
      "templateId": "tpl_postulation_followup_v1",
      "templateVersion": "1.0.0",
      "templateVariables": {
        "statusLabel": "pendiente backend",
        "visitRef": "visit_ref_001"
      }
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-email-user-mailbox-preview-validator.mjs
node tools/migration/tya-email-user-mailbox-preview-validator.mjs --input path/to/email-user-mailbox-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `mailbox_config_preview_ready`
- `mailbox_provider_configuration_required`
- `mailbox_manual_only_ready`
- `mailbox_placeholder_blocked`
- `mail_action_draft_preview_ready`
- `mail_action_manual_log_ready`
- `mail_action_blocked_sensitive_payload`
- `mail_action_blocked_missing_recipient`
- `mail_action_blocked_no_permission`
- `manual_confirmation_required`
- `review_required`

## Reglas clave

- El buzon se configura por usuario, no solo global por tenant.
- `emailAddressRef` debe ser alias o referencia opaca en preview.
- Placeholder no envia ni recibe.
- Manual-only registra trazabilidad, no prueba proveedor.
- Draft preview no es correo enviado.
- No guardar OAuth, SMTP, tokens ni secretos.
- No guardar cuerpo crudo ni adjuntos crudos.
- Las acciones de correo deben vincularse a entidad segura: postulacion, visita, asignacion, liquidacion o Academia.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de buzones y acciones de correo.
2. Integrar este validator en runner local seguro.
3. Crear preview validator de CRM external folder refs.
4. Relacionar notification outbox con draft/manual log sin activar proveedor.
5. Preparar payload draft de proveedor sin activar OAuth/SMTP.

## Pendientes prototipo / Claude derivados

1. Email UI no debe decir conectado, leido o enviado si gate esta apagado.
2. Mostrar estados: no configurado, manual only, placeholder no send, connection requested, provider pending.
3. Separar draft, log manual y enviado real.
4. No exponer correo personal crudo, cuerpo de mensaje ni adjuntos privados.
5. Acciones de email deben vincularse a entidad sin prometer sync real.

## Impacto Academia

Academia debe crear/profundizar curso de configuracion de buzones, provider agnostic email, manual-only traceability, drafts, privacidad de correo, provider gates y glosario de mailboxId, providerType, connectionStatus, canDraft, canLogManual, draft_ready_preview y manual_log_only.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin lectura de correo, sin envio de correo, sin OAuth, sin SMTP, sin Make, sin Gemini y sin datos sensibles.

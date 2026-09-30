# Rule change changelog/notification preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de changelog/notificaciones de cambios de reglas. Este bloque prepara contrato y validador preview para crear entradas de changelog y borradores de notificacion cuando cambian reglas por tenant/proyecto, sin publicar changelog real, sin enviar mensajes, sin Make/Gemini, sin escribir Firestore y sin procesar datos sensibles.

## Archivos creados

- `app/contracts/rule-change-changelog-notification-preview-phase-a.tya.contract.json`
- `tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Make, email, WhatsApp, Gemini e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de cuerpos crudos, recipients crudos, emails, telefonos, secretos, tokens, links privados o payloads sensibles.
4. Cambio vinculado a `tenantId`, `projectId`, `changeEventId`, `changeLogId`, `ruleSetId`, `ruleSetVersion` y `ruleSetType`.
5. Audiencias por rol/segmento, no destinatarios crudos.
6. Cambios de alto impacto con review y approval refs.
7. Cambios de migracion/rollback con contexto requerido.
8. Cambios que impactan Academia con `academyUpdateRef` o estado pendiente.
9. Que no se marque enviado, entregado, publicado o sincronizado mientras gates estan apagados.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "changeEvents": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "changeEventId": "change_event_ref_001",
      "changeLogId": "changelog_ref_001",
      "ruleSetId": "ruleset_ref_001",
      "ruleSetVersion": "1.0.1-preview",
      "ruleSetType": "visit_lifecycle_rules",
      "changeType": "rule_updated_preview",
      "impactScope": "ops_required_read",
      "audienceRole": "ops",
      "changelogStatus": "draft_preview",
      "notificationPreviewStatus": "notification_draft_preview",
      "notificationTemplateId": "template_ref_001",
      "createdByRef": "admin_ref_001"
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs
node tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs --input path/to/rule-change-changelog-notification-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `changelog_preview_ready`
- `notification_draft_preview_ready`
- `academy_update_required`
- `human_review_required`
- `blocked_sensitive_payload`
- `blocked_real_send`
- `migration_context_required`
- `rollback_context_required`
- `conflict_review_required`

## Reglas clave

- Una regla cambiada puede crear changelog preview, no publicacion real.
- No enviar email/WhatsApp/Make desde preview.
- Audiencia por rol/segmento, no destinatarios crudos.
- Cambios de alto impacto requieren revision y aprobacion.
- Cambios breaking deben enlazar migracion/rollback.
- Si afecta Academia, debe crear update requerido.
- Notification drafts son preview y dependen de outbox/mailbox futuros.
- No decir enviado, entregado, sincronizado, informado o publicado con gates apagados.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de changeEvents.
2. Integrar este validator en runner local seguro.
3. Relacionar rule versioning con notification outbox sin activar envio.
4. Preparar payload futuro para UI de changelog/centro de actualizaciones.
5. Relacionar cambios de reglas con Academia y notificaciones por rol.

## Pendientes prototipo / Claude derivados

1. Changelog/centro de actualizaciones debe mostrar draft/review/approved preview, no publicado real.
2. No decir email/WhatsApp enviado para cambios de reglas si gates estan apagados.
3. Mostrar audiencia por rol/segmento, no destinatarios crudos.
4. Mostrar Academia update required cuando una regla cambia un flujo.
5. Mostrar human review/approval para cambios de alto impacto.
6. Mostrar migration/rollback context required cuando aplica.

## Impacto Academia

Academia debe explicar como un cambio de regla genera changelog, quienes deben enterarse por rol, por que un borrador no es envio, cuando debe actualizarse un curso/manual/checklist y como aprobar o bloquear cambios de alto impacto.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Make, sin Gemini, sin email/WhatsApp real, sin publicacion real, sin destinatarios crudos y sin datos sensibles.

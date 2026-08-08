# Resumen para Claude addendum - Rule change changelog/notification preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para changelog/centro de actualizaciones y borradores de notificacion derivados de cambios de reglas por tenant/proyecto.

Archivos agregados:

- `app/contracts/rule-change-changelog-notification-preview-phase-a.tya.contract.json`
- `tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs`
- `app/docs/RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-20260704.md`

No se activo runtime, publicacion real, Firestore, Make, Gemini, email ni WhatsApp.

## Reglas que debe reflejar el prototipo

1. Changelog/centro de actualizaciones debe distinguir draft, review, approved preview y publicado real futuro.
2. Borrador de notificacion no equivale a envio.
3. No decir email/WhatsApp/Make enviado si gates estan apagados.
4. Audiencia debe ser por rol/segmento, no destinatario crudo.
5. Cambios de alto impacto requieren review/aprobacion.
6. Cambios que afectan flujos deben marcar Academia update required.
7. Cambios de migracion/rollback deben mostrar contexto requerido.
8. No mostrar roles como informados sin confirmacion futura.

## Pendientes frontend concretos

### Changelog / centro de actualizaciones

- Mostrar `changeLogId`, `changeEventId`, regla relacionada, version y tipo de cambio.
- Mostrar impacto por rol.
- Mostrar estado de revision.
- Mostrar notification draft si aplica.
- Mostrar Academia update required si aplica.
- No publicar ni marcar como enviado con gates apagados.

### Notificaciones de cambios

- Separar in-app preview, email draft, WhatsApp fallback y Make pending.
- No mostrar recipients crudos.
- Usar segmentos/roles.
- Mostrar bloqueo por dato sensible si aplica.

## Academia que Claude debe actualizar

- Curso Admin: changelog de reglas y revision de alto impacto.
- Curso Ops: cambios operativos requeridos.
- Curso Finanzas: cambios de pago/pais/moneda.
- Curso Shopper: cambios de flujo futuro.
- Curso Cliente: resumen visible de cambios permitidos.
- Curso Superadmin: release governance.
- Manual changelog and product updates.
- Manual rule change notifications.
- Manual Academia update workflow.
- Checklist antes de publicar changelog.
- Checklist antes de preparar notificacion.
- Glosario: changeLogId, changeEventId, impactScope, audienceRole, notificationDraftId, academyUpdateRef.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Make/Gemini reales.
- Email/WhatsApp reales.
- Publicacion real.
- Destinatarios crudos.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, publicaciones reales, envios reales ni escrituras reales.

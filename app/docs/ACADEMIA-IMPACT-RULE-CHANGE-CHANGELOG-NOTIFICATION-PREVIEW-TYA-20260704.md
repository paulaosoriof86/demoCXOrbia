# Academia impact - Rule change changelog/notification preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/rule-change-changelog-notification-preview-phase-a.tya.contract.json`
- `tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs`
- `app/docs/RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir los cambios de reglas en aprendizaje y comunicacion operativa por rol, para que un cambio de configuracion no quede solo como dato tecnico: debe generar changelog, notificacion draft, actualizacion de manual/curso/checklist y revision humana cuando aplique.

## Rutas por rol

### Admin

Debe aprender:

- como leer un changelog de reglas;
- como validar audiencia por rol;
- como aprobar o bloquear un cambio de alto impacto;
- como identificar si Academia necesita actualizacion;
- como evitar publicar o enviar antes de gate.

### Ops

Debe aprender:

- como saber que cambio operativo debe leer;
- como identificar cambios en visitas, agenda, HR mapping o cuestionario;
- como confirmar lectura cuando exista gate futuro;
- como reportar dudas o conflictos.

### Finanzas

Debe aprender:

- como recibir cambios de pago, pais, moneda, honorario o reembolso;
- por que esos cambios requieren revision;
- como evitar aplicar reglas nuevas a pagos historicos.

### Shopper

Debe aprender:

- como recibir cambios visibles en flujos futuros;
- que una notificacion preparada no equivale a mensaje enviado;
- como consultar actualizaciones que afectan agenda, cuestionario o beneficios.

### Cliente

Debe aprender:

- que puede ver resumen de cambios permitidos;
- que no recibe trazabilidad interna;
- como interpretar cambios visibles de reportes o entregables.

### Superadmin / consultora / aliado

Debe aprender:

- como gobernar changelog y comunicaciones por tenant;
- como revisar alto impacto;
- como conectar cambios de reglas con Academia, notificaciones y soporte;
- como auditar que no se enviaron mensajes reales sin gate.

## Manuales a crear o actualizar

1. Manual changelog and product updates.
2. Manual rule change notifications.
3. Manual Academia update workflow.
4. Manual role-based change communication.
5. Manual human review before publish.
6. Manual notification draft vs sent.

## Lecciones requeridas

### Leccion 1 - Cambio de regla a changelog

Debe explicar que todo cambio relevante debe tener entrada de changelog con estado, impacto y audiencia.

### Leccion 2 - Borrador no es envio

Debe explicar que notification draft, email draft o WhatsApp fallback no son enviados reales.

### Leccion 3 - Roles afectados

Debe explicar como identificar admin, ops, finance, shopper, client, support o superadmin como audiencia.

### Leccion 4 - Academia update required

Debe explicar que si cambia un flujo, debe revisarse curso, manual, checklist, glosario y novedades.

### Leccion 5 - Alto impacto

Debe explicar que cambios de pago, HR mapping, cuestionario, datos sensibles o breaking changes requieren revision y aprobacion.

## Checklists interactivos

### Antes de publicar changelog

- Cambio source-safe.
- Regla versionada.
- Audiencia definida.
- Impacto documentado.
- Sin datos sensibles.
- Review/aprobacion si es alto impacto.

### Antes de preparar notificacion

- Template definido.
- Rol/segmento definido.
- No hay recipients crudos.
- No hay envio real.
- Provider/gate en estado correcto.

### Antes de cerrar Academia update required

- Manual revisado.
- Curso revisado.
- Checklist revisado.
- Glosario revisado.
- Novedad/actualizacion documentada.

## Glosario requerido

- changeLogId
- changeEventId
- ruleSetId
- ruleSetVersion
- impactScope
- audienceRole
- notificationDraftId
- academyUpdateRef
- notification_draft_preview
- academy_update_required
- blocked_real_send

## Estado seguro

Documento academico. No activa runtime, no publica changelog, no envia comunicaciones, no escribe Firestore/Storage, no llama Make/Gemini y no cambia frontend.

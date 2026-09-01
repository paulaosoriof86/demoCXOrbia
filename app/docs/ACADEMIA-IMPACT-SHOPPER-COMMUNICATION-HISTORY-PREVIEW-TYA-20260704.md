# Academia impact - Shopper communication history preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-communication-history-preview-validator.mjs`
- `app/docs/SHOPPER-COMMUNICATION-HISTORY-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir el historial de comunicaciones shopper en aprendizaje operativo por rol, explicando privacidad, trazabilidad manual, estados honestos, confirmacion manual y relacion con visitas, postulaciones, pagos, notificaciones, email y CRM.

## Rutas por rol

### Shopper

Debe aprender:

- que comunicaciones puede ver;
- por que no ve datos privados de otros;
- que significa pendiente backend;
- que significa confirmacion manual;
- que diferencia existe entre notificacion in-app y mensaje externo.

### Ops

Debe aprender:

- como registrar un contacto manual;
- como vincular comunicacion a visita, postulacion o asignacion;
- como confirmar si un mensaje fue enviado por fuera;
- como evitar guardar cuerpos crudos o telefonos;
- como escalar comunicaciones sensibles.

### Admin

Debe aprender:

- como auditar trazabilidad;
- como revisar estados de comunicacion;
- como separar draft, log manual y proveedor pendiente;
- como aplicar politicas de privacidad.

### Finanzas

Debe aprender:

- como comunicar estado de liquidacion/pago sin exponer banco o cuenta;
- como vincular comunicacion a payment item o liquidacion;
- como evitar datos sensibles en mensajes.

### Cliente

Debe aprender:

- que solo ve resumen permitido;
- que no accede a comunicaciones privadas de shoppers;
- como interpretar estados generales sin trazabilidad interna.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar politicas de comunicacion por tenant/proyecto;
- como se prepara proveedor futuro;
- como auditar historiales sin guardar datos crudos;
- como definir retencion y privacidad.

## Manuales a crear o actualizar

1. Manual shopper communication history.
2. Manual manual communication logs.
3. Manual WhatsApp fallback traceability.
4. Manual email draft/manual log.
5. Manual sensitive data in communications.
6. Manual support case notes.
7. Manual payment communication privacy.

## Lecciones requeridas

### Leccion 1 - Que guarda el historial

Debe explicar que se guardan eventos, estados, resumen seguro y referencias, no conversaciones crudas.

### Leccion 2 - Estados honestos

Debe explicar preview, draft, manual log, pendiente backend, provider pending, confirmacion manual y bloqueado por dato sensible.

### Leccion 3 - Confirmacion manual

Debe explicar que copiar o preparar un mensaje no equivale a enviarlo y que la confirmacion externa requiere accion humana.

### Leccion 4 - Vinculo con operaciones

Debe explicar como se vincula una comunicacion a postulacion, visita, asignacion, revision, liquidacion, pago, notification outbox, email/mailbox y CRM.

### Leccion 5 - Privacidad

Debe explicar por que no se guardan telefonos, correos, cuerpos crudos, audios, adjuntos o datos bancarios.

## Checklists interactivos

### Antes de registrar comunicacion shopper

- Tenant/proyecto correcto.
- ParticipantRef correcto.
- ShopperId correcto si aplica.
- Entidad relacionada estable.
- Canal correcto.
- Estado honesto.
- No hay dato sensible.

### Antes de confirmar envio externo

- Usuario envio realmente fuera de la plataforma.
- Canal coincide.
- No se confunde con proveedor automatico.
- Queda como confirmacion manual.

### Antes de comunicar pagos

- No incluye banco ni cuenta.
- Usa estado permitido.
- Se vincula a liquidacion/paymentItem si existe.
- Si hay duda, revision manual.

## Glosario requerido

- communicationId
- threadId
- participantRef
- participantRole
- communicationStatus
- manualConfirmationStatus
- manual_log_ready
- draft_preview_ready
- pending_backend
- blocked_sensitive_payload
- legacy_sanitized

## Estado seguro

Documento academico. No activa runtime, no lee comunicaciones reales, no envia mensajes, no escribe Firestore/Storage, no llama Make y no cambia frontend.

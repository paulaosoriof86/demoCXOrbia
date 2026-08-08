# Academia impact - Notification outbox preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-notification-outbox-preview-validator.mjs`
- `app/docs/NOTIFICATION-OUTBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir notification outbox en aprendizaje operativo por rol. La plataforma debe explicar que un aviso preparado no es un envio real, que un draft no es enviado y que un fallback manual requiere confirmacion humana.

## Rutas por rol

### Shopper

Debe aprender:

- que notificaciones puede recibir;
- que significa pendiente backend;
- que significa accion manual;
- que estados no son confirmacion final;
- como revisar alertas dentro de la plataforma.

### Ops

Debe aprender:

- como revisar eventos pendientes;
- como copiar un mensaje para fallback manual;
- como confirmar si se envio externamente;
- como detectar una plantilla con datos privados;
- como escalar a revision.

### Admin

Debe aprender:

- como revisar plantilla por proyecto;
- como evitar textos que prometen integracion real;
- como aprobar notificaciones seguras;
- como separar in-app, draft, provider pendiente y confirmacion manual.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar plantillas por tenant/proyecto/evento;
- como habilitar proveedor solo cuando el gate este aprobado;
- como auditar trazabilidad sin guardar cuerpos crudos;
- como evitar datos privados en plantillas.

## Manuales a crear o actualizar

1. Manual notification outbox.
2. Manual fallback manual.
3. Manual email draft/provider pendiente.
4. Manual plantillas seguras.
5. Manual estados honestos de notificacion.
6. Manual datos sensibles en mensajes.

## Lecciones requeridas

### Leccion 1 - Que es notification outbox

Debe explicar que outbox prepara eventos y mensajes, pero no implica proveedor real ni envio real si los gates estan apagados.

### Leccion 2 - Estados honestos

Debe explicar:

- preview;
- borrador;
- accion manual requerida;
- provider pendiente;
- bloqueado por dato sensible;
- destinatario faltante;
- confirmado manualmente.

### Leccion 3 - Fallback manual

Debe explicar:

1. sistema prepara copia segura;
2. usuario copia mensaje;
3. usuario envia fuera de la plataforma;
4. usuario confirma manualmente;
5. sistema registra confirmacion cuando runtime este autorizado.

### Leccion 4 - Plantillas seguras

Debe explicar que una plantilla debe usar referencias operativas, no datos privados crudos.

### Leccion 5 - Eventos operativos

Debe explicar eventos de postulacion, asignacion, agenda, cuestionario, revision, liquidacion, pago y Academia.

## Checklists interactivos

### Antes de publicar plantilla

- Tiene templateId.
- Tiene templateVersion.
- Tiene evento.
- Tiene rol destinatario.
- No contiene datos privados.
- Usa textos honestos.
- Indica si es preview, draft o accion manual.

### Antes de enviar manualmente

- Mensaje revisado.
- Destinatario correcto.
- No contiene banco/documentos/NDA/datos privados.
- El canal es manual.
- El usuario entiende que debe confirmar externamente.

### Antes de confirmar envio externo

- El usuario realmente envio fuera de la plataforma.
- El canal coincide.
- No se confunde con envio automatico.
- Se registra solo confirmacion manual.

## Glosario requerido

- notificationId
- templateId
- templateVersion
- recipientRef
- outboxStatus
- manualFallbackStatus
- queued_preview_only
- manual_action_required
- provider_pending_configuration
- blocked_sensitive_payload
- sent_external_confirmed_manual

## Notificaciones de Academia

Cuando este flujo pase a UI, Academia debe notificar:

- nuevo manual de notificaciones;
- plantilla actualizada;
- checklist nuevo de fallback manual;
- curso pendiente por rol;
- contenido pendiente de revision humana si IA ayuda a crear plantillas.

## Estado seguro

Documento academico. No activa runtime, no envia mensajes reales, no escribe Firestore/HR, no llama Make y no cambia frontend.

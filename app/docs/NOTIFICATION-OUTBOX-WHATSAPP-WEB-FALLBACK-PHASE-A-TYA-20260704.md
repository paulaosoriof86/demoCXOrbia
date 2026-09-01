# Notification outbox and WhatsApp Web fallback Phase A TyA

Fecha: 2026-07-04

## Objetivo

Continuar backend Phase A con el modulo transversal de notificaciones, outbox, plantillas, WhatsApp Web actual, Make/mensajeria futura y estados honestos de entrega.

Este bloque no envia mensajes reales, no llama Make, no usa WhatsApp API, no envia email y no escribe Firestore.

## Modulos involucrados

- `app/core/automations.js`
- `app/modules/novedades.js`
- `app/modules/postulaciones.js`
- `app/modules/misvisitas.js`
- `app/modules/dashboard.js`
- `app/modules/soporte.js`
- `app/modules/academia.js`
- `app/core/data.js`

## Contrato creado

- `app/contracts/notification-outbox-phase-a.tya.contract.json`

## Validador creado

- `tools/migration/tya-notification-outbox-contract-validator.mjs`

## Decision

Las notificaciones deben funcionar como outbox auditable, no como textos sueltos o promesas de envio real.

La plataforma debe distinguir:

- notificacion in-app;
- texto preparado para WhatsApp Web;
- envio manual confirmado;
- Make/mensajeria futura pendiente;
- envio bloqueado por gate;
- contacto faltante o invalido;
- fallo futuro de proveedor;
- cancelacion.

## Canales definidos

- `in_app`
- `whatsapp_web`
- `make_messaging_future`
- `email_future`
- `sms_future`

## Estados de entrega

- `draft`
- `queued_preview_only`
- `prepared_whatsapp_web`
- `manual_send_required`
- `sent_manual_confirmed`
- `sent_api_confirmed_future`
- `failed_future`
- `cancelled`
- `blocked_by_gate`
- `requires_recipient_contact_review`

## Eventos Phase A cubiertos

- postulacion recibida;
- postulacion aprobada;
- no seleccionado suave;
- ajuste de fecha solicitado;
- confirmacion de fecha solicitada;
- asignacion creada;
- agenda/reprogramacion/cancelacion;
- visita realizada;
- cuestionario realizado;
- revision requiere correccion;
- submitido pendiente HR;
- liquidacion candidata;
- pago programado;
- curso Academia asignado;
- manual Academia actualizado;
- solicitud de capacitacion.

## Reglas de plantillas

Las plantillas deben ser editables por tenant y proyecto cuando aplique.

Deben cumplir:

- tono por rol;
- mensaje suave para no seleccionado;
- no afirmar envio por WhatsApp API/Make si solo se preparo WhatsApp Web;
- admin interno puede ver auditoria;
- shopper/cliente no debe ver datos internos sensibles;
- no exponer nombres crudos de columnas HR.

## Fallback WhatsApp Web

Mientras Make/API no este autorizado:

1. La plataforma puede preparar texto para WhatsApp Web.
2. El estado debe ser `manual_send_required` o `prepared_whatsapp_web`.
3. Un usuario autorizado debe confirmar envio manual si lo realizo.
4. No debe marcarse como `sent_api_confirmed_future`.
5. Si falta telefono/contacto, debe quedar `requires_recipient_contact_review`.

## Relacion con postulaciones y visitas

Este outbox se conecta documentalmente con:

- aprobacion de postulacion;
- solicitud de ajuste de fecha;
- solicitud de confirmacion;
- solicitud de reprogramacion;
- no seleccionado suave;
- asignacion creada;
- visita realizada;
- cuestionario realizado;
- revision y submitido.

## Relacion con Academia

Academia tambien debe generar notificaciones para:

- curso nuevo asignado;
- manual actualizado por cambio de modulo;
- leccion actualizada;
- solicitud de capacitacion recibida;
- capacitacion programada;
- contenido pendiente de revision humana.

## Gaps detectados

- V82 todavia tiene textos que pueden sonar a sync/envio real.
- Falta estado unificado de notificacion.
- Falta distinguir mensaje preparado vs enviado.
- Falta registrar canal previsto, actor y resultado.
- Falta contenido Academia para notificaciones.

## Pendientes backend

- Crear preview validator de outbox usando datos mock/staging.
- Mapear templates por evento/rol.
- Integrar outbox con postulaciones, asignaciones, visitas, review, liquidaciones y Academia.
- Preparar payload Make futuro sin activarlo.

## Pendientes prototipo

- Mostrar estado de notificacion: preparado, requiere envio manual, enviado manual confirmado, bloqueado, contacto faltante.
- No mostrar Make/WhatsApp API como ejecutado si gate apagado.
- Permitir copiar/abrir WhatsApp Web cuando aplique.
- Permitir confirmar envio manual.
- Permitir editar plantillas por tenant/proyecto.

## Impacto Academia

Academia debe actualizar:

### Operativo / coordinador

- Como usar WhatsApp Web fallback.
- Como confirmar envio manual.
- Como interpretar estados de notificacion.
- Como enviar ajuste de fecha, confirmacion o reprogramacion.

### Admin

- Como auditar notificaciones.
- Como revisar plantillas.
- Como diferenciar envio manual vs API futura.

### Shopper

- Que notificaciones recibira.
- Que debe hacer si recibe ajuste/confirmacion/reprogramacion.

### Cliente

- Que notificaciones puede recibir si portal cliente esta habilitado.

### Academia

- Como se notifican cursos, manuales y cambios.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin WhatsApp API real.
- Sin Make real.
- Sin email real.
- Sin deploy.
- Sin produccion.

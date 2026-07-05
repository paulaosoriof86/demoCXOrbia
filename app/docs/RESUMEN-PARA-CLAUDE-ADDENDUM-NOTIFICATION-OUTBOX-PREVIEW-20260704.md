# Resumen para Claude addendum - Notification outbox preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo un contrato y validator preview para notification outbox: eventos de notificacion, plantillas, destinatarios seguros, canales preview y fallback manual.

Archivos agregados:

- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-notification-outbox-preview-validator.mjs`
- `app/docs/NOTIFICATION-OUTBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-NOTIFICATION-OUTBOX-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-NOTIFICATION-OUTBOX-PREVIEW-20260704.md`

No se activo runtime ni envios reales.

## Reglas que debe reflejar el prototipo

1. Notificacion preparada no equivale a envio real.
2. Draft de email no equivale a email enviado.
3. WhatsApp Web fallback debe verse como copiar/manual/confirmar, no como envio automatico.
4. Provider pendiente no equivale a proveedor conectado.
5. No decir `enviado`, `sincronizado` o `Make ejecutado` si gate esta apagado.
6. Destinatarios deben usar referencia segura, no telefono/correo crudo en preview.
7. Plantillas deben ser configurables por tenant/proyecto/evento/version.
8. Payload con datos privados debe quedar bloqueado o en revision.

## Pendientes frontend concretos

### Toasters / banners

- Cambiar mensajes de envio real por preview, borrador, pendiente backend, accion manual o proveedor no configurado.
- No decir HR sincronizada cuando el flujo solo esta preparado.

### Centro de notificaciones

- Separar notificacion in-app de envio externo.
- Mostrar estado de outbox.
- Mostrar accion manual si aplica.
- Mostrar confirmacion manual como accion del usuario, no como proveedor real.

### Plantillas

- Usar templateId y version.
- Mostrar rol destinatario.
- No incluir datos sensibles crudos.

## Academia que Claude debe actualizar

- Curso Shopper: como leer notificaciones.
- Curso Ops: seguimiento de notificaciones y fallback manual.
- Curso Admin: plantillas y estados honestos.
- Curso Superadmin: configuracion de proveedores cuando corresponda.
- Manual notification outbox.
- Manual fallback manual.
- Checklist antes de confirmar envio externo.
- Checklist antes de publicar plantilla.
- Glosario: notificationId, templateId, templateVersion, recipientRef, outboxStatus, manualFallbackStatus.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Make/HR/Firestore/Storage reales.
- Email/WhatsApp/push reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales ni envios reales.

# Pendientes prototipo addendum - Notification outbox preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para notification outbox. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes toasters y textos honestos

1. No decir `enviado` si solo existe preview.
2. No decir `WhatsApp enviado` si solo hay fallback manual.
3. No decir `correo enviado` si solo hay draft o proveedor pendiente.
4. No decir `Make ejecutado` si gate esta apagado.
5. No decir `HR sincronizada` si solo esta preparado/pendiente.
6. Usar: preview, borrador, accion manual, pendiente backend, proveedor no configurado, requiere revision.

## Pendientes centro de notificaciones

1. Separar in-app notification de envio externo.
2. Mostrar estado outbox.
3. Mostrar canal.
4. Mostrar plantilla/version.
5. Mostrar accion manual si aplica.
6. Mostrar confirmacion manual como accion del usuario.
7. Bloquear payload sensible para revision.

## Pendientes plantillas

1. Plantillas configurables por tenant/proyecto/evento/version.
2. Variables seguras y referencias opacas.
3. No incluir banco, documentos, NDA, telefono/correo crudo, cuerpos crudos ni adjuntos privados.
4. Mostrar rol destinatario.
5. Permitir revision antes de publicar.

## Pendientes Academia

1. Curso Shopper: leer notificaciones.
2. Curso Ops: seguimiento y fallback manual.
3. Curso Admin: plantillas y estados honestos.
4. Curso Superadmin: configuracion de proveedores cuando corresponda.
5. Manual notification outbox.
6. Manual fallback manual.
7. Checklist antes de confirmar envio externo.
8. Checklist antes de publicar plantilla.
9. Glosario de notification outbox.

## No corresponde a Claude

- Implementar validator backend.
- Activar Make real.
- Escribir HR.
- Escribir Firestore.
- Enviar email/WhatsApp/push real.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: cambiar textos/toasts que prometen envios o sincronizaciones reales.

P1: centro de notificaciones con estados honestos y fallback manual.

P2: Academia profunda con manuales, checklists y glosario.

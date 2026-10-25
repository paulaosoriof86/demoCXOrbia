# Pendientes Claude addendum - Shopper communication history preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para shopper communication history. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes shopper history

1. Mostrar historial/timeline por shopper.
2. Mostrar canal.
3. Mostrar estado honesto.
4. Mostrar entidad relacionada.
5. Mostrar confirmacion manual si aplica.
6. Mostrar bloqueo por dato sensible si aplica.
7. No decir enviado/sincronizado/entregado sin confirmacion manual o provider gate futuro.

## Pendientes privacidad

1. No mostrar cuerpo crudo de WhatsApp/email.
2. No mostrar telefonos crudos.
3. No mostrar correos crudos.
4. No mostrar adjuntos privados.
5. No mostrar audios privados.
6. No mostrar banco/cuenta en comunicaciones de pago.
7. Usar referencias opacas y resumen seguro.

## Pendientes integracion

1. Separar notification outbox de comunicacion externa.
2. Separar email draft de email enviado.
3. Separar manual log de prueba de proveedor.
4. Separar WhatsApp Web fallback de WhatsApp API real.
5. Vincular a shopperId, visitId, hrRowId, postulationId, assignmentId, notificationId, mailActionId o crmEntityId.

## Pendientes Academia

1. Curso Ops: seguimiento de comunicacion shopper.
2. Curso Admin: auditoria de trazabilidad.
3. Curso Shopper: privacidad y lectura de notificaciones.
4. Curso Finanzas: comunicaciones de pago sin banco/cuenta.
5. Curso Superadmin: provider gates y politicas de retencion.
6. Manual shopper communication history.
7. Manual WhatsApp fallback traceability.
8. Manual email draft/manual log.
9. Checklist antes de registrar comunicacion.
10. Checklist antes de confirmar envio externo.
11. Glosario de communication history.

## No corresponde a Claude

- Implementar validator backend.
- Activar Make real.
- Enviar email/WhatsApp real.
- Leer correo/WhatsApp real.
- Escribir Firestore/Storage.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: no exponer comunicaciones crudas ni datos privados; no prometer envios/sync/delivery reales.

P1: timeline/historial con estados honestos y llaves estables.

P2: Academia profunda con manuales, checklists y glosario.

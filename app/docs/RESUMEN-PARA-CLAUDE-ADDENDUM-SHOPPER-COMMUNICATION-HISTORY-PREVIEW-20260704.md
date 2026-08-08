# Resumen para Claude addendum - Shopper communication history preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para shopper communication history sin lectura/envio real de comunicaciones.

Archivos agregados:

- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-communication-history-preview-validator.mjs`
- `app/docs/SHOPPER-COMMUNICATION-HISTORY-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-SHOPPER-COMMUNICATION-HISTORY-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-SHOPPER-COMMUNICATION-HISTORY-PREVIEW-20260704.md`

No se activo runtime, correo, WhatsApp, Make ni integraciones reales.

## Reglas que debe reflejar el prototipo

1. Shopper history debe mostrar eventos/resumen seguro/referencias, no conversaciones crudas.
2. No mostrar telefonos, correos, cuerpos, audios ni adjuntos privados.
3. Separar notificacion in-app, draft, log manual, provider pending y envio real futuro.
4. WhatsApp Web fallback debe requerir confirmacion manual.
5. Email draft/manual log no equivale a correo enviado.
6. Vincular historial a llaves estables: shopperId, visitId, hrRowId, postulationId, assignmentId, notificationId, mailActionId, crmEntityId.
7. No decir enviado/sincronizado/entregado sin confirmacion manual o provider gate futuro.
8. Comunicaciones de pago/liquidacion no deben exponer banco o cuenta.

## Pendientes frontend concretos

### Shopper history

- Mostrar timeline o historial por shopper.
- Mostrar canal y estado honesto.
- Mostrar entidad relacionada.
- Mostrar bloqueo por datos sensibles.
- Mostrar confirmacion manual si aplica.

### Privacidad

- No mostrar cuerpos crudos.
- No mostrar telefonos/correos crudos.
- No mostrar adjuntos.
- Usar referencias opacas.

### Integraciones

- No mostrar proveedor conectado si gate esta apagado.
- No mezclar notification outbox con comunicacion externa enviada.

## Academia que Claude debe actualizar

- Curso Ops: seguimiento de comunicacion shopper.
- Curso Admin: auditoria de trazabilidad.
- Curso Shopper: privacidad y lectura de notificaciones.
- Curso Finanzas: comunicaciones de pago sin datos bancarios.
- Curso Superadmin: provider gates y politicas de retencion.
- Manual shopper communication history.
- Manual WhatsApp fallback traceability.
- Manual email draft/manual log.
- Checklist antes de registrar comunicacion.
- Checklist antes de confirmar envio externo.
- Glosario: communicationId, threadId, participantRef, communicationStatus, manualConfirmationStatus.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Email/WhatsApp/Make reales.
- Firestore/Storage reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales ni envios reales.

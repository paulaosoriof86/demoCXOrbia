# Shopper communication history Phase A TyA

Fecha: 2026-07-04

## Objetivo

Ampliar el historial del shopper. No debe limitarse a visitas realizadas. Debe incluir trazabilidad de postulaciones, asignaciones, notificaciones, WhatsApp, correo, certificaciones, liquidaciones, pagos, soporte y Academia, con visibilidad controlada.

Este bloque no envia mensajes reales, no lee correos reales y no escribe Firestore.

## Contrato creado

- `app/contracts/shopper-communication-history-phase-a.tya.contract.json`

## Decision

El historial del shopper debe ser mas amplio que visitas realizadas.

Debe incluir, segun permisos:

- visitas historicas importadas desde HR;
- postulaciones;
- aprobaciones;
- no seleccionado suave;
- asignaciones;
- ajustes o confirmaciones de fecha;
- agenda, reprogramaciones y cancelaciones;
- visita realizada;
- cuestionario realizado;
- revision/submitido;
- liquidaciones/pagos;
- certificaciones;
- notificaciones in-app;
- WhatsApp Web/manual/API futura;
- correos manuales o futuros conectados;
- soporte;
- cursos Academia.

## Visibilidad para shopper

El shopper puede ver comunicaciones enviadas a el y estados relevantes de su gestion.

No debe ver:

- deliberaciones internas;
- notas sensibles del cliente;
- investigaciones internas;
- conflictos administrativos;
- criterios internos de score no aprobados;
- auditoria financiera interna;
- datos sensibles de otros shoppers.

## Comunicaciones visibles

Ejemplos de eventos visibles para shopper:

- postulacion enviada;
- aprobacion;
- no seleccionado suave;
- asignacion;
- solicitud de ajuste de fecha;
- solicitud de confirmacion;
- reprogramacion;
- cancelacion;
- cuestionario pendiente/realizado;
- certificacion asignada/completada;
- liquidacion/pago cuando corresponda;
- notificacion o correo enviado a el;
- curso Academia asignado.

## Historico HR

Para Cinépolis y otros proyectos, el historico debe poder importarse desde todas las hojas/tabs relevantes de HR, no solo un mes.

Debe reflejar visitas realizadas historicas y estados relevantes sin exponer campos crudos sensibles.

## Relacion con email y WhatsApp

Si se envia o registra comunicacion por correo o WhatsApp dirigida al shopper, debe poder aparecer en su historial con:

- canal;
- fecha;
- asunto/resumen;
- entidad relacionada;
- estado de envio o log;
- si fue manual o futuro proveedor.

## Pendientes backend

- Definir schema final de shopper history.
- Integrar HR historical import con shopper history.
- Integrar notification outbox.
- Integrar email traceability.
- Definir visibilidad por rol.
- Crear preview validator de historial shopper.

## Pendientes prototipo

- Ampliar historial shopper mas alla de visitas realizadas.
- Mostrar comunicaciones relevantes al shopper.
- Mostrar historial interno a admin/ops con mayor detalle.
- Proteger notas internas.
- Indicar canal y estado de comunicacion.

## Impacto Academia

Academia debe explicar:

- que puede ver un shopper en su historial;
- que comunicaciones recibe;
- que significan los estados;
- que puede ver admin/ops;
- que queda interno;
- como se importan visitas historicas desde HR.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin email real.
- Sin WhatsApp API real.
- Sin deploy.
- Sin produccion.

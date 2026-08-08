# COMM_REVIEW Phase A TyA

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/phase-a-communications-review.v1.json`

## Proposito

Cerrar el criterio documental para comunicaciones historicas y notificaciones Phase A sin activar envios reales.

## Entrada conocida

Del bloque previo se toma como referencia:

- 216 comunicaciones historicas / notification trace.
- Politica: historial solamente hasta que exista gate.
- Sin replay automatico.
- Sin Make real.
- Sin WhatsApp API real.
- Sin produccion.

## Decision

Las comunicaciones historicas se conservan como evidencia/auditoria y aprendizaje de flujos, pero no se reenvian automaticamente.

No se debe importar historial como notificaciones activas.

## Clasificacion

### History only

- trazas previas de notificaciones;
- contexto historico de mensajes;
- referencias de auditoria;
- contacto historico con shopper.

### Plantillas Phase A

Se pueden preparar plantillas para:

- postulacion recibida;
- postulacion aprobada;
- asignacion confirmada;
- agendar pendiente;
- recordatorio de visita;
- reprogramacion;
- cancelacion;
- solicitud de evidencias;
- cuestionario pendiente;
- cuestionario completado;
- revision pendiente;
- estado de pago disponible.

### Nunca reenviar automatico

- WhatsApp historico enviado;
- correo historico enviado;
- Make historico enviado;
- recordatorios historicos.

## Modos de notificacion permitidos

- apagado;
- in-app;
- WhatsApp Web plantilla/manual;
- WhatsApp API;
- Make.

## Green API

Green API puede evaluarse, pero no debe ser dependencia unica.

Si falla o no queda estable, debe existir alternativa:

- WhatsApp Web con plantilla/manual;
- otra API WA autorizada;
- notificacion in-app;
- modo apagado.

## Reglas de honestidad visual

- No decir enviado si solo se preparo.
- No decir sincronizado si Make no ejecuto webhook.
- No decir en vivo si proveedor no esta conectado.
- Usar preparado, preview, plantilla lista o pendiente de autorizacion mientras este gated.

## Gates antes de activar envios reales

1. Proyecto con contactos configurados.
2. Modo de notificacion elegido por proyecto/evento.
3. Plantilla revisada.
4. Confirmacion humana si el modo lo requiere.
5. Proveedor conectado y probado.
6. Log/auditoria de evento.
7. Rollback o apagado inmediato.

## Estado

- COMM_REVIEW documental creado.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore.
- Sin envio real.

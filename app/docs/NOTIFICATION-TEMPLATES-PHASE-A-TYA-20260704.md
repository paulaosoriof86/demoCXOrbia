# Notification templates Phase A TyA

Fecha: 2026-07-04

## Archivo creado

- `app/contracts/phase-a-notification-templates.v1.json`

## Proposito

Definir contrato de plantillas por evento para Phase A, sin proveedor, sin credenciales y sin envios reales.

## Politica por defecto

- Modo default: `off` salvo eventos in-app seguros.
- `enabled`: false por defecto.
- Requiere confirmacion humana si aplica.
- Provider status inicial: `not_connected`.
- Estado visual inicial: plantilla preparada.

## Tokens permitidos

Las plantillas solo deben usar tokens operativos no sensibles, por ejemplo:

- shopperName;
- projectName;
- visitLabel;
- visitDate;
- visitWindow;
- locationName;
- questionnaireLink;
- evidenceContactName;
- supportContactName;
- deadlineLabel;
- paymentPeriod;
- paymentStatus.

No deben incluir datos sensibles crudos.

## Eventos cubiertos

- postulacion recibida;
- postulacion aprobada;
- asignacion confirmada;
- agendar pendiente;
- recordatorio de visita;
- reprogramacion solicitada;
- cancelacion solicitada;
- visita realizada / solicitud de evidencias;
- cuestionario pendiente;
- cuestionario completado;
- revision pendiente;
- estado de pago disponible.

## Modos soportados

Cada evento puede permitir una combinacion de:

- off;
- in-app;
- WhatsApp Web plantilla/manual;
- WhatsApp API;
- Make.

## Reglas de estado honesto

- `prepared`: plantilla generada, no enviada.
- `pending_authorization`: falta autorizacion o proveedor.
- `sent`: proveedor confirmo envio.
- `synced`: Make confirmo ejecucion.
- `failed`: proveedor intento y fallo.

## Estado

- Contrato creado.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore.
- Sin envio real.

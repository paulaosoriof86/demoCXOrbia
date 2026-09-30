# Notification gates WhatsApp Make Phase A TyA

Fecha: 2026-07-04

## Proposito

Definir gates para notificaciones y recordatorios en Phase A sin depender de un proveedor unico.

## Principio

Las notificaciones son parte del flujo operativo, pero no deben activarse como envio real hasta que el gate correspondiente este aprobado.

## Eventos Phase A

- postulacion recibida;
- postulacion aprobada;
- asignacion confirmada;
- agendar pendiente;
- recordatorio de visita;
- reprogramacion solicitada;
- cancelacion solicitada;
- visita realizada;
- evidencias pendientes;
- cuestionario pendiente;
- cuestionario realizado;
- revision pendiente;
- pago disponible.

## Modos por evento

Cada evento debe poder configurarse como:

- `off`;
- `in_app`;
- `whatsapp_web_template`;
- `whatsapp_api`;
- `make`.

## WhatsApp Web plantilla/manual

Modo permitido para Phase A si la API no queda estable.

Debe generar texto preparado, link o plantilla, pero no debe marcar como enviado automaticamente.

## WhatsApp API

Permitida solo cuando:

- proveedor esta definido;
- credenciales estan configuradas fuera del repo;
- prueba controlada OK;
- existe log;
- existe apagado rapido.

## Make

Permitido solo cuando:

- webhook real este configurado;
- Paula autorice acceso;
- escenario este probado;
- se registre evento de sync;
- se pueda apagar sin romper flujo.

## Green API

Evaluable, pero no dependencia unica.

Si Green API falla, debe quedar disponible WhatsApp Web plantilla/manual u otra API WA.

## Textos obligatorios

- Preparado: cuando no se envio.
- Pendiente de autorizacion: cuando falta gate.
- Enviado: solo si hubo provider real confirmado.
- Sincronizado: solo si Make confirmo ejecucion.

## Estado

- Gates documentados.
- Sin envio real.
- Sin runtime conectado.
- Sin deploy ejecutado.

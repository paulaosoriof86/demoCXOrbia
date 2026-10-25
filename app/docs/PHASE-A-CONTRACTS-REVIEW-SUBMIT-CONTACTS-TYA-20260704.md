# Phase A contracts - revision, submitido, contactos y cuestionario

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/phase-a-project-config.v1.json`
- `app/contracts/phase-a-visit-workflow.v1.json`

## Proposito

Bajar a contrato backend/documental las decisiones aprobadas para Phase A sin tocar frontend.

## Proyecto configurable

El contrato de proyecto incluye:

- `tenantId` y `projectId`.
- Pais y moneda.
- Fuente HR con URL/origen/mapa/campos.
- Origen de cuestionario.
- Link general o link por visita desde HR.
- Revision y submitido configurables.
- Contactos por tipo de gestion.
- Notificaciones con modo/gate.

## Revision y submitido

Regla aprobada:

- Submitido no es accion universal de CXOrbia.
- Puede venir desde HR.
- Cada proyecto define quien revisa y quien submitira.
- La revision puede habilitar submitido externo o liquidacion segun configuracion.
- La fecha de revision debe poder escribirse a HR cuando el gate Make/backend este activo.

## Contactos

Cada proyecto debe poder configurar contactos para:

- evidencias;
- cuestionario;
- soporte;
- reprogramacion/cancelacion;
- pagos;
- coordinacion general.

Al marcar visita realizada, el flujo debe mostrar acceso a cuestionario y contacto de evidencias.

## Flujo de visita

El contrato de workflow define estados y activacion progresiva de botones:

- postular;
- agendar;
- reprogramar;
- cancelar;
- marcar realizada;
- abrir cuestionario;
- marcar cuestionario realizado;
- revisar;
- liquidar.

## Notificaciones

Los modos permitidos quedan definidos como:

- Make;
- WhatsApp API;
- WhatsApp Web plantilla/manual;
- in-app;
- apagado.

Green API puede ser evaluada, pero no es dependencia unica.

## Estado

- Contratos creados.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.

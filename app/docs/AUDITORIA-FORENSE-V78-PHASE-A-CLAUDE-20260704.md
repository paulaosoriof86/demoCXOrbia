# Auditoria forense V78 Phase A para Claude

Fecha: 2026-07-04

## Alcance

Auditoria funcional del prototipo V78 contra la Phase A aprobada como salida operativa controlada TyA.

## Lo que V78 ya tiene a favor

1. `app/modules/proyecto-wizard.js` ya contempla paises, moneda, honorarios, modelo, modo de cuestionario, origen HR, escenarios y pago estimado.
2. `app/modules/misvisitas.js` ya contempla pasos de flujo: asignada, instructivo, certificacion, agendada, realizada, cuestionario, submit y liquidada.
3. `app/modules/cuestionario-shopper.js` ya puede actualizar estado automaticamente si el cuestionario es interno.
4. `app/core/data.js` ya tiene `setVisitState()` y `assignVisit()` con llamada conceptual a HR writeback si `CX.hr` existe.
5. `app/core/automations.js` ya contempla eventos de postulacion, agenda, realizada, cuestionario, reprogramacion, pago, aprobacion y HR writeback.

## Brechas para Claude

### P0

- Falta etapa formal de revision entre cuestionario realizado y submitido/liquidacion.
- Falta configuracion de quien revisa y quien submitira por proyecto.
- Submitido no debe asumirse como accion universal de plataforma; en TyA se toma desde HR.
- Falta configurar fecha de revision y escritura a HR.
- Falta distinguir liquidacion habilitada por cuestionario, revision o submitido segun proyecto.

### P1

- Configuracion de HR debe incluir URL, origen, mapa, id estable de fila, campo revision, campo submitido, campo link cuestionario por visita y modo sync.
- Configuracion de cuestionario debe separar CXOrbia, plataforma externa, link general y link por visita desde HR.
- No hardcodear nombres de plataformas externas en el producto comercializable.
- Proyecto debe tener contactos WhatsApp por tipo de gestion: evidencias, cuestionario, soporte, reprogramacion/cancelacion, pagos y coordinacion.
- Al marcar visita realizada debe abrir modal con boton de cuestionario y contacto de evidencias por WhatsApp.

### P2

- Notificaciones deben tener modo/gate: Make, WhatsApp API, WhatsApp Web plantilla, in-app o apagado.
- Green API puede evaluarse, pero no debe ser dependencia unica.
- Revisar textos de honestidad visual: WA enviado, Make enviado, HR sincronizada, En vivo o equivalentes.
- Mantener pendientes previos: `nvBanner`, version default de nuevo tenant y PWA.

## Reglas para Claude

- No romper arquitectura.
- No hardcodear TyA ni Cinépolis.
- No mencionar una plataforma externa especifica como opcion fija general del SaaS.
- Lo especifico de TyA queda como configuracion del tenant/proyecto.
- Documentar archivos modificados y validacion esperada.

## Estado

- Auditoria creada.
- Sin cambios frontend en este bloque.
- Sin deploy ejecutado.

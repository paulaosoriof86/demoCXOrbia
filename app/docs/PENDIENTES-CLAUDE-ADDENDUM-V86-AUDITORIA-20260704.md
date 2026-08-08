# Pendientes Claude addendum - Auditoria V86

Fecha: 2026-07-04

## Estado general

V86 trae cambios reales frente a V85/V84, pero solo corrige parcialmente. Se conserva como candidata auditada de continuidad backend, no como source lock final.

## Resuelto parcialmente

1. `modules/misvisitas.js`: aiBox cambia a preview/pendiente backend.
2. `modules/dashboard.js`: algunos toasts cambian a preparado/borrador/pendiente.
3. `modules/academia.js`: una frase deja de prometer WhatsApp automatico.

## P0 abiertos

1. `modules/cuestionario-shopper.js`: sigue texto visible de cuestionario enviado.
2. `modules/postulaciones.js`: siguen textos de HR sync final.
3. `modules/postulaciones.js`: siguen textos de WhatsApp enviado.
4. `modules/dashboard.js`: sigue un estado de WhatsApp enviado en accion manual.
5. `modules/dashboard.js`: sigue un estado de correo enviado en seleccion masiva.
6. `modules/academia.js`: sigue sincronia automatica, HR externa y liquidacion como si fueran automáticas.
7. `docs/ADDENDUM-V87-PHASE-A.md`: revisar versionado/coherencia.

## P1 que debe incorporar Claude

- Notification outbox.
- Email/user mailbox.
- Ficha dinamica/versionado.
- CRM external folder refs.
- Assignment sync/conflicts.
- Visit lifecycle/reservas.

## Academia pendiente

- Rutas por rol completas.
- Checklists interactivos.
- Glosario consolidado.
- Manuales por modulo.
- Estados honestos de integracion.
- Beneficio operativo/comercial por modulo.

## Decision

Pedir V87 correctiva sobre V86. El siguiente ZIP debe corregir estos puntos con cambios verificables.

# Cambios backend addendum P0 V79 questionnaire enum

Fecha: 2026-07-04

## Archivos modificados

- `app/modules/proyecto-wizard.js`
- `app/modules/cuestionario-shopper.js`

## Archivo documental agregado

- `app/docs/P0-V79-QUESTIONNAIRE-ENUM-FIX-20260704.md`

## Motivo

Cerrar el P0 detectado en V79: enum de cuestionario inconsistente entre wizard, edicion de proyecto y ejecucion del cuestionario shopper.

## Cambios

- Wizard crea proyectos con enum V79: `interna`, `externo_general`, `externo_visita`.
- Compatibilidad legacy: `externa` y `link` se normalizan.
- Cuestionario shopper reconoce los nuevos modos.
- Link general y link por visita desde HR no caen en formulario interno.
- Si falta link, se muestra aviso y no se asume cuestionario interno.
- Marcar cuestionario externo como realizado actualiza estado si `data.setVisitState` esta disponible.

## Pendientes vivos

- Revision admin funcional.
- Submitido HR-driven completamente configurable.
- Exponer toda Phase A en wizard de creacion.

## Estado

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin runtime backend conectado.

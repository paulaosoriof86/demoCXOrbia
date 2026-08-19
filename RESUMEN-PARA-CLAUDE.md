# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-E2E-MECHANISM-HOLD-27`

## Validado/preservado
I4-A Shopper visible lifecycle PASS. I4-B provider source/readiness PASS. El primer E2E provider-backed no llegó al provider por un defecto del harness (`provider is not defined`), por lo que no demuestra regresión UI ni defecto de backend de negocio.

## Frontend / Claude — handoff vivo sin cambio
No parchear desde backend:
- `app/modules/visita-detalle.js`: postulación → `application.create`, éxito solo con ACK.
- `app/modules/postulaciones.js`: retirar mutaciones locales de decisiones/cancelación y consumir command/ACK.
- `app/modules/cuestionario-shopper.js`: score/submit solo después de ACK vía `submitQuestionnaire`.
- `app/modules/revision-admin.js`: sustituir localStorage/CX.data.revisiones como verdad por `visit.review.update` + ACK.

No hay P0 frontend nuevo demostrado.

## Academia
Sin cambio de contenido funcional por este HOLD: fue exclusivamente mecanismo de prueba. Mantener rutas Shopper ya validadas en I4-A; no enseñar como validado el ciclo write hasta que el retry E2E pase.

Siguiente técnico: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY`.

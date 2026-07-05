# Pendientes Claude addendum - Auditoria V85

Fecha: 2026-07-04

## Estado

V85 fue comparada contra V84 y no tiene cambios de contenido: 97 archivos vs 97, 0 agregados, 0 eliminados y 0 modificados. Por eso siguen vigentes los pendientes de V84.

## P0 que siguen abiertos

1. `modules/cuestionario-shopper.js`: texto visible pendiente sobre cuestionario; debe decir realizado/completado.
2. `modules/postulaciones.js`: textos de HR sync final deben pasar a estado pendiente/backend/gate.
3. `modules/misvisitas.js`: separar visita, cuestionario, revision, submitido, liquidacion y pago; no prometer automatismos reales.
4. `modules/dashboard.js` y `modules/postulaciones.js`: estados de comunicacion externa deben quedar como fallback/manual/draft/provider pendiente.
5. `modules/academia.js`: convertir sincronia automatica/HR externa/liquidacion a estados honestos y gates apagados.
6. `docs/ADDENDUM-V87-PHASE-A.md`: corregir versionado residual dentro del ZIP V85.

## P1 que debe incorporar Claude

- Notification outbox.
- Email/user mailbox.
- Ficha dinamica y versionado.
- Assignment sync/conflicts.
- Visit lifecycle/reservas.

## Decision

Pedir V86 correctiva real sobre V85/V84. El siguiente ZIP debe traer cambios verificables en archivos.

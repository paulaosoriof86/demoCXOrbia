# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`

## Validado/preservado
I1/I2/I3 e I4-A permanecen PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 no se reprocesan.

## I4-B
Retry1 run `32297736022` sí llegó al provider real. `application.create` y replay idempotente pasaron. `application.status.update` falló por orden inválido de lectura/escritura dentro de una transacción Firestore. El fix source-only está en `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`; verifier reforzado en `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

Retry1 quedó consumido; fixture y aplicación sintéticos fueron retirados y visitas/postulaciones reales quedaron invariantes.

## Frontend / Claude — handoff vivo sin cambio
No parchear desde backend:
- `app/modules/visita-detalle.js`: postulación → `application.create`, éxito solo con ACK.
- `app/modules/postulaciones.js`: decisiones/cancelación vía command/ACK, sin mutación local como verdad.
- `app/modules/cuestionario-shopper.js`: submit/score solo después de ACK.
- `app/modules/revision-admin.js`: `visit.review.update` + ACK como verdad.

No hay P0 frontend nuevo demostrado y no se crea candidata nueva.

## Corrección de continuidad
Se corrigió la desincronización entre documentos epoch 28/29 y el source-truth verifier deja de usar epoch/frontera hard-codeados; ahora los deriva del Execution State y verifica el conjunto canónico completo.

## Academia
Sin cambio funcional. No enseñar el ciclo write como PASS hasta que pase Retry2. Progreso formal: **60% completado / 40% pendiente**.

Siguiente: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`. PASS → I4-C HR bidireccional.

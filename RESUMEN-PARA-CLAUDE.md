# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

## Validado/preservado
I1/I2/I3 e I4-A PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 no se reprocesan.

## I4-B
Retry1 alcanzó provider real; `application.create` y replay idempotente pasaron. El orden Firestore de `application.status.update` fue la causa exacta y quedó corregido en fuente. Datos reales quedaron invariantes.

## Continuidad corregida
Los 10 documentos canónicos quedan sincronizados. El verifier de source-truth deriva también el progreso del Execution State, eliminando el hard-code 60/40 que habría bloqueado una transición futura. El verifier del provider cubre las tres ramas transaccionales.

El workflow I4-B queda estable/request-driven y usa executor/finalizer genéricos. No debe crearse otro workflow para Retry2 ni futuras adjudicaciones de este mismo lifecycle.

## Frontend / Claude — handoff vivo sin cambio
No parchear desde backend:
- `app/modules/visita-detalle.js`: postulación → `application.create`, éxito solo con ACK.
- `app/modules/postulaciones.js`: decisiones/cancelación vía command/ACK.
- `app/modules/cuestionario-shopper.js`: submit/score solo después de ACK.
- `app/modules/revision-admin.js`: `visit.review.update` + ACK como verdad.

No hay P0 frontend nuevo demostrado y no se crea candidata nueva.

## Academia
Sin cambio funcional. No enseñar lifecycle write como PASS hasta Retry2. Progreso formal: **60% completado / 40% pendiente**.

Siguiente: `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`. El request está preparado, pero provider permanece bloqueado hasta autorización explícita. PASS → I4-C HR bidireccional.

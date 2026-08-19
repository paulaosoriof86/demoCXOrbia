# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

## Estado formal
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. No hay subpesos formales I4-A..F.

## Frozen
I1/I2/I3; Historical Shopper; TARGET_B Admin; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4; I4-A visible lifecycle. No se reprocesa ninguno.

## I4-B
Retry1 run `32297736022` alcanzó provider real. `application.create` y replay idempotente pasaron; `application.status.update` quedó HOLD por orden Firestore. Retry1 consumido. Fix source-only `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`; real visits/postulations invariantes.

## Antidesvío sostenible
Antes de Retry2 se corrigen dos mecanismos de repetición: (1) source truth deriva epoch, frontera y progreso del Execution State sin hard-codes, incluso después de 60/40; (2) el carril I4-B se vuelve request-driven y genérico, por lo que no se crea/modifica un workflow por cada retry. Un gate no autorizado jamás entra al provider; un fallo pre-mutation no consume el gate.

El provider verifier comprueba read-before-write en `application.create`, `application.status.update` y `visit.*` antes de cualquier ejecución.

## Frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry2 queda construido y source-only listo, pero deshabilitado hasta autorización explícita. Scope sintético, sin Historical Shopper, sin mutar las 660 visitas reales y sin producción. PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

Frontend/Claude conserva el handoff vigente; Academia sin cambio funcional en este bloque source-only.

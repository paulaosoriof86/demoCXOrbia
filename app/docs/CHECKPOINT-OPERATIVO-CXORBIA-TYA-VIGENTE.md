# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`  
**Formal:** **60% completado / 40% pendiente**; I4 no tiene subpeso formal.

I1/I2/I3 e I4-A permanecen PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 permanecen preservados sin reproceso.

## I4-B — estado real
Retry1 run `32297736022` alcanzó provider real. `application.create` y replay idempotente PASS; `application.status.update` HOLD por orden Firestore. Retry1 consumido y sin retry automático. Fix source-only `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`; datos reales invariantes.

## Auditoría de continuidad previa a Retry2
El conjunto canónico de 10 documentos queda en un único epoch/frontera. Se corrigió el último hard-code latente: el source-truth verifier ya no fija 60/40, sino que lee el porcentaje vigente del Execution State y comprueba que progreso+pendiente=100. Esto evita una regresión automática al cerrar I4 y cambiar a 85/15.

El provider source verifier se amplía para comprobar read-before-write en las tres ramas transaccionales antes de cualquier provider-backed run.

## Carril Retry2
El workflow existente queda estable y request-driven; no se vuelve a editar para cada retry. Un request deshabilitado solo corre preflight source-only. Provider solo se alcanza si el gate coincide con la frontera, está habilitado, no consumido y autorizado por Paula. No se cancela un run activo y un fallo previo al intento de mutación no consume autorización.

Evidencia: `app/docs/evidence/I4B-RETRY2-LANE-READINESS-SOURCE-ONLY.json`.

## Siguiente exacto
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Request preparado sin ejecutar provider: `enabled=false / consumed=false / authorizationRequired=true`. PASS → I4-C HR bidireccional.

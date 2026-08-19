# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`  
**Formal:** **60% completado / 40% pendiente**; I4 no tiene subpeso formal.

I1/I2/I3 e I4-A permanecen PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 permanecen preservados sin reproceso.

## I4-B — estado real
Retry1 run `32297736022` sí alcanzó el provider real. `application.create` PASS y replay idempotente PASS. El tercer comando `application.status.update` quedó HOLD por `Firestore transactions require all reads to be executed before all writes.`

El gate Retry1 quedó `enabled=false / consumed=true / executionsConsumed=1 / automaticRetryAllowed=false`. Safety confirmado: fixture y aplicación sintéticos eliminados; visitas/postulaciones reales invariantes; Historical Shopper=false; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios.

## Causa raíz y fix
La transacción escribía la postulación antes de terminar la lectura de la visita asociada. Fix source-only aplicado en commit `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`, dejando todas las lecturas/validaciones antes de cualquier write. Verificador source-only reforzado en `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

## Hallazgo metodológico corregido
Se detectó desincronización real: este checkpoint y otros documentos seguían en epoch 28 mientras Index/Execution State/Source Lock ya estaban en epoch 29. El source-truth verifier se corrige para derivar epoch y frontera del Execution State y exigir coincidencia en todos los documentos canónicos, eliminando el hard-code que permitía repetir este patrón.

Evidencia activa: `app/docs/evidence/I4B-RETRY1-PROVIDER-TX-ORDER-SOURCE-FIX.json`.

## Siguiente exacto
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Nueva autorización solo porque Retry1 fue consumido. El scope no se amplía: sintético únicamente, sin Historical Shopper, sin mutar las 660 visitas reales y sin producción. PASS → I4-C HR bidireccional.

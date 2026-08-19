# SOURCE LOCK CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Progreso formal canónico
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. El plan vigente no asigna subpesos I4-A..F.

## Frozen / preservado
I1/I2/I3; I4-A visible lifecycle; Historical Shopper; TARGET_B Admin — no recrear; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. I4-B readiness/provider source anterior permanece preservado y el provider real ya fue alcanzado.

## I4-B Retry1 — resultado real
Run `32297736022` atravesó source truth, provider source y preparación DEV; ejecutó el provider. `application.create` PASS con ACK y 3 writes reportados; replay idempotente PASS con 0 writes. El tercer comando falló en `application.status.update` con `Firestore transactions require all reads to be executed before all writes.`

Retry1 quedó consumido: `enabled=false`, `consumed=true`, `executionsConsumed=1`, sin retry automático. Safety: fixture sintético creado y retirado; aplicación sintética retirada; visitas/postulaciones reales invariantes; Historical Shopper 0; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod 0/false.

## Causa raíz y corrección
Causa reproducible: en `application.status.update`, la transacción hacía `tx.set` de la postulación y después `tx.get` de la visita al aprobar. Firestore exige completar lecturas antes de escrituras.

Fix source-only aplicado en `backend/runtime/cxorbia-visit-lifecycle-command-provider-v1.mjs`, commit `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`: lectura/validación de postulación y visita antes de cualquier write. Verificador reforzado en `tools/verify-cxorbia-i4b-visit-provider-source.mjs`, commit `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`, con guard `FIRESTORE_TRANSACTION_READ_AFTER_WRITE_REGRESSION`.

Evidencia activa: `app/docs/evidence/I4B-RETRY1-PROVIDER-TX-ORDER-SOURCE-FIX.json`.

## Frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Se requiere nueva autorización únicamente porque Retry1 sí fue consumido. El próximo retest conserva alcance sintético, sin Historical Shopper, sin mutar las 660 visitas reales y sin producción. Si PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5 producción.

# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PROVIDER-TX-ORDER-HOLD-29`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZING__I4B_PROVIDER_REACHED__TX_ORDER_ROOT_CAUSE_FIXED_SOURCE_ONLY__RETRY2_AUTH_REQUIRED__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y ejecución directa siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial/Actions. I1/I2/I3/I4-A siguen frozen. No reabrir Auth/HR/Shopper ni recrear TARGET_B Admin. I4-B ya alcanzó provider real; el pendiente es validar la corrección puntual del orden transaccional.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos formales I4-A..F.

## I4-B Retry1
Run `32297736022`: source truth PASS, provider source PASS, runtime DEV PASS y provider ejecutado. `application.create` PASS; replay idempotente PASS. Fallo real del tercer comando: `Firestore transactions require all reads to be executed before all writes.`

Safety: `providerCommandCalls=3`, `providerCommittedCalls=2`, `providerWritesReported=3`; fixture y aplicación sintéticos eliminados; visitas/postulaciones reales invariantes; Historical Shopper/Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios.

Retry1 fue consumido y no admite retry automático.

## Causa raíz corregida source-only
`application.status.update` leía la visita después de escribir la postulación dentro de la transacción. Fix commit `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`: todas las lecturas/validaciones de aprobación ocurren antes de `tx.set`. Verificador source-only reforzado en commit `e1f62c8425d0fffc62b2ba92ccdd6141b60f3be6`.

Evidencia activa: `app/docs/evidence/I4B-RETRY1-PROVIDER-TX-ORDER-SOURCE-FIX.json`.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY` — nueva autorización necesaria porque Retry1 sí quedó consumido; mismo scope sintético y cero producción.

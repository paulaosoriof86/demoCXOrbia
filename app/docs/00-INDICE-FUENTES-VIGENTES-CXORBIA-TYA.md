# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-E2E-MECHANISM-HOLD-27`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4B_E2E_MECHANISM_HOLD__RETRY_AUTH_REQUIRED__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y ejecución directa siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial/Actions. I1/I2/I3/I4-A siguen frozen. I4-B readiness/provider source sigue PASS. El único hallazgo nuevo es el mecanismo del primer E2E; no reabrir Auth/HR/Shopper.

## Avance formal
I1 15/15; I2 20/20; I3 25/25 FROZEN; I4 0/25 IN_PROGRESS; I5 0/15 = **60% / 40%**. Sin subpesos I4-A..F.

## I4-B E2E — HOLD DE MECANISMO
Run `32286832002`, artifact `9377953415`: el harness falló con `provider is not defined` antes de cualquier commit del provider. `providerCommittedCalls=0`, `providerWritesReported=0`; la única visita sintética creada fue retirada; visitas reales y postulaciones reales quedaron bit-a-bit invariantes según digest del gate. Historical Shopper 0.

Clasificación: `PIPELINE_MECHANISM_FAILURE_PRIMARY`; no demuestra defecto del producto/provider. Corrección source-only: `tools/cxorbia-i4b-e2e-harness-v1.mjs`, con provider pasado como parámetro explícito.

Evidencia activa: `app/docs/evidence/I4B-VISIT-LIFECYCLE-E2E-RUNTIME-OBSERVED.json`.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY` — requiere autorización explícita; mismo alcance sintético, sin ampliar writes.

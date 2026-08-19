# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY1-PREPROVIDER-DOCSYNC-FIX-28`  
**Estado:** `SOURCE_TRUTH_RESYNC_IN_PROGRESS__I4B_RETRY1_AUTHORIZED_UNCONSUMED__PREPROVIDER_DOCSYNC_FAILURE_CORRECTED__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y ejecución directa siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial/Actions. I1/I2/I3/I4-A siguen frozen. I4-B readiness/provider source sigue PASS. No reabrir Auth/HR/Shopper ni recrear TARGET_B Admin.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos formales I4-A..F.

El tracker histórico que mostraba 35/65 queda reemplazado por este mismo denominador canónico: I3 ya está integralmente PASS/FROZEN y aporta sus 25 puntos.

## I4-B
Primer E2E run `32286832002`: HOLD de mecanismo `provider is not defined`; provider commits/writes 0 y datos reales invariantes. Corrección de harness source-only preservada.

Retry1 está autorizado y no consumido bajo `NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY1__HARNESS_SCOPE_FIXED__SYNTHETIC_VISIT_ONLY`.

Run `32296607712` confirmó el carril observable pero se detuvo antes de provider por desincronización documental: `FAIL_SOURCE_TRUTH_SYNC` con único error `FRONTIER:app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`. El finalizer además presentó error shell y no consumió el gate. Provider runtime/calls/commits/writes = 0; gate sigue autorizado/unconsumido.

Evidencia activa: `app/docs/evidence/I4B-RETRY1-PREPROVIDER-DOCSYNC-FAILURE.json`.

## Siguiente frontera exacta
Completar este resync documental, corregir el finalizer y ejecutar el mismo Retry1 ya autorizado. Si PASS → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5 producción.

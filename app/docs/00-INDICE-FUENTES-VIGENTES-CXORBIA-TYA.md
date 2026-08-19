# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-RETRY2-HARNESS-GLOBAL-GUARD-HOLD-24`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN__60_40__I4A_RETRY2_HARNESS_HOLD__RETRY3_AUTHORIZED`

Orden: Execution State → Source Lock → Checkpoint → Plan Unificado → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → evidencia activa → PR #7/HEAD/delta. Permanecen vigentes reglas maestras, Academia, patrones reutilizables, antidesvío y ejecución directa.

## CONTINUITY_FAST_PATH
No reconstruir miles de commits/Actions. Un objetivo técnico real, evidencia y cierre atómico. Fallo de harness no es P0 de producto.

## Avance
I1 15/15; I2 20/20; I3 25/25 FROZEN; I4 0/25; I5 0/15 = **60% / 40%**.

## I4-A
Retry1 demostró Auth + membership + app + HR 15/660 y ruta Documentos. Retry2 tuvo un preflight fail-closed sin provider por una frontera omitida en RESUMEN, corregida; luego el provider run `32282049566` pasó página, Firebase user, Shopper context, membership y app, pero el propio predicate del harness lanzó `ReferenceError: CX_PROTECTED_AUTH_HR_AUTHORITY is not defined` antes de esperar la propiedad de `window`. No producto defect probado. Cero Firestore/HR/operational writes.

Evidencia: `app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-RETRY2-HOLD-LATEST.json`.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY3__SAFE_GLOBAL_GUARDS__STABLE_SURFACES`

Autorizada por el turno actual; misma Shopper sintética, máximo 1 password update efímero + 1 login; usar `window.*` para globals opcionales y controles visibles estables; cero otros writes/deploy/merge/prod.

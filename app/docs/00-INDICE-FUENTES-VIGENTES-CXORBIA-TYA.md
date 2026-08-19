# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__RETRY2_STABLE_LANE_SOURCE_ONLY_READY__AUTH_REQUIRED__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y ejecución directa siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial/Actions. I1/I2/I3/I4-A siguen frozen. No reabrir Auth/HR/Shopper ni recrear TARGET_B Admin. I4-B ya alcanzó provider real; la causa transaccional quedó corregida y el carril Retry2 queda preparado source-only.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos formales I4-A..F.

## Verificación sistémica antes de continuar
Los 10 documentos canónicos quedan en el mismo epoch y la misma frontera. `tools/verify-cxorbia-source-truth-sync.mjs` v11 deriva epoch, frontera y porcentaje del Execution State; ya no hard-codea 60/40, por lo que tampoco bloqueará la transición futura a 85/15 cuando I4 cierre.

El verificador de provider revisa las tres ramas transaccionales (`application.create`, `application.status.update`, `visit.*`) contra regresiones read-after-write. El fix de `application.status.update` permanece en `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`.

## Carril Retry2 preparado sin ejecutar provider
El workflow I4-B existente se convierte en carril estable request-driven: un gate deshabilitado ejecuta solo preflight; solo un request `enabled=true`, `consumed=false`, autorizado por Paula y coincidente con la frontera canónica puede alcanzar provider. No cancela una ejecución en curso, no consume autorización por fallos pre-mutation y usa executor/finalizer genéricos para evitar reconstruir el mecanismo en cada retry.

Evidencia activa: `app/docs/evidence/I4B-RETRY2-LANE-READINESS-SOURCE-ONLY.json`.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

El request queda preparado pero deshabilitado y sin autorización; no hubo provider writes en este bloque source-only. PASS Retry2 → I4-C HR bidireccional.

# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-REUSE-CLOSED-I4E-ACTIVE-35`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4C_DEFERRED_NONBLOCKING__I4D_EXISTING_FINANCE_REUSED_CLOSED__I4E_ACTIVE__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## CONTINUITY_FAST_PATH
No reabrir I1/I2/I3/I4-A/I4-B, Auth, Historical Shopper, TARGET_B Admin, HR histórico ni Finance V2/historical. I4-C conserva source readiness suficiente para Phase A y Make/HR runtime permanece diferido.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. No existen subpesos I4-A..F; el porcentaje formal cambia al cerrar I4 completo, no por sus fronteras internas.

## I4-D Finanzas — cerrado por reutilización
`PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`.

La inspección del HEAD vivo confirmó que el wiring financiero de `CX.data` ya existía en `app/core/backend-cxdata-finance-read.js`, `app/adapters/tya-financial-canonical-source-safe-adapter.js` y `app/adapters/tya-canonical-finance-read-model-v2.js`, todos ya cargados por `app/index-backend-dev.html`. No reconstruir ni volver a cablear Finanzas.

Lo nuevo de I4-D queda limitado a la verdad histórica Phase A: Mayo 2026 `44/44 pagadas`; Junio 2026 `44 visitas / 2 pagadas / 42 pendientes`; Q451 confirmados. Reconciliación `247 / 209 / 38 / 207 / 2`. `liquidada != pagada`.

El verifier source-safe quedó endurecido a 24 aserciones, pero **no se afirma ejecución** en esta evidencia ni en GitHub Actions.

## Frontera viva exacta
`I4E_MULTI_PROJECT_NO_CODE_REUSE_AUDIT`.

Regla de ejecución: inventariar y reutilizar primero los contratos/configuración multi-proyecto existentes; crear o modificar únicamente la brecha real demostrada. Cinépolis debe permanecer como proyecto configurable por `tenantId + projectId`, nunca como lógica global.

Source-only: 0 ejecución de pagos, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini/deploy/merge/producción. Evidencia financiera activa: `app/docs/evidence/I4D-FINANCE-PHASE-A-SOURCE-READINESS.json`.

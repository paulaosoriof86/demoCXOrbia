# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-PHASEA-ACTIVE-33`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4C_SOURCE_READY_DEFERRED_NONBLOCKING__I4D_FINANCE_ACTIVE__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## CONTINUITY_FAST_PATH
No reabrir I1/I2/I3/I4-A/I4-B, Auth, Historical Shopper, TARGET_B Admin ni HR histórico. I4-C conserva su source readiness PASS y queda cerrado para Phase A; la conexión runtime de Make/HR se difiere y no bloquea el go-live inicial.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos I4-A..F.

## Corrección de prioridad
La fuente maestra exige pedir Make solo al llegar al bloque real de integración y define como meta de salida que el shopper vea liquidaciones históricas con estado de pago al menos junio. Por ello Make queda aparcado y Finanzas pasa a la frontera viva.

## I4-D Finanzas — verdad ya existente
`app/data/tya-payment-history-source-safe.js` registra Mayo 2026 `44/44 pagadas` y Junio 2026 `44 visitas / 2 pagadas / 42 pendientes`, con 2 pagos exactos GT por Q451 en total. No ejecuta pagos ni contiene datos bancarios crudos.

La reconciliación financiera canónica conserva `247` filas de liquidación, `209` enlaces exactos aceptados, `38` filas en revisión, `207` montos canónicos listos y `2` revisiones de monto. `liquidada` no equivale a `pagada`.

Se añadieron `backend/runtime/cxorbia-finance-phase-a-read-model-v1.mjs` y `tools/verify-cxorbia-i4d-finance-phase-a-source.mjs`; se reutilizan el adapter y contratos existentes sin reconstruir Finance V2/historical.

## Siguiente frontera exacta
`I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS`.

Source-only: 0 ejecución de pagos, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini/deploy/merge/producción. Evidencia activa: `app/docs/evidence/I4D-FINANCE-PHASE-A-SOURCE-READINESS.json`.

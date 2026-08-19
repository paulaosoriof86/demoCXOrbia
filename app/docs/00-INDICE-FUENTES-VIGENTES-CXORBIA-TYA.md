# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4D-FINANCE-VERIFIED-34`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4C_SOURCE_READY_DEFERRED_NONBLOCKING__I4D_FINANCE_SOURCE_PASS_CXDATA_WIRING_ACTIVE__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## CONTINUITY_FAST_PATH
No reabrir I1/I2/I3/I4-A/I4-B, Auth, Historical Shopper, TARGET_B Admin ni HR histórico. I4-C conserva su source readiness PASS y queda cerrado para Phase A; la conexión runtime de Make/HR se difiere y no bloquea el go-live inicial.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos I4-A..F. El porcentaje formal no cambia al cerrar sub-bloques internos de I4; el avance se registra por frontera/gate hasta cerrar I4 completo.

## I4-D Finanzas — source readiness PASS
`I4D_FINANCE_PHASE_A_JUNE_PAYMENT_STATE_SOURCE_READINESS` = `PASS_I4D_FINANCE_PHASE_A_SOURCE_READINESS`.

Fuente histórica source-safe: Mayo 2026 `44/44 pagadas`; Junio 2026 `44 visitas / 2 pagadas / 42 pendientes`; los dos pagos confirmados de junio suman Q451. Se fijaron 24 aserciones del verifier, incluyendo total Q451, unicidad de claves `visitId::hrRowId`, separación `liquidada != pagada`, prohibición de inferir pago desde ejecución, no deduplicación por nombre y bloqueos de writes/ejecución.

Reconciliación financiera: `247` filas, `209` enlaces exactos aceptados, `38` revisiones, `207` montos canónicos listos y `2` revisiones de monto.

## Frontera viva exacta
`I4D_FINANCE_PHASE_A_CX_DATA_READ_WIRING`.

Objetivo: conectar el read model financiero source-safe al único punto autorizado de `CX.data`, conservando exactamente su interfaz, sin tocar módulos UI, sin reconstruir Finance V2/historical y manteniendo scope `tenantId + projectId`.

Source-only: 0 ejecución de pagos, 0 payment-state writes, 0 Make/HR/Auth/Rules/Storage/Gemini/deploy/merge/producción. Evidencia activa: `app/docs/evidence/I4D-FINANCE-PHASE-A-SOURCE-READINESS.json`.

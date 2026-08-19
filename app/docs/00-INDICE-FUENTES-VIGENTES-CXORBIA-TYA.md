# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4B_RETRY2_PASS_FROZEN__I4C_SOURCE_READINESS_ACTIVE__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y ejecución directa siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial/Actions. I1/I2/I3/I4-A/I4-B quedan PASS/frozen. No reabrir Auth/HR histórico/Shopper ni recrear TARGET_B Admin. Retry2 cerró I4-B con provider real y sin mutación de datos reales.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos formales I4-A..F.

## I4-B Retry2 — PASS
Run `32305790197`, commit de autorización `e02a558a3848cb2a9637d9037f8f7c16b68b4a12`, commit de resultado `fafa26a5f091012fe422ffc0464ced699279914b`.

Decisión: `PASS_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E__SYNTHETIC_VISIT_ONLY`.

Se probaron `application.create`, replay idempotente, aprobación, agendamiento, reprogramación solicitada/aprobada, cancelación request-only, realización, cuestionario, revisión y conflicto de versión bloqueado antes de mutación. Contadores: 11 llamadas, 10 commits, 28 writes reportados, 9 receipts, 9 audit docs.

Safety: fixture y postulación sintéticos retirados; visitas/postulaciones reales invariantes; Historical Shopper=false; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción = 0/false.

## Siguiente frontera exacta
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

I4-C inicia source-only: construir/verificar Plataforma→HR y HR→Plataforma con `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no deduplicar por nombre y enviar conflictos a revisión. No hay autorización de HR writes ni producción.

Evidencia activa: `app/docs/evidence/I4B-RETRY2-PASS-CLOSURE.json`.

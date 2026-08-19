# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I4B_PASS_FROZEN__I4C_SOURCE_READY__LIVE_MAKE_BINDING_REQUIRED__60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Reglas maestras, Academia, patrones, antidesvío y carril prevalente siguen vigentes.

## CONTINUITY_FAST_PATH
No reconstruir historial ni reabrir I1/I2/I3/I4-A/I4-B, Auth, Historical Shopper, TARGET_B Admin o HR histórico. I4-B permanece PASS/frozen. I4-C avanzó desde diseño pendiente a source readiness PASS.

## Avance formal canónico
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos I4-A..F.

## I4-C source readiness
Se reutilizan tres piezas ya existentes: el lifecycle provider que marca asignaciones de plataforma con `assignmentSource`/`assignmentSyncStatus`, HR source-safe con `visitId/id + hrRowId + tenantId + projectId + shopperId`, y `make-outbox-adapter.preview.mjs` con canal `hrSync` y gates apagados por defecto.

Se crean contrato, adapter y verifier de sincronización bidireccional. Plataforma→HR prepara un outbox idempotente por claves estables; HR→Plataforma prepara `visit.assign` con origen `hr`; la misma asignación reflejada no se duplica; shoppers distintos o identidades inestables van a revisión humana. Los nombres nunca participan en dedupe.

Verificación determinista source-only: `PASS_I4C_HR_BIDIRECTIONAL_SYNC_SOURCE`; 8 casos PASS; provider/HR/Make/platform writes = 0.

## Bloqueo externo exacto
No se encontró binding live de Make/HR: en backend existe únicamente el outbox preview; no apareció escenario/webhook/config de Make en repo, Gmail, Drive ni contexto recuperable. Esto no es un defecto del planner ni otro diagnóstico pendiente.

## Siguiente frontera exacta
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No autoriza Make, HR writes, Firestore writes, deploy, merge ni producción. Evidencia activa: `app/docs/evidence/I4C-HR-BIDIRECTIONAL-SYNC-SOURCE-READINESS.json`.

# SOURCE LOCK CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Progreso formal canónico
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. El plan vigente no asigna subpesos I4-A..F.

## Frozen / preservado
I1/I2/I3/I4-A/I4-B; Historical Shopper; TARGET_B Admin — no recrear; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. No reprocesar.

## I4-B cerrado
Retry2 run `32305790197` pasó el lifecycle provider-backed completo en fixture sintético. Decisión `PASS_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E__SYNTHETIC_VISIT_ONLY`; 11 llamadas, 10 commits, 28 writes reportados, 9 receipts y 9 audit docs. Replay idempotente y conflicto de versión quedaron probados.

Safety: fixture/aplicación sintéticos eliminados; visitas/postulaciones reales invariantes; Historical Shopper/Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios.

## Source truth sostenible
Los 10 documentos canónicos usan epoch, frontera y progreso derivados de `CXORBIA-EXECUTION-STATE.json`; no existen hard-codes de 60/40. El carril I4-B queda frozen y no se reutiliza.

## Frontera exacta
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

I4-C es source-only hasta nuevo gate: Plataforma→HR registra origen plataforma y sync pendiente; HR→Plataforma detecta asignación y evita duplicar lo ya originado en plataforma. Claves obligatorias: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`. Conflictos pasan a revisión; nunca deduplicar solo por nombre.

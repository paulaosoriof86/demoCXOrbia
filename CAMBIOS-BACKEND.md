# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

**Avance formal:** **60% completado / 40% pendiente**.

## Preservado
I1/I2/I3/I4-A PASS/frozen, HR `15 periodos / 660 visitas`, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. Sin frontend P0 nuevo.

## I4-B Retry2 ejecutado y cerrado
Autorización exacta registrada en el request y ejecutada una sola vez sobre `cxorbia-backend-dev`. Run `32305790197`, resultado `PASS_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E__SYNTHETIC_VISIT_ONLY`.

Validado provider-backed: `application.create`, replay idempotente, aprobación de postulación, agendamiento, solicitud/aprobación de reprogramación, solicitud de cancelación, realización, cuestionario, revisión y expectedVersion conflict bloqueado antes de mutación.

Contadores: `providerCommandCalls=11`, `providerCommittedCalls=10`, `providerWritesReported=28`, `receiptDocsObserved=9`, `auditDocsObserved=9`, `syntheticFixtureCreates=1`, `syntheticFixtureDeletes=2`, `errors=[]`.

Safety: visitas/postulaciones reales invariantes; Historical Shopper=false; Auth/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod sin cambios. Gate Retry2 quedó `enabled=false / consumed=true / executionsConsumed=1 / status=pass_consumed_provider_verified` y no se repite.

## Siguiente frontera
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

I4-C arranca source-only. Debe reutilizar el HR source-safe ya existente y el provider lifecycle ya validado, agregando/validando contratos de sincronización para Plataforma→HR y HR→Plataforma mediante `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`. No deduplicar por nombre; conflictos a revisión humana. Cero HR writes hasta gate explícito.

## Clasificación
- Reusable CXOrbia: lifecycle provider-backed validado, idempotencia/optimistic concurrency y patrón de sync por claves estables/origen/estado.
- Exclusivo TyA: tenant `tya`, proyecto Cinépolis, HR 15/660 y fixture sintético I4-B.
- Claude/prototipo: handoff frontend previo se conserva; no parchear módulos desde backend.
- Academia: I4-B ya puede documentarse como lifecycle backend validado; el flujo HR bidireccional no debe enseñarse como operativo hasta cerrar I4-C.
- Sin impacto Claude: gate/evidencia/runtime interno de Retry2 y transición documental a I4-C.

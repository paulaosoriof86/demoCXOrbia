# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

I1/I2/I3/I4-A/I4-B PASS/frozen. Progreso formal canónico: **60% completado / 40% pendiente**.

## Pendiente activo único inmediato
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

## I4-B cerrado
Retry2 run `32305790197` pasó. Gate consumido una sola vez; lifecycle provider-backed completo, idempotencia y conflicto de versión probados; fixture eliminado y datos reales invariantes. No reabrir I4-B ni pedir otro retry.

## I4-C por construir/verificar
- Plataforma→HR: marcar origen plataforma, sync pendiente y retirar visita de disponibles; preparar salida idempotente para Make/HR sin ejecutarla todavía.
- HR→Plataforma: detectar asignación por `hrRowId/visitId`, shopper exacto y alcance tenant/proyecto; retirar de disponibles sin duplicar si ya venía de plataforma.
- Identidad mínima: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.
- Conflictos: revisión humana y trazabilidad; prohibido deduplicar por nombre o sobreescribir silenciosamente.
- HR/Make writes: bloqueados hasta gate posterior explícito.

Después: I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

No reabrir Auth, Shopper histórico, TARGET_B Admin, I1/I2/I3/I4-A/I4-B ni crear nueva candidata/rama/PR.

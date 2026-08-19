# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-PASS-I4C-FRONTIER-31`

## Estado formal
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. No hay subpesos formales I4-A..F.

## Frozen
I1/I2/I3/I4-A/I4-B; Historical Shopper; TARGET_B Admin; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. No se reprocesa ninguno.

## I4-B Retry2
Run `32305790197` cerró PASS el lifecycle provider-backed sintético. Decisión `PASS_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E__SYNTHETIC_VISIT_ONLY`. Se validaron ACKs, idempotencia, transiciones operativas, trazas receipt/audit y bloqueo de conflicto de versión. Datos reales quedaron invariantes.

El gate quedó consumido una sola vez y cerrado; no existe retry pendiente de I4-B.

## Antidesvío sostenible
Source truth continúa derivando epoch, frontera y progreso del Execution State. El carril I4-B ya no se toca. La secuencia sigue directamente a I4-C, sin nueva auditoría general ni reapertura de Auth/Shopper/HR histórico.

## I4-C — frontera activa
`I4C_HR_BIDIRECTIONAL_SYNC_READINESS_SOURCE_IMPLEMENTATION`.

La sincronización debe respetar:
- Plataforma→HR: `assignmentSource=platform`, estado pendiente hasta ACK/reflejo HR y retiro inmediato de disponibles.
- HR→Plataforma: detectar asignación por `hrRowId/visitId`, asignar shopper y retirar de disponibles sin duplicar si el origen ya era plataforma.
- Claves: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.
- Nunca deduplicar solo por nombre; discrepancias van a revisión humana con trazabilidad.

Este bloque I4-C inicia source-only. HR writes/Make/producción permanecen bloqueados hasta gate posterior explícito.

Frontend/Claude conserva el handoff vigente. Academia deberá incorporar el flujo real de sincronización solo cuando I4-C quede validado, no antes.

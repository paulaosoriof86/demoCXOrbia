# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

## Estado formal
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. No hay subpesos I4-A..F.

## Frozen
I1/I2/I3/I4-A/I4-B; Historical Shopper; TARGET_B Admin; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. No reprocesar.

## I4-C — fuente/contrato implementados
La sincronización de asignaciones se expresa con llaves estables `tenantId`, `projectId`, `visitId`, `hrRowId`, `shopperId`, más `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.

Plataforma→HR: la asignación originada en plataforma prepara `hrSync` para Make, queda `pending_hr` y solo pasa a `synced` cuando HR refleja exactamente la misma identidad/shopper. HR→Plataforma: una asignación HR exacta prepara `visit.assign` con origen `hr`, shopper validado y retiro de disponibles. Una asignación ya reflejada no se duplica.

Conflictos por scope, identidad estable, shopper distinto, reflection faltante o shopper HR inexistente pasan a revisión humana. Prohibido dedupe por nombre o overwrite silencioso.

El verifier source-only pasó 8 casos sin provider calls ni writes.

## Frontera exacta
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

La única brecha de I4-C ya no es lógica de sincronización sino binding externo live de Make/HR; no se encontró configuración autenticada en fuentes accesibles. Make/HR/provider writes y producción siguen bloqueados.

Frontend/Claude conserva el handoff; Academia debe enseñar estados pendiente/sincronizado/conflicto solo cuando I4-C complete provider-backed.

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`  
**Formal:** **60% completado / 40% pendiente**; I4 no tiene subpeso formal.

I1/I2/I3/I4-A/I4-B permanecen PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 permanecen preservados.

## I4-C — avance real
Se cerró la parte source/readiness de sincronización bidireccional sin writes. El lifecycle provider ya producía `assignmentSource=platform` y `assignmentSyncStatus=pending`; HR source-safe ya expone llaves `id/visitId + hrRowId + tenantId + projectId + shopperId`; el Make outbox existente ya soporta `hrSync` y gates.

Se agregó un reconciliador source-only que:
- Plataforma→HR prepara outbox idempotente y mantiene estado pendiente hasta ACK/reflexión.
- HR→Plataforma prepara `visit.assign`, retira de disponibles y exige shopper exacto existente.
- Una reflexión exacta no duplica.
- Identidad/shopper incompatible va a revisión humana; nombres no deduplican.

Verifier determinista: `PASS_I4C_HR_BIDIRECTIONAL_SYNC_SOURCE`, 8/8 casos PASS; providerCalls/HR writes/Make calls/platform writes = 0.

## Bloqueo externo comprobado
No existe en las fuentes accesibles un provider Make live, webhook/scenario ID ni binding autenticado de HR write. Repo contiene `make-outbox-adapter.preview.mjs` únicamente; búsquedas en repo, Gmail, Drive y contexto no recuperaron configuración live.

## Siguiente exacto
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No se activa Make ni HR. Evidencia: `app/docs/evidence/I4C-HR-BIDIRECTIONAL-SYNC-SOURCE-READINESS.json`.

# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

**Avance formal:** **60% completado / 40% pendiente**.

## Preservado
I1/I2/I3/I4-A/I4-B PASS/frozen, HR `15 periodos / 660 visitas`, Historical Shopper frozen, TARGET_B Admin no recrear, Finance V2/historical y legal v0.4. Sin frontend P0 nuevo.

## I4-C — archivos nuevos
- `backend/contracts/hr-bidirectional-assignment-sync-v1.json`: contrato reusable multi-tenant/multi-proyecto.
- `backend/adapters/hr-bidirectional-sync-adapter.preview.mjs`: reconciliador puro, sin provider calls.
- `tools/verify-cxorbia-i4c-hr-bidirectional-source.mjs`: 8 casos deterministas.
- `app/docs/evidence/I4C-HR-BIDIRECTIONAL-SYNC-SOURCE-READINESS.json`: evidencia source-only.

## Trabajo previo reutilizado
- lifecycle provider I4-B ya registra origen/estado pendiente al asignar desde plataforma;
- HR source-safe ya expone llaves estables `id/hrRowId/tenantId/projectId/shopperId`;
- Make outbox preview ya soporta canal `hrSync`, dedupe y gates apagados.

## Resultado
Plataforma→HR prepara outbox idempotente; HR→Plataforma prepara `visit.assign`; HR reflection exacta no duplica; shopper/identidad incompatible bloquea y deriva a revisión; nombres nunca deduplican. Verifier: `PASS_I4C_HR_BIDIRECTIONAL_SYNC_SOURCE`, 8/8 PASS, 0 writes/calls reales.

## Bloqueo externo comprobado
No se encontró provider Make live, webhook/scenario ID ni binding autenticado en repo/Gmail/Drive/contexto. No se inventa ni se sustituye por otro proveedor.

## Frontera
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

## Clasificación
- Reusable CXOrbia: reconciliación por identidad estable, outbox idempotente, source/status de sync y conflict review.
- Exclusivo TyA: HR Cinépolis y autoridad 15/660.
- Claude/prototipo: copy/estado futuro debe diferenciar pendiente, sincronizado y conflicto; no UI patch backend.
- Academia: documentar flujo bidireccional solo como source-ready hasta provider-backed PASS.
- Sin impacto Claude: verifier, contrato y evidencia interna.

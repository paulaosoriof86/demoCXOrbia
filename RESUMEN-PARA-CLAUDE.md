# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

## Validado/preservado
I1/I2/I3/I4-A/I4-B PASS/frozen. HR `15 periodos / 660 visitas`, Historical Shopper, TARGET_B Admin, Finance V2/historical y legal v0.4 no se reprocesan. Progreso formal: **60% completado / 40% pendiente**.

## I4-C backend source-ready
Contrato/adapter/verifier bidireccional ya existen. El patrón reusable es:
- identidad: `tenantId + projectId + visitId + hrRowId + shopperId`;
- estado: `assignmentSource + assignmentSyncStatus + lastSyncedAt`;
- Plataforma→HR queda pendiente hasta reflection/ACK;
- HR→Plataforma asigna por shopper exacto y retira de disponibles;
- reflection exacta no duplica;
- conflictos visibles/revisables, nunca overwrite silencioso ni dedupe por nombre.

Verifier source-only 8/8 PASS; Make/HR/provider writes = 0.

## Frontend / Claude
No parchear desde backend. Cuando llegue el handoff funcional, los estados visuales deben ser honestos: `pendiente de sincronización`, `sincronizado`, `conflicto/revisión`; nunca mostrar HR sincronizada antes de ACK/provider-backed. Cinépolis sigue proyecto configurable, no lógica global.

## Academia
Preparar contenido por rol sobre origen de asignación, estado de sync, conflictos y revisión humana, pero no enseñar Make/HR live como operativo hasta cerrar I4-C provider-backed.

## Siguiente
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No se encontró configuración live Make/HR en fuentes accesibles; no inventarla ni pedir webhook/secreto en texto plano.

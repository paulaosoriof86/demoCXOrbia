# SOURCE LOCK CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Progreso formal canónico
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. Sin subpesos I4-A..F.

## Frozen / preservado
I1/I2/I3/I4-A/I4-B; Historical Shopper; TARGET_B Admin; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. No reprocesar.

## I4-C — fuente lista
Contrato `backend/contracts/hr-bidirectional-assignment-sync-v1.json`, adapter `backend/adapters/hr-bidirectional-sync-adapter.preview.mjs` y verifier `tools/verify-cxorbia-i4c-hr-bidirectional-source.mjs` quedan como fuente canónica para asignaciones HR↔plataforma.

Reglas: `tenantId + projectId + visitId + hrRowId + shopperId`; `assignmentSource`; `assignmentSyncStatus`; `lastSyncedAt`; no dedupe por nombre; no sobrescritura silenciosa; shopper HR inexistente en plataforma = conflicto; reflexión exacta de una asignación originada en plataforma = no duplicar.

El outbox Make existente se reutiliza y continúa no conectado. Verifier source-only PASS con 8 casos y 0 writes/calls reales.

## Frontera exacta
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No existe binding live verificable de Make/HR en las fuentes accesibles. Hasta resolverlo permanecen bloqueados Make, HR writes, provider writes y producción.

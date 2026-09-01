# CAMBIOS BACKEND — ADDENDUM C6 AUTH V4 ACTIVATION PASS + SMOKE STOP

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_PRODUCTION`

## Archivos creados

- `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v4.mjs` — wrapper source-only corregido para `Config.signIn.hashConfig`.
- `tools/qa/cxorbia-c6-auth-hashconfig-readiness-v2.mjs` — readiness read-only de permiso/material hashConfig.
- `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — request one-shot, luego consumido/deshabilitado.
- `app/docs/evidence/C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.json`.
- `app/docs/SOURCE-LOCK-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.md`.

## Workflows temporales creados y retirados

- `cxorbia-c6-auth-hashconfig-syntax-rootfix-source-gate-v1.yml` — ejecutó gate offline PASS y fue retirado.
- `cxorbia-c6-auth-hashconfig-readiness-v2.yml` — ejecutó readiness read-only PASS y fue retirado.
- `cxorbia-c6-auth-plan-v4-activation-dev-v3-once.yml` — ejecutó un único PREWRITE/Activation DEV y fue retirado.

No quedó autorización latente.

## Resultado técnico

```text
sourceRootfix=PASS
hashConfigPermissionReadiness=PASS
providerPrewriteAttempts=1
prewrite=PASS
AuthActivationDEV=PASS
AuthUsersBefore=110
AuthCreates=118
AuthUpdates=9
duplicateDisables=1
AuthUsersAfter=228
readback=PASS
passwordHashRestoreEntries=8
snapshotEncryptedRoundtrip=PASS
rollbackDryRun=PASS
realRollbackExecuted=false
secondProviderAttempt=false
```

El freeze v4 permaneció exactamente en 340 filas y digest `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`.

## STOP posterior

El smoke acumulativo falló antes de leer Auth por lifecycle del archivo temporal de credencial:

```text
classification=POSTWRITE_SMOKE_HARNESS_CREDENTIAL_PATH_MISSING
error=ENOENT credentials.json
smokeProviderReads=0
```

No es evidencia de fallo de Auth/roles. Por la regla `STOP_RETRY`, no se repitió el smoke.

## Seguridad

```text
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
HostingDeploys=0
CloudRunDeploys=0
IAMWrites=0
Make=0
Gemini=0
payments=0
merge=false
production=false
rawPIIExported=false
```

## Clasificación obligatoria

- **Reusable CXOrbia:** separación offline/readiness/activation, snapshot cifrado previo a writes, one-shot y credential lifecycle explícito para smoke post-activación.
- **Exclusivo cliente:** plan TyA/Cinépolis v4 y estado Auth DEV 228.
- **Claude/prototipo:** cero cambios frontend; registrar que Auth DEV está activo y smoke multirol pendiente.
- **Academia:** incorporar troubleshooting por capas y diferencia entre activación PASS y harness de smoke STOP.
- **Sin impacto Claude:** cifrado rollback, hashConfig readiness, fail-close y status one-shot.

## Siguiente cambio autorizado pendiente

Ninguno. Requiere nueva autorización para corregir solo el lifecycle de credencial y ejecutar un único smoke acumulativo read-only, sin PREWRITE ni Auth writes.

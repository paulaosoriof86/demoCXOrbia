# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.md`;
- evidencia terminal: `app/docs/evidence/C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.json`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- request v3: consumido/deshabilitado;
- allowedExecutions: 0;
- workflows temporales de source gate/readiness/activation: retirados;
- producción: intacta;
- Auth DEV ejecutado: sí;
- write boundary alcanzado: sí;
- rollback real ejecutado: no.

## 2. Identidad cerrada — no reabrir

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessRetired=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
targetLineage(ac93)=closed
updateUniversePlanV3=closed
```

No reconstruir identidad, no regenerar plan y no repetir PREWRITE por el fallo posterior del smoke.

## 3. Freeze v4 rector

```text
rows=340
uniqueRows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=2
passwordChanges=8
claimsChanges=1
expectedAuthUsersBefore=110
expectedAuthUsersAfter=228
rowsDigest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

## 4. HashConfig rootfix y readiness

Harness source-only:

```text
sourceGateCommit=893cac95b8b3b37039d1644de3c2412c5a97b763
sourceGateRunId=31422977255
decision=PASS_C6_AUTH_V4_HASHCONFIG_SYNTAX_ROOTFIX_OFFLINE_ZERO_WRITES
```

Readiness read-only:

```text
runId=31423058271
jobId=93568185004
artifactId=9076091180
artifactDigest=sha256:42683577206460058a2d780de39e2a67e1979d6f1f19c36d37c0b285e5f5d7c3
principalFp=ab70b5da53a2d545a74c
firebaseauth.configs.getHashConfig=true
hashConfigPresent=true
algorithmClass=SCRYPT
providerReads=2
IAMWrites=0
AuthWrites=0
decision=PASS_C6_AUTH_HASHCONFIG_PERMISSION_AND_MATERIAL_READINESS
```

## 5. PREWRITE + Activation Auth DEV — PASS

```text
requestId=c6-auth-plan-v4-activation-dev-20260810-03
requestCommit=1f32ff486d2bc4d31493401f8e156fb61f49c5a9
runId=31423272374
jobId=93568868141
artifactId=9076197092
artifactDigest=sha256:2dc787b14e009cb10358f4a6734fe0712f794df00387ae69a401922450e45af5
providerPrewriteAttempts=1
secondProviderAttempt=false
```

PREWRITE:

```text
pass=true
authUsersBefore=110
shopperProfiles=340
targetRowsClassified=127
createRows=118
updateRows=9
passwordMaterialInspectedRows=8
hashConfigReadable=true
passwordRollbackModes.providerExact=5
passwordRollbackModes.legacySaltlessExact=3
mutableExistingSnapshotUsers=10
snapshotPasswordEntries=8
snapshotRoundtripVerified=true
duplicatePairExact=true
```

Activation/readback:

```text
decision=PASS_C6_AUTH_PLAN_V4_ACTIVATION_DEV
AuthExecuted=true
writeBoundaryEntered=true
AuthCreates=118
AuthUpdates=9
duplicateDisables=1
providerWriteCalls=247
readbackPass=true
AuthUsersAfter=228
createdValidated=118
updatesValidated=9
changedPasswordSignInsValidated=8
keeperActive=true
duplicateDisabled=true
noCrossRowPrincipalAlias=true
noUnexpectedTargetCollision=true
```

Rollback dry-run:

```text
pass=true
realRollbackExecuted=false
deleteCreatedCount=118
restoreExistingUserCount=10
passwordHashRestoreEntries=8
providerHashConfigPresent=true
encryptedPayloadsDecryptAndDigestVerify=true
```

El one-shot/idempotency guard quedó consumido. No se efectuó segunda activación.

## 6. Smoke acumulativo — STOP_RETRY por lifecycle de credencial

El smoke posterior a Auth PASS falló antes de su primera lectura Auth:

```text
classification=POSTWRITE_SMOKE_HARNESS_CREDENTIAL_PATH_MISSING
errorCode=ENOENT
missingPath=.tmp/c6-auth-plan-v4-v3/private/credentials.json
smokeProviderReads=0
AdminOperacionesValidated=false
ShopperValidated=false
ClienteValidated=false
```

Causa: el ejecutor de activación eliminó su directorio privado temporal al finalizar; el paso de smoke intentó reutilizar la misma ruta `GOOGLE_APPLICATION_CREDENTIALS` ya inexistente.

Este STOP no invalida PREWRITE, Activation, readback ni rollback dry-run. Tampoco demuestra una regresión de roles o frontend. Por autorización, no hubo segundo smoke/provider attempt.

## 7. Fail-close

```text
requestV3=consumed/disabled
allowedExecutions=0
activationWorkflow=removed
sourceGateWorkflow=removed
readinessWorkflow=removed
secondProviderAttempt=false
realRollbackExecuted=false
FirestoreWrites=0
membershipWrites=0
HRWrites=0
visitsWrites=0
certificationsWrites=0
liquidationsWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
rawPIIExported=false
```

## 8. Documentación acumulativa

- `app/docs/SOURCE-LOCK-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.md`;
- `app/docs/evidence/C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.json`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-STOP-20260810.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-STOP-20260810.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-STOP-20260810.md`;
- `app/docs/ACADEMIA-ADDENDUM-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-STOP-20260810.md`;
- `app/docs/PHASE-A-TRACKER-ADDENDUM-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-STOP-20260810.md`;
- `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — consumido/deshabilitado.

## 9. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 SMOKE READ-ONLY CREDENTIAL LIFECYCLE ROOTFIX -> SINGLE ACCUMULATIVE MULTIROLE SMOKE`

Debe corregir source-only exclusivamente el ciclo de vida de la credencial del smoke y ejecutar un único smoke read-only sobre los **228 usuarios Auth DEV ya activados**. Debe validar Admin/Operaciones, Shopper y Cliente, claims/scopes, `tenantId/projectId`, aislamiento de rol y cero PII.

Prohibido en ese bloque: PREWRITE, Auth create/update/disable, IAM writes, reconstrucción de identidad, deploy, merge o producción.

Ante cualquier fallo: `STOP_RETRY` sin segundo smoke provider.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 11. Cierre de bloque

- **Qué se hizo:** se cerraron source rootfix, permission/material readiness, PREWRITE y Activation Auth DEV con readback/rollback dry-run PASS.
- **Avance Phase A:** Auth deja de ser preparación y queda materializado en DEV con 228 usuarios.
- **Qué se preservó:** freeze v4, identidad cerrada y todos los módulos Phase A fuera de Auth.
- **Claude/Academia:** sin parche frontend; se documentó el nuevo estado Auth y el troubleshooting por capas.
- **Pendiente real:** solo el smoke acumulativo multirol, bloqueado por lifecycle del harness, no por Auth.
- **Siguiente bloque:** rootfix source-only del smoke + una ejecución read-only.
- **Estado seguro:** sin producción/merge/deploy adicional ni writes fuera del Auth expresamente autorizado.
- **Bloqueo comprobado:** `ENOENT` de credencial temporal post-activación antes de cualquier lectura de smoke.

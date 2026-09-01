# SOURCE LOCK — C6 AUTH V4 ACTIVATION DEV PASS + SMOKE CREDENTIAL LIFECYCLE STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Freeze rector preservado

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
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No reabrir plan v3, SKIP13, multi-Auth, lineage `ac93...`, universo de identidad ni freeze v4.

## 2. Harness `Config.signIn.hashConfig` — PASS source-only

Se creó `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v4.mjs` para corregir exclusivamente:

```text
GET .../config?mask=hashConfig -> GET .../config
body.hashConfig|body.hash_config -> body.signIn.hashConfig
```

El gate offline verificó `node --check`, self-test, sustitución exacta, digest/freeze, circuit breaker y cero Auth writes antes del write boundary.

```text
sourceGateCommit=893cac95b8b3b37039d1644de3c2412c5a97b763
sourceGateRunId=31422977255
decision=PASS_C6_AUTH_V4_HASHCONFIG_SYNTAX_ROOTFIX_OFFLINE_ZERO_WRITES
```

## 3. Readiness hashConfig — PASS read-only

Solo después del PASS source-only se ejecutó la lectura de readiness con la identidad exacta de PREWRITE.

```text
runId=31423058271
jobId=93568185004
artifactId=9076091180
artifactDigest=sha256:42683577206460058a2d780de39e2a67e1979d6f1f19c36d37c0b285e5f5d7c3
principalFp=ab70b5da53a2d545a74c
permission=firebaseauth.configs.getHashConfig
permissionGranted=true
hashConfigPresent=true
algorithmClass=SCRYPT
fieldCount=5
providerReads=2
iamWrites=0
authWrites=0
decision=PASS_C6_AUTH_HASHCONFIG_PERMISSION_AND_MATERIAL_READINESS
```

No se exportó principal ni hashConfig crudo.

## 4. Request PREWRITE/Activation único

Solo con readiness PASS se emitió:

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

El one-shot claim, source gate, self-test, circuit breaker, plan artifact/digest y principal exacto pasaron antes del PREWRITE.

## 5. PREWRITE — PASS

```text
prewritePass=true
authUsersBefore=110
shopperProfiles=340
targetRowsClassified=127
createRows=118
updateRows=9
passwordChanges=8
passwordMaterialInspectedRows=8
hashConfigReadable=true
rollbackModeProviderExact=5
rollbackModeLegacySaltlessExact=3
mutableExistingSnapshotUsers=10
snapshotPasswordEntries=8
snapshotRoundtripVerified=true
duplicatePairExact=true
```

El snapshot cifrado fue creado y validado roundtrip antes de cruzar el write boundary.

## 6. Auth DEV — PASS ejecutado

El write boundary se cruzó únicamente después del PREWRITE PASS.

```text
decision=PASS_C6_AUTH_PLAN_V4_ACTIVATION_DEV
writeBoundaryEntered=true
authCreates=118
authUpdates=9
duplicateDisables=1
providerWriteCalls=247
```

Readback:

```text
readbackPass=true
authUsersAfter=228
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
rollbackDryRunPass=true
realRollbackExecuted=false
deleteCreatedCount=118
restoreExistingUserCount=10
passwordHashRestoreEntries=8
providerHashConfigPresent=true
encryptedPayloadsDecryptAndDigestVerify=true
```

La protección one-shot/idempotency permaneció activa. No se realizó una segunda activación.

## 7. Smoke acumulativo — STOP_RETRY del harness, no de Auth

El smoke posterior estaba condicionado a `PASS_C6_AUTH_PLAN_V4_ACTIVATION_DEV` y sí inició. Falló antes de su primera lectura Auth porque intentó reutilizar la ruta temporal `GOOGLE_APPLICATION_CREDENTIALS` después de que el ejecutor de activación ya había limpiado su directorio privado.

```text
classification=POSTWRITE_SMOKE_HARNESS_CREDENTIAL_PATH_MISSING
errorCode=ENOENT
smokeProviderReads=0
adminOpsValidated=false
shopperValidated=false
clientValidated=false
```

Por tanto, el fallo NO demuestra problema de roles, claims, tenant/project, shoppers, cliente ni Auth. No se hizo segundo smoke/provider attempt porque la autorización exigía `STOP_RETRY` ante cualquier fallo.

## 8. Fail-close

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
```

Auth DEV queda en el estado validado de 228 usuarios. No repetir PREWRITE ni Activation DEV por este STOP del smoke.

## 9. Próximo bloque exacto

Solo con nueva autorización:

`C6 SMOKE READ-ONLY CREDENTIAL LIFECYCLE ROOTFIX -> SINGLE ACCUMULATIVE MULTIROLE SMOKE`

Debe corregir source-only únicamente el ciclo de vida de credencial del smoke y después ejecutar un solo smoke **read-only** sobre el estado Auth DEV ya activado. No debe reejecutar PREWRITE, Auth writes ni reconstrucción de identidad.

El smoke debe validar Admin/Operaciones, Shopper y Cliente, población Auth=228, claims/scopes, `tenantId/projectId`, aislamiento de roles y ausencia de PII. Ante fallo: `STOP_RETRY` sin segundo smoke provider.

## 10. Clasificación

- **Reusable CXOrbia:** gate offline antes de provider, readiness separada, one-shot, snapshot cifrado previo al write boundary, y lifecycle explícito de credencial entre activación y smoke.
- **Exclusivo cliente:** freeze TyA/Cinépolis v4 y población Auth DEV de 228 usuarios.
- **Claude/prototipo:** sin cambio frontend; Auth DEV queda activo y el smoke acumulativo de superficies por rol sigue pendiente.
- **Academia:** documentar diferencia entre `Auth Activation PASS` y fallo del harness de smoke; troubleshooting por capa y rollback verificable.
- **Sin impacto Claude:** hashConfig readiness, cifrado de rollback, status one-shot y fail-close interno.

## 11. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados. Producción continúa intacta.

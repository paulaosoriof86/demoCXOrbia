# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze rector, sin cambios;
5. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — consumido/deshabilitado;
6. `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v4.mjs` — rootfix fuente actual, no volver a ejecutar Activation sin nueva autorización expresa;
7. `tools/qa/cxorbia-c6-auth-hashconfig-readiness-v2.mjs` — readiness read-only histórico del bloque;
8. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
9. `app/docs/SOURCE-LOCK-C6-AUTH-HASHCONFIG-READINESS-PREPROVIDER-SYNTAX-STOP-RETRY-20260810.md` — histórico inmediato;
10. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md` — histórico;
11. `app/docs/SOURCE-LOCK-C6-AUTH-UPDATE-UNIVERSE-BATCH-PLAN-V4-PASS-20260807.md` — histórico que congeló v4;
12. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md` — identidad cerrada;
13. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
14. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
15. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
16. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=true
AuthUsersAfter=228
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage(ac93)=closed
UpdateUniverseBatch=closed PASS
HashConfigSyntaxRootfix=PASS_SOURCE_ONLY
HashConfigPermissionReadiness=PASS_READ_ONLY
PlanV4Prewrite=PASS
AuthActivationDEV=PASS
Readback=PASS
RollbackDryRun=PASS
RealRollbackExecuted=false
CurrentBlock=STOP_RETRY_POSTWRITE_SMOKE_CREDENTIAL_LIFECYCLE
SmokeProviderReads=0
SecondProviderAttempt=false
RequestV3=consumed/disabled
```

## 3. Plan v4 congelado e inmutable

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

No reabrir plan v3, SKIP13, multi-Auth, lineage `ac93...` ni reconstrucción de identidad.

## 4. Auth DEV terminal

```text
readinessRunId=31423058271
readinessDecision=PASS_C6_AUTH_HASHCONFIG_PERMISSION_AND_MATERIAL_READINESS
requestId=c6-auth-plan-v4-activation-dev-20260810-03
requestCommit=1f32ff486d2bc4d31493401f8e156fb61f49c5a9
activationRunId=31423272374
activationJobId=93568868141
activationArtifactId=9076197092
activationArtifactDigest=sha256:2dc787b14e009cb10358f4a6734fe0712f794df00387ae69a401922450e45af5
providerPrewriteAttempts=1
prewritePass=true
snapshotPasswordEntries=8
snapshotRoundtripVerified=true
writeBoundaryEntered=true
AuthCreates=118
AuthUpdates=9
duplicateDisables=1
readbackPass=true
AuthUsersAfter=228
rollbackDryRunPass=true
passwordHashRestoreEntries=8
secondProviderAttempt=false
```

## 5. Bloqueo vivo

El smoke multirol posterior a la activación falló antes de leer Auth porque la ruta efímera de `GOOGLE_APPLICATION_CREDENTIALS` ya había sido eliminada por el lifecycle del ejecutor:

```text
classification=POSTWRITE_SMOKE_HARNESS_CREDENTIAL_PATH_MISSING
errorCode=ENOENT
smokeProviderReads=0
AdminOperacionesValidated=false
ShopperValidated=false
ClienteValidated=false
```

No es un fallo demostrado de Auth, claims, roles, tenant/proyecto o frontend. Auth DEV permanece en el readback validado de 228 usuarios.

## 6. Fail-close

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

## 7. Siguiente acción exacta

Solo bajo autorización nueva:

`C6 SMOKE READ-ONLY CREDENTIAL LIFECYCLE ROOTFIX -> SINGLE ACCUMULATIVE MULTIROLE SMOKE`.

Debe corregir source-only solo el lifecycle de credencial y después ejecutar un único smoke read-only sobre los 228 usuarios actuales. No se permite reejecutar PREWRITE ni Auth writes. Validar Admin/Operaciones, Shopper y Cliente, claims/scopes, tenant/project isolation y cero PII.

Ante fallo: `STOP_RETRY` sin segundo smoke provider.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

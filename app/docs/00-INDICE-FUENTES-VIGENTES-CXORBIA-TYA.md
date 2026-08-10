# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_EMPTY__GET_SHAPE_REPAIR_PASS__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze rector actual, sin cambios;
5. `backend/config/c6-auth-plan-v4-activation-dev-request-v2.json` — consumido/deshabilitado;
6. `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v2.mjs` — wrapper source-only actual, no ejecutable sin request nuevo;
7. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
8. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.md` — histórico inmediato;
9. `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.json`;
10. `app/docs/SOURCE-LOCK-C6-AUTH-UPDATE-UNIVERSE-BATCH-PLAN-V4-PASS-20260807.md` — histórico que congeló v4;
11. `app/docs/evidence/C6-AUTH-UPDATE-UNIVERSE-BATCH-REVALIDATION-PLAN-V4-PASS-20260807.json`;
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
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage(ac93)=closed
UpdateUniverseBatch=closed PASS
HashConfigGetShapeRepair=PASS_SOURCE_ONLY
PlanV4Prewrite=STOP_RETRY_HASH_CONFIG_EMPTY
ProviderAttemptsCurrentBlock=1
SecondProviderAttempt=false
WriteBoundaryEntered=false
AuthWritesCurrentBlock=0
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

## 4. Reparación source-only y PREWRITE terminal

Reparación de forma GET:

```text
sourceRepairHead=c6d4fdb83303a0293b1c6adce375b522d0c29db8
sourceRepairRunId=31402335372
decision=PASS_C6_HASH_CONFIG_SOURCE_REPAIR_STATIC_ZERO_WRITES
```

Único PREWRITE autorizado:

```text
requestId=c6-auth-plan-v4-activation-dev-20260810-02
requestCommit=f0f655608f6fe53a976096f53d64e9c95670ec64
runId=31402395938
jobId=93500386091
artifactId=9068194459
artifactDigest=sha256:a469cf5d2d6607e8a205af52cbef78042a814886d7be5229480cfadce05013a9
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_EMPTY
errorFingerprint=e9514406bb62df47b26382a9
providerAttempts=1
secondProviderAttempt=false
prewritePass=false
writeBoundaryEntered=false
snapshotProduced=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
runtimeSmokeExecuted=false
```

## 5. Diagnóstico vigente

El HTTP 400 por `?mask=hashConfig` quedó superado. El siguiente defecto está en la extracción de respuesta: el ejecutor busca `body.hashConfig || body.hash_config`, mientras el esquema oficial `Config` ubica `hashConfig` bajo `signIn.hashConfig`.

Antes de un nuevo provider PREWRITE también debe comprobarse read-only/source-only la disponibilidad del permiso `firebaseauth.configs.getHashConfig` del principal exacto. No se realizó segundo provider attempt.

## 6. Fail-close

```text
request=consumed/disabled
allowedExecutions=0
oneShotWorkflow=removed
sourceRepairWorkflow=removed
providerAttempts=1
secondProviderAttempt=false
AuthExecuted=false
AuthWrites=0
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

`C6 AUTH V4 HASH CONFIG RESPONSE PATH + PERMISSION READINESS SOURCE-ONLY → SINGLE PREWRITE RETRY`.

Debe corregir únicamente la ruta de extracción al esquema `Config.signIn.hashConfig`, verificar read-only el permiso/disponibilidad de hash config del principal exacto, mantener freeze/digest v4 y permitir como máximo un PREWRITE nuevo. Solo con PREWRITE PASS, exactamente 8 rollback entries y snapshot cifrado roundtrip se cruza el Auth write boundary; después readback, idempotencia, rollback dry-run y smoke acumulativo Admin/Operaciones, Shopper y Cliente.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

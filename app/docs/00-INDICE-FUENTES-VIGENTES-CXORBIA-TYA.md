# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINAL_PLAN_340_HOLD0_MATERIALIZED__AUTH_ACTIVATION_PREWRITE_STOP_RETRY_PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-ACTIVATION-DEV-PREWRITE-PASSWORD-ROLLBACK-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v2.json`;
5. `backend/contracts/c6-auth-activation-dev-v1.json`;
6. `tools/qa/cxorbia-c6-auth-activation-dev.mjs`;
7. `backend/config/c6-auth-activation-dev-request-v1.json` — consumido/deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
9. `app/docs/evidence/C6-MULTI-AUTH-FINAL-DISCRIMINATOR-READONLY-STOP-RETRY-20260807.json`;
10. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
11. `app/docs/SOURCE-LOCK-C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.md`;
12. `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json`;
13. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
14. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
15. `backend/config/c6-shopper-auth-final-freeze-v1.json` — freeze anterior preservado como lineage;
16. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
17. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. Identidad Shopper cerrada en plan

SKIP13 quedó resuelto 13/13. Siete perfiles con Auth efectivo único se preservan. Para el único par multi-Auth simétrico, la adjudicación final del tenant es:

```text
profileFingerprint=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

No se atribuye superioridad técnica al keeper.

## 4. Plan Auth final materializado

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

Lineage:

```text
sourceRun=31104541809
sourceArtifact=8968941587
sourceArtifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
sourcePlanDigest=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
priorFreezeDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

## 5. Auth Activation DEV — PREWRITE STOP_RETRY

```text
requestId=c6-auth-activation-dev-20260807-01
requestCommit=b1be563ca9cc3b4931f380277a655f5e07c92ab3
runId=31213274602
jobId=92980855907
artifactId=9007517428
artifactDigest=sha256:cc0c5b60cb066930d6d1e55a3eb23fcf6ed3e99f98c14500a1901969ba7b25ee
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
```

El perfil bloqueante es `UPDATE_AUTH` con `email/password/claims=true`. Al menos uno de los 14 password changes no expuso hash+salt suficientes para cumplir el rollback completo exigido por la autorización.

El fail-close ocurrió antes del write boundary:

```text
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```

## 6. Fail-close

```text
requestConsumeCommit=7930d3835a55dd92f3c48f1f7588aea4d332833d
workflowRemovalCommit=2f23b7cb129b745ed2367aa3da9f456eb5ceff2e
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondProviderAttempt=0
```

## 7. Pendiente real

1. Root fix **source-only** de reversibilidad del password para `ac93d90d9e41512acdcd`, sin repetir provider.
2. Solo con PASS source-only, crear una autorización/request provider nuevo para PREWRITE + Auth activation.
3. Readback integral y rollback dry-run.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

No repetir el request consumido ni degradar el requisito de rollback completo sin nueva autorización expresa.

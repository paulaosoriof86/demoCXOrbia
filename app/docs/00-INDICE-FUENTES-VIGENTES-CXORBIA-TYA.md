# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKED_PASS__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-REVIEWER-REVOKED-PASS-20260807.md`;
3. `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
4. `app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md`;
5. `backend/config/c6-iam-reviewer-revoke-readback-request-v1.json` — consumido y deshabilitado;
6. `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-PASS-PENDING-REVIEWER-REVOKE-20260807.md`;
7. `backend/config/c6-iam-runtime-isolation-readonly-final-request-v2.json` — consumido y deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-IAM-VISIBILITY-NO-EXECUTION-LANE-STOP-RETRY-20260806.md`;
9. `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`;
10. `backend/contracts/c6-runtime-identity-postcreate-verification-v1.json`;
11. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
12. `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
13. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
14. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
15. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
16. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
17. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
18. `backend/contracts/c6-execution-control-plane-v2.json`;
19. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
20. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
21. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
22. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
23. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
24. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Identidad runtime — PASS final de aislamiento

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
decision=PASS_ISOLATED_RUNTIME_IDENTITY
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=FINAL_ISOLATED_IDENTITY
```

## 3. Rol temporal — revocación PASS

El rol temporal `roles/iam.securityReviewer` se agregó únicamente a la identidad de control-plane `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` para completar los readbacks IAM. Nunca fue un rol de la identidad runtime.

Paula lo retiró manualmente y el readback terminal confirmó:

```text
requestId=c6-iam-reviewer-revoke-readback-20260807-01
sourceLock=7b57957a297beb0505337c007ee89e6a02fba057
runId=31184231219
jobId=92884658675
artifactId=8996049168
artifactDigest=sha256:574dd060914cf69046d266f63a0eacb49f64919c9271898d9166eee3dc9b61bc
decision=PASS_TEMP_SECURITY_REVIEWER_EFFECTIVELY_REVOKED
effectiveSensitiveIamPermissions=[]
projectGetIamPolicyReturnCode=1
serviceAccountGetIamPolicyReturnCode=1
userManagedKeysListReturnCode=1
temporaryReviewerEffective=false
```

## 4. Root-fix del carril de ejecución

El patrón vigente para workflows C6 one-shot nuevos es instalar primero el workflow y dispararlo después mediante `pull_request:edited`, manteniendo `PR_HEAD_SHA=github.event.pull_request.head.sha`. Este patrón ya materializó y pasó tanto la verificación final de aislamiento como el readback de revocación.

## 5. Fail-close

```text
reviewerReadbackWorkflowRemovalCommit=9f75e76b3ac22165ab8503e0ab08d88c9f8945b7
reviewerReadbackRequestDisableCommit=1d6cb4bdc549e9d2a2b385a7602a408cd1ebdfe6
workflowPresent=false
requestExecutable=false
allowedExecutions=0
```

## 6. Direct runner, SKIP13 y Auth

```text
directRunnerSource=READY
directRunnerDeploy=NOT_EXECUTED
providerBoundaryEnabled=false
```

```text
SKIP13 profiles=13
adjudicationCompleted=false
providerReadConsumptionPreviousRequests=UNKNOWN
```

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
```

Auth no ha sido ejecutado.

## 7. Pendiente real

1. Autorizar un nuevo deploy DEV único del direct trusted runner.
2. Completar SKIP13 read-only.
3. Ejecutar Auth conforme al plan congelado y snapshot/rollback.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada a producción.

## 8. Estado seguro

```text
provider data reads=0
provider writes=0
IAM writes by readback=0
Cloud Build writes=0
Cloud Run deploys=0
Hosting deploys=0
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
SKIP13 executed=false
merge=false
production=false
requestExecutable=false
```

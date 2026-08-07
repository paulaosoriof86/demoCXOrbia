# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKE_PENDING__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-PASS-PENDING-REVIEWER-REVOKE-20260807.md`;
3. `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
4. `app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md`;
5. `backend/config/c6-iam-runtime-isolation-readonly-final-request-v2.json` — consumido y deshabilitado;
6. `app/docs/SOURCE-LOCK-C6-IAM-VISIBILITY-NO-EXECUTION-LANE-STOP-RETRY-20260806.md`;
7. `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`;
8. `backend/contracts/c6-runtime-identity-postcreate-verification-v1.json`;
9. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
10. `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
11. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
12. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
13. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
14. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
15. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
16. `backend/contracts/c6-execution-control-plane-v2.json`;
17. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
18. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
19. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
20. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
21. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
22. `AGENTS.md`, PR #7 y HEAD vivo.

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
```

```text
decision=PASS_ISOLATED_RUNTIME_IDENTITY
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=FINAL_ISOLATED_IDENTITY
```

Evidencia:

```text
requestId=c6-iam-runtime-isolation-readonly-final-20260807-01
sourceLock=a7357d4b0a80b164560423a673a6430e5a16b2d7
runId=31180615131
jobId=92872746963
artifactId=8994613975
artifactDigest=sha256:b4ff0ffe54dca09f07264109eb327c71d84be6e4256b058a364cd494d6348e9c
```

## 3. Rol temporal pendiente de retiro

Durante la verificación se comprobó exactamente un binding:

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
role=roles/iam.securityReviewer
temporaryReviewerBindingCount=1
```

Debe retirarse y probarse su ausencia antes de cualquier nuevo provider write o deploy.

## 4. Root-fix del carril de ejecución

El workflow IAM VISIBILITY anterior no materializó run usando el carril de `pull_request:synchronize`. El verificador final se instaló primero y se disparó después mediante `pull_request:edited`, conservando:

```text
PR_HEAD_SHA=github.event.pull_request.head.sha
```

El run `31180615131` materializó y terminó PASS. El problema de activación quedó aislado al carril one-shot previo; no era un problema del source lock ni de Google Cloud.

## 5. Fail-close del verificador final

```text
workflowRemovalCommit=e76588a21bace175776c6878ce6b27301f6b7d70
requestDisableCommit=ce05006345fa4f3af0dfafd566edd0516ab639ff
workflowPresent=false
requestEnabled=false
requestConsumed=true
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

1. Retirar `roles/iam.securityReviewer` del principal Firebase Admin SDK y probar la revocación.
2. Autorizar un nuevo deploy DEV único del direct trusted runner.
3. Completar SKIP13 read-only.
4. Ejecutar Auth conforme al plan congelado y snapshot/rollback.
5. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
6. Validación humana.
7. Cutover/promoción autorizada a producción.

## 8. Estado seguro

```text
provider data reads=0
provider writes=0
IAM writes by verifier=0
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

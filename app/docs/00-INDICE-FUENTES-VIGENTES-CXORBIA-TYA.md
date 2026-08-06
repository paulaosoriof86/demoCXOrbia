# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_SOURCE_GATE_PASS__IAM_CREATE_DENIED__ZERO_DEPLOY__STOP_RETRY__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
3. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
4. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json` — deshabilitado y consumido;
5. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
6. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
7. `backend/contracts/c6-execution-control-plane-v2.json`;
8. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-DEPLOY-STOP-RETRY-20260806.md`;
9. `app/docs/SOURCE-LOCK-C6-GITHUB-ACTIONS-OUTAGE-ROOT-CAUSE-AND-FAILOVER-20260806.md`;
10. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
11. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
12. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
13. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
14. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
15. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
16. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
17. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
18. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
19. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
20. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
21. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
22. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Carril directo fuente y source lock

```text
lane=direct_trusted_runner
sourceStatus=READY
sourceGate=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
environment=DEV
service=cxorbia-c6-direct-runner-dev
authentication=Cloud Run IAM/OIDC
operation=control_plane_self_test
providerBoundaryEnabled=false
leaseMode=single_instance_memory_dev
providerSafeDurability=false
sourceLock=5d95130a9813ed04461218fbc96c5b9c52c84b1f
```

La corrección `PR_HEAD_SHA=github.event.pull_request.head.sha` quedó demostrada y no requiere nuevo diagnóstico.

## 3. Único intento corregido

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260806-02
runId=31132278764
jobId=92723768448
artifactId=8976504179
sourceIdentityGate=PASS
GoogleCloudAuthentication=PASS
failureStep=Resolve deployer and isolated runtime identity
failureClassification=IAM_PERMISSION_DENIED_SERVICE_ACCOUNT_CREATE
missingPermission=iam.serviceAccounts.create
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

```text
deploysExecuted=0
successfulIAMWrites=0
CloudBuild=0
CloudRunDeploy=0
providerReads=0
providerWrites=0
secondAttempt=0
STOP_RETRY=true
```

## 4. Fail-close

```text
workflowRemovalCommit=59b241a9dee3505388433d79b2aa30ae6b127ee4
requestDisableCommit=8c47eff370620fd66ae7d26740079e18021c5419
workflowPresent=false
requestExecutable=false
allowedDeploys=0
rollback=not_required_pre_gcp_write_failure
```

No se reutilizan el request, workflow, run ni job consumidos.

## 5. Bloqueo real

La fuente y el harness están listos. El único bloqueo pendiente es crear administrativamente la identidad aislada:

```text
cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Debe quedar sin roles de proyecto. No se sustituirá por `firebase-adminsdk-fbsvc`.

## 6. SKIP13 y Auth

```text
SKIP13 profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
providerReadConsumptionPreviousRequests=UNKNOWN
```

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
```

Auth no ha sido ejecutado.

## 7. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 8. Pendiente real

1. Resolver únicamente la creación administrativa de la identidad runtime aislada.
2. Con autorización nueva, crear request/workflow nuevos y ejecutar máximo un deploy DEV.
3. Validar endpoint privado, health autenticado, source lock, lease, duplicados y rollback.
4. Mantener provider deshabilitado hasta deploy terminal PASS y lease durable apto para provider.
5. Autorizar separadamente adjudicación SKIP13, snapshot/repair Auth, readback, smoke, validación humana y cutover.

## 9. Estado seguro

```text
provider reads this block=0
provider writes=0
HR reads=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
successful IAM writes=0
Cloud Build writes=0
Cloud Run deploys=0
Hosting deploys=0
Make/Gemini/payments=0
merge=false
production=false
requestExecutable=false
```

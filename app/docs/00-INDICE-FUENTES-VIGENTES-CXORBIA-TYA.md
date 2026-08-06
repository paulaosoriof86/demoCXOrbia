# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_SOURCE_READY__DEPLOY_ATTEMPT_FAIL_CLOSED_PREPROVIDER_SHA_CONTEXT__ZERO_DEPLOY__STOP_RETRY__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-DEPLOY-STOP-RETRY-20260806.md`;
3. `backend/contracts/c6-direct-trusted-runner-dev-v1.json`;
4. `backend/config/c6-direct-trusted-runner-dev-deploy-request.json` — deshabilitado y consumido;
5. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
6. `tools/qa/cxorbia-c6-direct-runner-source-gate.mjs`;
7. `backend/contracts/c6-execution-control-plane-v2.json`;
8. `tools/qa/cxorbia-c6-control-plane-preflight.mjs`;
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

## 2. Carril directo preparado

```text
lane=direct_trusted_runner
sourceStatus=READY
environment=DEV
service=cxorbia-c6-direct-runner-dev
authentication=Cloud Run IAM/OIDC
operation=control_plane_self_test
providerBoundaryEnabled=false
leaseMode=single_instance_memory_dev
providerSafeDurability=false
```

Fuente bloqueada:

```text
lockedSourceHead=4bc7c3529ccca34d87fc19747b7053831c577c47
```

## 3. Único intento de deploy

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260806-01
requestCommit=bebe0f207d62dd9d833cfeb0675f54705283cbc7
runId=31131197140
jobId=92720222820
failureStep=Validate exact one-shot deployment request
failureClassification=TEST_HARNESS_PULL_REQUEST_SHA_CONTEXT_MISMATCH
```

El checkout se fijó al head real del PR, pero el validador lo comparó contra `GITHUB_SHA`, que en el evento `pull_request` representa el merge commit sintético. El run se detuvo antes del claim y antes de Google Cloud.

```text
deploysExecuted=0
CloudBuild=0
CloudRunDeploy=0
IAMWrites=0
providerReads=0
providerWrites=0
secondAttempt=0
STOP_RETRY=true
```

## 4. Fail-close

```text
workflowRemovalCommit=810c707ddde1970e272d6b880f253cd172e7bb1d
requestDisableCommit=2b607d9ad03cf14794d44f0eb49be285226a3cf8
workflowPresent=false
requestExecutable=false
allowedDeploys=0
```

No se reutilizan el request, workflow, run ni job anteriores.

## 5. SKIP13 y Auth

```text
SKIP13 profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
requestExecutable=false
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

## 6. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 7. Pendiente real

1. No reusar el request ni workflow del intento fallido.
2. Solo con autorización nueva, crear un carril nuevo que use `github.event.pull_request.head.sha` como checkout y validación del head.
3. Mantener la frontera provider deshabilitada hasta disponer de deploy DEV terminal PASS y lease durable apto para provider.
4. Después, autorizar separadamente adjudicación SKIP13, snapshot/repair Auth, readback, smoke, validación humana y cutover.

## 8. Estado seguro

```text
provider reads this block=0
provider writes=0
HR reads=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
Cloud Build writes=0
Cloud Run deploys=0
IAM writes=0
Hosting deploys=0
Make/Gemini/payments=0
merge=false
production=false
requestExecutable=false
```

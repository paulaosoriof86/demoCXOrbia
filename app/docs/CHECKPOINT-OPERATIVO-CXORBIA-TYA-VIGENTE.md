# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_DIRECT_RUNNER_SOURCE_READY__DEPLOY_ATTEMPT_FAIL_CLOSED_PREPROVIDER_SHA_CONTEXT__ZERO_DEPLOY__STOP_RETRY__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-DEPLOY-STOP-RETRY-20260806.md`;
- request direct runner ejecutable: ninguno;
- requests SKIP13 ejecutables: ninguno;
- request HR v4: `ac2032ec224e6d56bf087788b949691b6690c437`.

## 2. Direct trusted runner fuente

```text
service=cxorbia-c6-direct-runner-dev
environment=DEV
lockedSourceHead=4bc7c3529ccca34d87fc19747b7053831c577c47
authentication=Cloud Run IAM/OIDC
operation=control_plane_self_test
providerBoundaryEnabled=false
leaseMode=single_instance_memory_dev
providerSafeDurability=false
```

Archivos preparados:

```text
backend/runtime/c6-direct-trusted-runner/server.mjs
backend/runtime/c6-direct-trusted-runner/package.json
backend/runtime/c6-direct-trusted-runner/Dockerfile
backend/runtime/c6-direct-trusted-runner/cloudbuild.yaml
backend/contracts/c6-direct-trusted-runner-dev-v1.json
tools/qa/cxorbia-c6-direct-runner-source-gate.mjs
```

## 3. Único intento autorizado

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260806-01
requestCommit=bebe0f207d62dd9d833cfeb0675f54705283cbc7
runId=31131197140
jobId=92720222820
runConclusion=failure
failureStep=Validate exact one-shot deployment request
failureClassification=TEST_HARNESS_PULL_REQUEST_SHA_CONTEXT_MISMATCH
```

El checkout se realizó sobre `github.event.pull_request.head.sha`, pero el validador exigía igualdad con `GITHUB_SHA`. En un evento `pull_request`, `GITHUB_SHA` es el merge commit sintético del PR, no el head real.

La falla ocurrió antes del claim y antes de cualquier operación Google Cloud.

## 4. Resultado de infraestructura

```text
claimCreated=false
GoogleCloudAuth=skipped
CloudBuild=skipped
CloudRunDeploy=skipped
CloudRunIAM=skipped
endpointValidation=skipped
idempotencyValidation=skipped
rollbackValidation=skipped
deploysExecuted=0
```

## 5. Fail-close

```text
workflowRemovalCommit=810c707ddde1970e272d6b880f253cd172e7bb1d
requestDisableCommit=2b607d9ad03cf14794d44f0eb49be285226a3cf8
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedDeploys=0
requestExecutable=false
secondAttempt=0
STOP_RETRY=true
```

## 6. Control plane v2

```text
primaryLane=github_actions_explicit_dispatch
fallbackLane=direct_trusted_runner
fallbackStatus=SOURCE_READY_DEPLOY_ATTEMPT_FAIL_CLOSED_NO_DEPLOY_STOP_RETRY
```

La frontera provider permanece cerrada. El lease técnico en memoria no se considera durable para operaciones provider.

## 7. SKIP13 y Auth

```text
profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
candidateClassificationAvailable=false
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
emailChanges=39
passwordChanges=14
claimsChanges=38
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
```

Auth no ha sido ejecutado.

## 8. Snapshot, rollback y smoke

```text
snapshotManifest=PREPARED_NOT_EXECUTABLE
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
smokeDecision=PREPARED_NOT_EXECUTED
partialPassAllowed=false
humanValidationRequired=true
```

## 9. Request HR v4

```text
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 11. Siguiente cadena exacta

1. No reusar el request, workflow, run ni job del intento fallido.
2. Solo con autorización nueva, crear un carril nuevo que use `github.event.pull_request.head.sha` para checkout y validación.
3. Ejecutar un único deploy DEV y validar autenticación, source lock, lease, duplicados y rollback.
4. Mantener provider deshabilitado hasta deploy terminal PASS y lease durable apto para provider.
5. Autorizar separadamente adjudicación SKIP13, snapshot/repair Auth, readback, smoke, validación humana y cutover.

## 12. Estado seguro

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

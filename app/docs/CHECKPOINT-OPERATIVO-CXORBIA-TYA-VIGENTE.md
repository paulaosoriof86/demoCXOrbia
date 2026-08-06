# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_DIRECT_RUNNER_SOURCE_GATE_PASS__IAM_CREATE_DENIED__ZERO_DEPLOY__STOP_RETRY__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
- request direct runner ejecutable: ninguno;
- requests SKIP13 ejecutables: ninguno;
- request HR v4: `ac2032ec224e6d56bf087788b949691b6690c437`.

## 2. Fuente y harness corregidos

```text
service=cxorbia-c6-direct-runner-dev
environment=DEV
sourceLock=5d95130a9813ed04461218fbc96c5b9c52c84b1f
PR_HEAD_SHA=github.event.pull_request.head.sha
sourceIdentityGate=PASS
sourceGateDecision=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
authentication=Cloud Run IAM/OIDC
operation=control_plane_self_test
providerBoundaryEnabled=false
leaseMode=single_instance_memory_dev
providerSafeDurability=false
```

La regresión anterior de `GITHUB_SHA` quedó corregida y demostrada.

## 3. Único intento corregido

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260806-02
requestCommit=5d95130a9813ed04461218fbc96c5b9c52c84b1f
runId=31132278764
jobId=92723768448
artifactId=8976504179
artifactDigest=sha256:639b3aa8bd347bc3fd432fbe42552658977fbe88fd9eb14fa9f3dcb81e3b76f7
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
syntax/source gate=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
```

## 4. Bloqueo terminal

```text
failureStep=Resolve deployer and isolated runtime identity
failureClassification=IAM_PERMISSION_DENIED_SERVICE_ACCOUNT_CREATE
missingPermission=iam.serviceAccounts.create
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
requestedRuntimeIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

La cuenta runtime no fue creada.

## 5. Infraestructura y rollback

```text
runtimeServiceAccountCreated=false
successfulIAMWrites=0
CloudBuild=skipped
CloudRunDeploy=skipped
CloudRunIAM=skipped
endpointValidation=skipped
leaseValidation=skipped
duplicateRejection=skipped
rollback=not_required_pre_gcp_write_failure
deploysExecuted=0
```

## 6. Fail-close

```text
workflowRemovalCommit=59b241a9dee3505388433d79b2aa30ae6b127ee4
requestDisableCommit=8c47eff370620fd66ae7d26740079e18021c5419
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedDeploys=0
requestExecutable=false
secondAttempt=0
STOP_RETRY=true
```

## 7. Control plane v2

```text
primaryLane=github_actions_explicit_dispatch
fallbackLane=direct_trusted_runner
fallbackStatus=SOURCE_GATE_PASS_DEPLOY_BLOCKED_IAM_SERVICE_ACCOUNT_CREATE_DENIED_STOP_RETRY
```

La frontera provider permanece cerrada.

## 8. SKIP13 y Auth

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

## 9. Snapshot, rollback y smoke

```text
snapshotManifest=PREPARED_NOT_EXECUTABLE
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
smokeDecision=PREPARED_NOT_EXECUTED
partialPassAllowed=false
humanValidationRequired=true
```

## 10. Request HR v4

```text
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 11. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 12. Siguiente cadena exacta

1. No reusar request, workflow, run ni job consumidos.
2. Resolver únicamente la creación administrativa de `cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com`, dejándola sin roles de proyecto.
3. Con autorización nueva, crear request/workflow nuevos y ejecutar máximo un deploy DEV.
4. Validar endpoint privado, health autenticado, source lock, lease, duplicados y rollback.
5. Mantener provider deshabilitado hasta deploy terminal PASS y lease durable apto para provider.
6. Autorizar separadamente adjudicación SKIP13, snapshot/repair Auth, readback, smoke, validación humana y cutover.

## 13. Estado seguro

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

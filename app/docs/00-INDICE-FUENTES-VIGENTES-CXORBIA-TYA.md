# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_DEPLOY_PASS__PRIVATE_AUTHENTICATED__RUNTIME_ISOLATED__PROVIDER_BOUNDARY_OFF__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
3. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
4. `backend/contracts/c6-execution-control-plane-v2.json`;
5. `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
6. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v3.json` — consumido y deshabilitado;
7. `app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md`;
8. `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-REVIEWER-REVOKED-PASS-20260807.md`;
9. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
10. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
11. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
12. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
13. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
14. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
15. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
16. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
18. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Direct trusted runner DEV — PASS

```text
service=cxorbia-c6-direct-runner-dev
region=us-central1
runtime=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
runtimeUniqueId=112507526829412676643
runtimeFingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
decision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
private=true
providerBoundaryEnabled=false
```

Evidencia terminal:

```text
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
artifactId=8996863935
artifactDigest=sha256:d1c5b954bc69c2874aeb1e77136b53bf2b3d1699e1e1b03efddf198d8c0d8a0d
image=gcr.io/cxorbia-backend-dev/cxorbia-c6-direct-runner-dev:5c467be8d7359e66b6362a07dd3908ada3cf1c17
revision=cxorbia-c6-direct-runner-dev-00001-2vz
serviceUrl=https://cxorbia-c6-direct-runner-dev-mzgge2pnia-uc.a.run.app
```

Exactamente un Cloud Build y un Cloud Run deploy fueron ejecutados.

## 3. Validaciones del runner

```text
sourceGate=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
predeploy=PASS
runtimeIdentityAttached=PASS
privateService=PASS
unauthenticatedHealthHTTP=403
authenticatedHealth=PASS
lease=PASS
firstTechnicalInvocationHTTP=202
firstTechnicalDecision=PASS_C6_DIRECT_TRUSTED_RUNNER_TECHNICAL_VALIDATION
duplicateHTTP=409
duplicateDecision=HOLD_C6_DIRECT_RUNNER_DUPLICATE_REJECTED
rollbackPlan=PASS_DELETE_NEW_DEV_SERVICE_PRESERVE_RUNTIME_IDENTITY
rollbackExecuted=false
```

El servicio no existía antes del bloque. El rollback validado elimina únicamente el nuevo servicio DEV y preserva la identidad runtime.

## 4. Identidad runtime e IAM

```text
identityDecision=PASS_ISOLATED_RUNTIME_IDENTITY
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
temporarySecurityReviewerRevocation=PASS
IAMWritesDuringDeploy=0
```

No se otorgaron roles provider/Firebase/Auth/Firestore/Storage/HR a la identidad runtime.

## 5. SKIP13 y Auth

El evento del deploy materializó un workflow histórico de SKIP13, pero éste detectó que no era su request exacto y saltó claim, credencial y adjudicación. Por tanto:

```text
SKIP13 logical execution=false
SKIP13 provider reads=0
SKIP13 provider writes=0
```

Plan Auth vigente:

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
AuthExecuted=false
```

## 6. Fail-close del deploy

```text
workflowRemovalCommit=76dbc80634805e7ca4e77e423b2a846221014150
requestDisableCommit=f088078ef915eeb07e524faefb701dc258216593
requestExecutable=false
allowedCloudBuilds=0
allowedDeploys=0
secondDeploy=0
```

## 7. Pendiente real

1. Autorizar y ejecutar un bloque SKIP13 read-only explícito mediante el direct runner DEV desplegado.
2. Con SKIP13 cerrado, ejecutar Auth sobre el plan congelado de 340 filas con snapshot/rollback y gates.
3. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
4. Validación humana.
5. Cutover/promoción autorizada a producción.

Provider boundary permanece apagado hasta autorización explícita del bloque que corresponda.

## 8. Estado seguro

```text
CloudBuildsExecuted=1
CloudRunDeploysExecuted=1
HostingDeploys=0
IAMWrites=0
providerReads=0
providerWrites=0
SKIP13Executed=false
AuthWrites=0
HRWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
merge=false
production=false
```

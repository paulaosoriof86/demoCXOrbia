# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_IAM_ADMIN_CREDENTIAL_NOT_AVAILABLE_PRE_GCP__RUNTIME_IDENTITY_NOT_CREATED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
3. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
4. `backend/config/c6-iam-admin-runtime-identity-create-request-v1.json` — consumido y deshabilitado;
5. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
6. `backend/config/c6-iam-readonly-inventory-request-v1.json` — consumido y deshabilitado;
7. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
8. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
9. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json` — consumido y deshabilitado;
10. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
11. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
12. `backend/contracts/c6-execution-control-plane-v2.json`;
13. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
14. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
15. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
16. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
17. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
18. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
19. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
20. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
21. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
22. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Bloque IAM ADMIN autorizado

```text
requestId=c6-iam-admin-runtime-identity-create-20260806-01
requestCommit=466d7baebefd5af97f0f0347110691fa1737fa6f
runId=31133874657
jobId=92728797539
artifactId=8977116099
artifactDigest=sha256:19c3d8d343eba98ddd60f6af1eee0d9a6d48d936c972ee7f5063023040069136
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
```

## 3. Bloqueo terminal

```text
failureClassification=ADMIN_CREDENTIAL_NOT_AVAILABLE
failureStep=Validate administrative credential envelope
adminCredentialsPresent=false
GoogleCloudAuthentication=not_reached
```

El carril rechazaba expresamente Default Compute, Firebase Admin SDK y la identidad runtime objetivo. No se encontró ninguna credencial administrativa configurada bajo los nombres admitidos.

## 4. Resultado real

```text
runtimeIdentityCreated=false
serviceAccountCreates=0
serviceAccountDeletes=0
keysCreated=0
rolesAssigned=0
IAMWrites=0
GCPAuthentication=0
providerReads=0
providerWrites=0
deploys=0
SKIP13Executed=false
rollback=NOT_REQUIRED_NO_CREATION
```

## 5. Fail-close

```text
workflowRemovalCommit=a73fffb1fd758fc224482fb1774c1a4ff206286b
requestDisableCommit=0ed31c4c184d9147758247541635f6fd828fee7e
workflowPresent=false
requestExecutable=false
allowedCreations=0
secondAttempt=0
STOP_RETRY=true
```

No se reutilizarán el request, workflow, run ni job consumidos.

## 6. Decisión vigente

```text
decision=ADMIN_CREDENTIAL_CONFIGURATION_REQUIRED
requiredTarget=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

La fuente y el harness están listos. Falta configurar una identidad administrativa válida para `cxorbia-backend-dev` mediante un secreto seguro ya autorizado o un mecanismo OIDC administrativo. No se usarán Default Compute ni Firebase Admin SDK.

## 7. Direct runner, SKIP13 y Auth

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

## 8. Pendiente real

1. Configurar una credencial administrativa o trust OIDC válida para `cxorbia-backend-dev`, sin exponer secretos.
2. Validar únicamente la identidad administrativa y el permiso mínimo para crear la cuenta runtime.
3. Con autorización nueva y no superpuesta, crear `cxorbia-c6-runner-dev` sin llaves ni roles.
4. Ejecutar readback de estado, llaves y bindings directos.
5. Solo después autorizar el deploy DEV del ejecutor.
6. Mantener provider deshabilitado hasta terminal PASS.

## 9. Estado seguro

```text
provider data reads=0
provider writes=0
IAM writes=0
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

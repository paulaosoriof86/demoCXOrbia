# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__READBACK_INCOMPLETE__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`;
3. `backend/contracts/c6-runtime-identity-postcreate-verification-v1.json`;
4. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
5. `backend/config/c6-iam-runtime-identity-postcreate-readonly-request-v1.json` — consumido y deshabilitado;
6. `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
7. `backend/config/c6-iam-admin-runtime-identity-create-request-v1.json` — consumido y deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
9. `backend/config/c6-iam-readonly-inventory-request-v1.json` — consumido y deshabilitado;
10. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
11. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
12. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json` — consumido y deshabilitado;
13. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
14. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
15. `backend/contracts/c6-execution-control-plane-v2.json`;
16. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
17. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
18. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
19. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
20. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
21. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
22. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
23. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
24. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
25. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Identidad runtime confirmada

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
displayName=cxorbia-c6-runner-dev
projectId=cxorbia-backend-dev
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
```

La creación manual quedó confirmada por `gcloud iam service-accounts describe`.

## 3. Bloque post-creación read-only

```text
requestId=c6-iam-runtime-identity-postcreate-readonly-20260806-01
requestCommit=e4a5538158980746f94f30ddea42dd1380f00caa
runId=31135508722
jobId=92733827812
artifactId=8977774322
artifactDigest=sha256:c579dceb2d02df82dc5397ea2b0dcd1afbdc6cafcdd914f259ad33970e9d3ccb
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
identity describe=PASS
```

## 4. Readback incompleto

El principal disponible no pudo leer:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

Por ello no quedaron demostradas terminalmente:

```text
zeroUserManagedKeys
zeroDirectServiceAccountBindings
zeroProjectRoles
```

```text
decision=STOP_RETRY_READBACK_INCOMPLETE
isolatedIdentityFinalPass=false
```

Fingerprint provisional:

```text
ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
```

No es final porque incorpora arrays vacíos de fuentes no legibles.

## 5. Fail-close

```text
workflowRemovalCommit=795f2296a70b3f92169f409e7017b828fe0c486a
requestDisableCommit=0e12b33172f8d9df423b87fc5037c53b602691fc
workflowPresent=false
requestExecutable=false
allowedExecutions=0
secondAttempt=0
STOP_RETRY=true
```

No se reutilizarán request, workflow, run ni job consumidos.

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

## 7. Pendiente real

1. Obtener únicamente visibilidad IAM read-only suficiente para los tres readbacks pendientes.
2. No recrear la identidad runtime.
3. Con autorización nueva y no superpuesta, verificar cero llaves de usuario, cero bindings directos y cero roles de proyecto.
4. Solo con PASS final autorizar un nuevo deploy DEV del ejecutor.
5. Mantener provider deshabilitado hasta terminal PASS.
6. Autorizar separadamente SKIP13, snapshot/repair Auth, smoke, validación humana y cutover.

## 8. Estado seguro

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

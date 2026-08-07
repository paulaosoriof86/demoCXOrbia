# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__IAM_VISIBILITY_EXECUTION_LANE_NOT_MATERIALIZED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__ZERO_IAM_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-IAM-VISIBILITY-NO-EXECUTION-LANE-STOP-RETRY-20260806.md`;
3. `backend/config/c6-iam-visibility-temporary-security-reviewer-request-v1.json` — consumido y deshabilitado;
4. `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`;
5. `backend/contracts/c6-runtime-identity-postcreate-verification-v1.json`;
6. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
7. `backend/config/c6-iam-runtime-identity-postcreate-readonly-request-v1.json` — consumido y deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
9. `backend/config/c6-iam-admin-runtime-identity-create-request-v1.json` — consumido y deshabilitado;
10. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
11. `backend/config/c6-iam-readonly-inventory-request-v1.json` — consumido y deshabilitado;
12. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
13. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
14. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json` — consumido y deshabilitado;
15. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
16. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
17. `backend/contracts/c6-execution-control-plane-v2.json`;
18. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
19. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
20. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
21. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
22. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
23. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
24. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
25. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
26. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
27. `AGENTS.md`, PR #7 y HEAD vivo.

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

## 3. Bloque post-creación read-only anterior

```text
requestId=c6-iam-runtime-identity-postcreate-readonly-20260806-01
requestCommit=e4a5538158980746f94f30ddea42dd1380f00caa
runId=31135508722
jobId=92733827812
artifactId=8977774322
artifactDigest=sha256:c579dceb2d02df82dc5397ea2b0dcd1afbdc6cafcdd914f259ad33970e9d3ccb
```

Pasaron checkout exacto, request/source lock, claim único, Google Cloud authentication, gcloud setup e identity describe. El principal disponible no pudo leer:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

Por ello siguen sin demostrarse terminalmente:

```text
zeroUserManagedKeys
zeroDirectServiceAccountBindings
zeroProjectRoles
```

Fingerprint provisional:

```text
ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
```

## 4. Bloque IAM VISIBILITY autorizado

Paula autorizó máximo dos IAM writes para conceder temporalmente `roles/iam.securityReviewer` a:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

y retirarlo inmediatamente después de verificar la identidad runtime.

Carril preparado:

```text
workflowCreateCommit=3a1bb800950e00ac5caa0482afa26d69429d7047
requestCreateCommit=6d14c9b4458f4b7a37efa77542f101d617b745b4
workflowTriggerCorrectionCommit=338dd13d73920b372d005092afd2cce6375152d9
requestRearmCommit=891a6acedcd620abbf70c4fc55d11b716c22d4dd
```

No se materializó un run observable del workflow C6 IAM Visibility. No se atribuye causa raíz no demostrada.

```text
workflowRunMaterialized=false
claimMaterialized=false
GoogleCloudAuthenticationReached=false
iamGrantAttempted=false
iamRevokeAttempted=false
IAMWrites=0
```

Decisión:

```text
GITHUB_ACTIONS_NEW_WORKFLOW_NOT_MATERIALIZED
ADMINISTRATIVE_IAM_AUTHORITY_STILL_REQUIRED
STOP_RETRY=true
```

## 5. Fail-close del bloque IAM VISIBILITY

```text
workflowRemovalCommit=74ffa1c3049af2e79598b48ef6d3650c5bc6abb3
requestDisableCommit=2a3a08acce1b8d4ea57bedca9a70692e24c95910
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
allowedIamWrites=0
requestExecutable=false
```

No se reutilizarán el workflow ni request cerrados.

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

1. Obtener una identidad administrativa o una vía IAM observable con autoridad suficiente para otorgar y retirar temporalmente visibilidad IAM, sin reutilizar Firebase Admin SDK como runtime.
2. No recrear `cxorbia-c6-runner-dev`.
3. Verificar terminalmente cero llaves administradas por usuario, cero bindings directos y cero roles de proyecto.
4. Solo con PASS final autorizar un nuevo deploy DEV del direct runner.
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

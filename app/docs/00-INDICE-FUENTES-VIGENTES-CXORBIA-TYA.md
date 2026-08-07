# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_IAM_READONLY_PARTIAL_INVENTORY__ADMIN_IDENTITY_CREATION_REQUIRED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
3. `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
4. `backend/config/c6-iam-readonly-inventory-request-v1.json` — consumido y deshabilitado;
5. `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`;
6. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
7. `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json` — consumido y deshabilitado;
8. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
9. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
10. `backend/contracts/c6-execution-control-plane-v2.json`;
11. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
12. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
13. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
14. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
15. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
16. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
17. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
20. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Inventario IAM read-only

```text
requestId=c6-iam-readonly-inventory-20260806-01
requestCommit=754e7ee1e8b81d27ad7f90dd8c4f4c594c411c02
runId=31133025584
jobId=92726136842
artifactId=8976819925
artifactDigest=sha256:f3e1330b6e5777317255389f1d5a330f94b85bf897093049ca22b06d01a5ea69
```

La lista de cuentas de servicio fue leída correctamente y contiene exactamente dos identidades:

```text
87461567267-compute@developer.gserviceaccount.com
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

Ambas están excluidas para el runtime aislado: la primera es Default Compute y la segunda pertenece a Firebase Admin SDK.

## 3. Binding visibility

La lectura de la política IAM del proyecto fue rechazada:

```text
failureClassification=IAM_PERMISSION_DENIED_PROJECT_GET_IAM_POLICY
missingPermission=resourcemanager.projects.getIamPolicy
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

No se completó el detalle de roles directos ni las policies individuales. Sin embargo, la decisión es determinística porque las únicas identidades existentes están excluidas por tipo, independientemente de sus bindings.

## 4. Decisión de identidad

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
candidateCount=0
requiredIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Fingerprints:

```text
Default Compute=49e094a8f498fba2827c46785bc298557973959945434200c868b700afb3daf5
Firebase Admin SDK=c9dd358bd886e96fb4b53f6edead9cc6a2c91d1c712ad70c21ebabcb55e58489
```

La identidad requerida debe ser user-managed y quedar sin roles de proyecto, provider, Firebase, Auth, Firestore, Storage, HR, Cloud Build o administrativos. No se reutilizará ninguna de las dos cuentas existentes.

## 5. Fail-close

```text
workflowRemovalCommit=7d7c33562f6cd6b2fde9a7677dd938139c5a9fe5
requestDisableCommit=a40fdf9c392c5c5eebf1f7337386ff348a247b57
workflowPresent=false
requestExecutable=false
allowedExecutions=0
secondAttempt=0
STOP_RETRY=true
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

## 7. Pendiente real

1. Crear administrativamente la identidad runtime aislada, mediante autorización separada.
2. Verificar por readback que existe, está activa y no tiene roles de proyecto ni acceso provider.
3. Solo después autorizar un nuevo deploy DEV del ejecutor.
4. Mantener provider deshabilitado hasta terminal PASS.
5. Autorizar separadamente SKIP13, snapshot/repair Auth, smoke, validación humana y cutover.

## 8. Estado seguro

```text
iamControlPlaneReads=2
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

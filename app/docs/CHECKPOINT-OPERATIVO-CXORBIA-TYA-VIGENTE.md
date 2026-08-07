# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_IAM_READONLY_PARTIAL_INVENTORY__ADMIN_IDENTITY_CREATION_REQUIRED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`;
- request IAM inventory ejecutable: ninguno;
- request direct runner ejecutable: ninguno;
- requests SKIP13 ejecutables: ninguno.

## 2. Direct trusted runner

```text
service=cxorbia-c6-direct-runner-dev
source=READY
sourceGate=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
deploy=NOT_EXECUTED
providerBoundaryEnabled=false
```

El harness de `PR_HEAD_SHA=github.event.pull_request.head.sha` está corregido y validado. El deploy previo quedó bloqueado por ausencia de permiso para crear una identidad runtime aislada.

## 3. Inventario IAM read-only

```text
requestId=c6-iam-readonly-inventory-20260806-01
requestCommit=754e7ee1e8b81d27ad7f90dd8c4f4c594c411c02
runId=31133025584
jobId=92726136842
artifactId=8976819925
artifactDigest=sha256:f3e1330b6e5777317255389f1d5a330f94b85bf897093049ca22b06d01a5ea69
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
service account list=PASS
```

## 4. Cuentas existentes

```text
serviceAccountsListed=2
```

### Default Compute

```text
email=87461567267-compute@developer.gserviceaccount.com
uniqueId=111386648265978071009
classification=SYSTEM_DEFAULT_COMPUTE_IDENTITY_EXCLUDED
fingerprint=49e094a8f498fba2827c46785bc298557973959945434200c868b700afb3daf5
```

### Firebase Admin SDK

```text
email=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
uniqueId=115771268599010410289
classification=FIREBASE_ADMIN_SDK_IDENTITY_EXCLUDED
fingerprint=c9dd358bd886e96fb4b53f6edead9cc6a2c91d1c712ad70c21ebabcb55e58489
```

Ninguna cumple el aislamiento requerido.

## 5. Visibilidad de bindings

```text
projectIamPolicyRead=false
failureClassification=IAM_PERMISSION_DENIED_PROJECT_GET_IAM_POLICY
missingPermission=resourcemanager.projects.getIamPolicy
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

No fue posible leer los roles directos ni las policies individuales. La decisión sigue siendo determinística porque ambas identidades están excluidas categóricamente por su tipo.

## 6. Decisión

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
candidateCount=0
requiredIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Debe crearse mediante una identidad administrativa, quedar activa y sin roles de proyecto, provider, Firebase, Auth, Firestore, Storage, HR, Cloud Build o administrativos.

No se reutilizarán Default Compute ni Firebase Admin SDK.

## 7. Fail-close

```text
workflowRemovalCommit=7d7c33562f6cd6b2fde9a7677dd938139c5a9fe5
requestDisableCommit=a40fdf9c392c5c5eebf1f7337386ff348a247b57
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
requestExecutable=false
secondAttempt=0
STOP_RETRY=true
```

## 8. SKIP13 y Auth

```text
profiles=13
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

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 10. Siguiente cadena exacta

1. Autorizar por separado la creación administrativa de `cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com`.
2. Crear únicamente esa identidad, sin roles de proyecto.
3. Ejecutar readback de existencia, estado y bindings.
4. Solo con PASS, autorizar un nuevo deploy DEV del ejecutor.
5. Mantener provider deshabilitado hasta terminal PASS.
6. Autorizar separadamente SKIP13, snapshot/repair Auth, smoke, validación humana y cutover.

## 11. Estado seguro

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

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_IAM_ADMIN_CREDENTIAL_NOT_AVAILABLE_PRE_GCP__RUNTIME_IDENTITY_NOT_CREATED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`;
- request IAM ADMIN ejecutable: ninguno;
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

El source lock y el harness de `PR_HEAD_SHA` están corregidos. El ejecutor no está desplegado.

## 3. Identidad runtime requerida

```text
target=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
created=false
```

El inventario previo encontró únicamente Default Compute y Firebase Admin SDK, ambas excluidas.

## 4. Bloque IAM ADMIN

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

## 5. Bloqueo terminal

```text
failureStep=Validate administrative credential envelope
failureClassification=ADMIN_CREDENTIAL_NOT_AVAILABLE
adminCredentialsPresent=false
GCPAuthentication=skipped
```

No se alcanzaron Google Cloud, la lectura de preestado, la creación de la cuenta, el readback ni la generación del fingerprint.

## 6. Infraestructura y rollback

```text
serviceAccountCreated=false
serviceAccountCreates=0
serviceAccountDeletes=0
keysCreated=0
rolesAssigned=0
IAMWrites=0
CloudBuild=skipped
CloudRunDeploy=skipped
rollback=NOT_REQUIRED_NO_CREATION
```

## 7. Fail-close

```text
workflowRemovalCommit=a73fffb1fd758fc224482fb1774c1a4ff206286b
requestDisableCommit=0ed31c4c184d9147758247541635f6fd828fee7e
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedCreations=0
requestExecutable=false
secondAttempt=0
STOP_RETRY=true
```

## 8. Decisión vigente

```text
decision=ADMIN_CREDENTIAL_CONFIGURATION_REQUIRED
```

Debe configurarse una identidad administrativa válida para `cxorbia-backend-dev` sin exponer secretos. Puede ser un secreto administrativo seguro o un mecanismo OIDC con trust válido. No se usarán Default Compute ni Firebase Admin SDK.

## 9. SKIP13 y Auth

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

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 11. Siguiente cadena exacta

1. Configurar una credencial administrativa o trust OIDC válida para `cxorbia-backend-dev`.
2. Validar su identidad y permiso mínimo sin crear recursos.
3. Con autorización nueva y no superpuesta, crear únicamente `cxorbia-c6-runner-dev` sin llaves ni roles.
4. Ejecutar readback de estado activo, llaves y bindings directos.
5. Solo con PASS, autorizar un nuevo deploy DEV del ejecutor.
6. Mantener provider deshabilitado hasta terminal PASS.

## 12. Estado seguro

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

# SOURCE LOCK — C6 direct trusted runner DEV deploy / STOP_RETRY

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `DIRECT_RUNNER_SOURCE_READY__ONE_DEPLOY_RUN_FAILED_AT_PREPROVIDER_VALIDATION__ZERO_GCP_OPERATIONS__WORKFLOW_REMOVED__REQUEST_DISABLED__STOP_RETRY`

## 1. Autorización ejecutada

Paula autorizó un único bloque C6 DEV para materializar `direct_trusted_runner` mediante invocación autenticada, lease de idempotencia, source lock exacto y un máximo de un deploy técnico en DEV.

Quedaron prohibidos SKIP13, lecturas o escrituras Auth/claims/memberships/HR/Firestore/Rules/Storage, Hosting, merge, producción, Make, Gemini y pagos.

## 2. Fuente preparada

Se incorporaron y preservan en la rama viva:

- `backend/runtime/c6-direct-trusted-runner/server.mjs`;
- `backend/runtime/c6-direct-trusted-runner/package.json`;
- `backend/runtime/c6-direct-trusted-runner/Dockerfile`;
- `backend/runtime/c6-direct-trusted-runner/cloudbuild.yaml`;
- `backend/contracts/c6-direct-trusted-runner-dev-v1.json`;
- `tools/qa/cxorbia-c6-direct-runner-source-gate.mjs`.

Source lock técnico usado por el request:

```text
lockedSourceHead=4bc7c3529ccca34d87fc19747b7053831c577c47
requestCommit=bebe0f207d62dd9d833cfeb0675f54705283cbc7
requestId=c6-direct-trusted-runner-dev-deploy-20260806-01
```

El ejecutor fuente está limitado a:

```text
environment=DEV
authentication=Cloud Run IAM/OIDC
operation=control_plane_self_test
providerBoundaryEnabled=false
providerReads=0
providerWrites=0
maxInstances=1
concurrency=1
leaseMode=single_instance_memory_dev
```

El lease implementado es únicamente técnico DEV y no se clasifica como persistencia durable apta para cruzar la frontera provider.

## 3. Run único

```text
workflow=CXOrbia C6 Direct Trusted Runner DEV Deploy Once
runId=31131197140
jobId=92720222820
runConclusion=failure
failureStep=Validate exact one-shot deployment request
```

El checkout se realizó sobre el head exacto:

```text
checkedOutHead=bebe0f207d62dd9d833cfeb0675f54705283cbc7
```

El validador comparó ese head con `process.env.GITHUB_SHA`. En un workflow `pull_request`, GitHub define `GITHUB_SHA` como el commit sintético de la rama merge del PR; para obtener el head real debe usarse `github.event.pull_request.head.sha`.

Clasificación demostrada:

```text
failureClassification=TEST_HARNESS_PULL_REQUEST_SHA_CONTEXT_MISMATCH
productRuntimeFailure=false
sourceLockDrift=false
providerCredentialFailure=false
cloudBuildFailure=false
cloudRunFailure=false
```

La falla ocurrió antes del claim y antes de cualquier autenticación a Google Cloud.

## 4. Operaciones no alcanzadas

Los pasos siguientes quedaron `skipped`:

```text
claim
source gate execution
Google Cloud authentication
gcloud setup
runtime service account create/update
Cloud Build
Cloud Run deploy
Cloud Run IAM binding
endpoint validation
authenticated invocation
lease acquisition
duplicate rejection
rollback validation
```

Resultado real:

```text
deploysExecuted=0
cloudBuildWrites=0
cloudRunDeploys=0
iamWrites=0
providerReads=0
providerWrites=0
SKIP13Executed=false
AuthReads=0
HRReads=0
FirestoreReads=0
```

## 5. Fail-close

Se aplicó `STOP_RETRY` sin segundo intento.

Para impedir una ejecución tardía o accidental:

```text
workflowRemovalCommit=810c707ddde1970e272d6b880f253cd172e7bb1d
requestDisableCommit=2b607d9ad03cf14794d44f0eb49be285226a3cf8
requestEnabled=false
allowedDeploys=0
requestExecutable=false
```

El workflow se retiró antes de deshabilitar el request.

## 6. Corrección exacta requerida para una autorización futura

Un nuevo carril, con nuevo request y autorización separada, deberá:

```text
PR_HEAD_SHA=${{ github.event.pull_request.head.sha }}
checkoutRef=PR_HEAD_SHA
validatedHead=PR_HEAD_SHA
```

Queda prohibido validar el head del PR contra `GITHUB_SHA` dentro de un evento `pull_request`.

No se reutilizarán el workflow retirado, el request consumido ni el run `31131197140`.

## 7. Phase A preservada

El plan Auth continúa congelado:

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

Frontend acumulativo, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen intactos.

## 8. Clasificación documental

- **Reusable CXOrbia:** diferencia obligatoria entre `GITHUB_SHA` y `github.event.pull_request.head.sha`; guard preprovider antes de GCP.
- **Exclusivo TyA:** dependencia del cierre C6 para la futura adjudicación SKIP13 y el plan Auth de 340 filas.
- **Claude/prototipo:** sin cambios en módulos, core, UI o UX.
- **Academia:** separación entre error de harness, producto, infraestructura y proveedor.
- **Sin impacto Claude:** frontend, Finanzas, Portales, Reservas y Academia funcional preservados.

## 9. Estado seguro

```text
newBranch=0
newPR=0
secondAttempt=0
workflowPresent=false
requestExecutable=false
CloudBuild=0
CloudRunDeploy=0
IAMWrites=0
HostingDeploy=0
providerReads=0
providerWrites=0
Auth/claims/membership/HR/Firestore/Storage reads=0
Auth/Firestore/Rules/Storage/HR writes=0
merge=0
production=false
```

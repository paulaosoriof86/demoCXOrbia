# SOURCE LOCK — C6 direct trusted runner DEV / IAM create denied / STOP_RETRY

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `DIRECT_RUNNER_SOURCE_GATE_PASS__IAM_SERVICE_ACCOUNT_CREATE_DENIED__ZERO_DEPLOY__REQUEST_DISABLED__WORKFLOW_REMOVED__STOP_RETRY`

## 1. Autorización

Paula autorizó un único bloque C6 DEV corregido para desplegar `direct_trusted_runner`, usando exclusivamente `github.event.pull_request.head.sha` como `PR_HEAD_SHA`, con identidad runtime aislada, invocación IAM/OIDC, máximo una instancia, concurrencia uno y frontera provider deshabilitada.

Quedaron prohibidos SKIP13, Auth, claims, memberships, HR, Firestore, Rules, Storage, Hosting, merge y producción.

## 2. Identidad de fuente corregida

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260806-02
requestCommit=5d95130a9813ed04461218fbc96c5b9c52c84b1f
parentCommit=c340bf03b0f015536d9e264df67414417b09ae6f
PR_HEAD_SHA=5d95130a9813ed04461218fbc96c5b9c52c84b1f
changedPath=backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json
```

El checkout, la validación y el source lock coincidieron exactamente con `PR_HEAD_SHA`.

```text
sourceIdentityGate=PASS
sourceGateDecision=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
providerBoundaryAllowed=false
```

Hashes de fuente:

```text
contract=7b8962457299839d59e6b14e3a117d017e76b26339544d8b9f2c00d02609b54b
server=cd57bab62466bdf9f35309e523ccd0285c263b3b0af579686719b2ca19b66154
dockerfile=f974e51cd5f9ea6cfcf7d939e410136873e1b218b2bb302f3244ce7e88d06889
cloudbuild=2ec9b9d42bc4835e5f15093c123a2ed84d31729f887c04ddccdb9cfb7b399692
```

## 3. Run único

```text
workflow=CXOrbia C6 Direct Trusted Runner DEV Deploy Once V2
runId=31132278764
jobId=92723768448
runConclusion=failure
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
Node/syntax=PASS
source gate v2=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
```

## 4. Bloqueo demostrado

El paso `Resolve deployer and isolated runtime identity` intentó crear:

```text
runtimeServiceAccount=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

GitHub Actions estaba autenticado como:

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

Google Cloud rechazó la operación:

```text
failureClassification=IAM_PERMISSION_DENIED_SERVICE_ACCOUNT_CREATE
permission=iam.serviceAccounts.create
resource=projects/cxorbia-backend-dev
```

La cuenta runtime no fue creada.

## 5. Operaciones no alcanzadas

```text
runtimeServiceAccountCreated=false
serviceAccountPolicyBinding=not_reached
CloudBuild=not_reached
CloudRunDeploy=not_reached
CloudRunIAM=not_reached
endpointValidation=not_reached
authenticatedHealth=not_reached
leaseAcquisition=not_reached
duplicateRejection=not_reached
rollbackPlanValidation=not_reached
```

Resultado real:

```text
deploysExecuted=0
successfulIAMWrites=0
cloudBuildWrites=0
cloudRunDeploys=0
providerReads=0
providerWrites=0
SKIP13Executed=false
AuthReads=0
HRReads=0
FirestoreReads=0
```

La autenticación Google Cloud fue exitosa y ocurrió un único intento IAM denegado. No hubo mutación exitosa.

## 6. Rollback y evidencia

Como el fallo ocurrió antes de crear la identidad y antes de cualquier deploy:

```text
rollbackExecuted=not_required_pre_gcp_failure
```

Evidencia terminal:

```text
artifactId=8976504179
artifactDigest=sha256:639b3aa8bd347bc3fd432fbe42552658977fbe88fd9eb14fa9f3dcb81e3b76f7
artifactName=cxorbia-c6-direct-trusted-runner-dev-v2-31132278764
```

El artifact contiene `request-source-safe.json`, `source-gate.json` y `rollback-executed.txt`.

## 7. Fail-close

Se aplicó `STOP_RETRY` sin segundo intento.

```text
workflowRemovalCommit=59b241a9dee3505388433d79b2aa30ae6b127ee4
requestDisableCommit=8c47eff370620fd66ae7d26740079e18021c5419
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedDeploys=0
requestExecutable=false
secondAttempt=0
```

No se reutilizarán request, workflow, run ni job.

## 8. Solución técnica necesaria

La fuente y el harness corregido no requieren otro diagnóstico. El bloqueo restante es exclusivamente IAM.

Una ejecución futura necesita una de estas dos condiciones, autorizada por separado:

1. precrear `cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com` mediante una identidad administrativa y dejarla sin roles de proyecto; o
2. otorgar temporalmente a la identidad de despliegue el permiso mínimo para crear esa cuenta y retirarlo después.

No debe sustituirse la identidad aislada por `firebase-adminsdk-fbsvc`, porque esa cuenta no cumple el aislamiento exigido.

## 9. Phase A preservada

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

## 10. Clasificación documental

- **Reusable CXOrbia:** separación entre deployer y runtime identity; source lock por `PR_HEAD_SHA`; fail-close antes de Build/Run.
- **Exclusivo TyA:** dependencia del cierre C6 para SKIP13 y plan Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** IAM least privilege y distinción entre intento denegado y write efectivo.
- **Sin impacto Claude:** UI, Portales, Finanzas, Reservas y Academia funcional preservados.

## 11. Estado seguro

```text
newBranch=0
newPR=0
workflowPresent=false
requestExecutable=false
successfulIAMWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
providerReads=0
providerWrites=0
Auth/claims/membership/HR/Firestore/Storage reads=0
Auth/Firestore/Rules/Storage/HR writes=0
merge=0
production=false
```

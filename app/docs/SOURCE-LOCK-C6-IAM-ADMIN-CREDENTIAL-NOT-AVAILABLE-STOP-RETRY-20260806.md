# SOURCE LOCK — C6 IAM ADMIN credential not available / STOP_RETRY

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `C6_IAM_ADMIN_AUTHORIZATION_VALID__ADMIN_CREDENTIAL_NOT_AVAILABLE_PRE_GCP__ZERO_CREATION__ZERO_WRITES__WORKFLOW_REMOVED__REQUEST_DISABLED__STOP_RETRY`

## 1. Autorización ejecutada

Paula autorizó un único bloque C6 IAM ADMIN DEV para crear exclusivamente:

```text
cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

El bloque permitía máximo una creación de service account, sin crear llaves, sin asignar roles y con readback de identidad, llaves y bindings directos. Quedaron prohibidos deploy, SKIP13, Auth, HR, Firestore, Rules, Storage, Hosting, merge y producción.

## 2. Carril y source lock

```text
workflow=CXOrbia C6 IAM Admin Runtime Identity Create Once V1
requestId=c6-iam-admin-runtime-identity-create-20260806-01
requestCommit=466d7baebefd5af97f0f0347110691fa1737fa6f
parentCommit=cf2aed9a2d88ca05983dcdbc4774fc6ad0d9e506
PR_HEAD_SHA=466d7baebefd5af97f0f0347110691fa1737fa6f
changedPath=backend/config/c6-iam-admin-runtime-identity-create-request-v1.json
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
```

El artifact confirmó que el request y el source lock eran exactos y que el único archivo del commit de ejecución era el request autorizado.

## 3. Bloqueo terminal

El paso `Validate administrative credential envelope` encontró vacío el conjunto de credenciales administrativas configuradas para el carril.

```text
failureClassification=ADMIN_CREDENTIAL_NOT_AVAILABLE
failureStep=Validate administrative credential envelope
adminCredentialsPresent=false
GoogleCloudAuthentication=not_reached
```

No se utilizó la identidad Firebase Admin SDK ni la Default Compute. El carril estaba diseñado para rechazarlas expresamente.

## 4. Operaciones no alcanzadas

```text
GCPAuthentication=skipped
gcloudSetup=skipped
preStateRead=skipped
serviceAccountCreate=skipped
identityReadback=skipped
keyReadback=skipped
serviceAccountIamPolicyReadback=skipped
projectIamPolicyReadback=skipped
fingerprintGeneration=skipped
```

Resultado real:

```text
serviceAccountCreated=false
creationCount=0
keysCreated=0
rolesAssigned=0
IAMWrites=0
providerReads=0
providerWrites=0
deploys=0
SKIP13Executed=false
```

## 5. Rollback y evidencia

Como no existió creación:

```text
rollback=NOT_REQUIRED_NO_CREATION
```

Evidencia terminal:

```text
runId=31133874657
jobId=92728797539
artifactId=8977116099
artifactName=cxorbia-c6-iam-admin-runtime-identity-create-v1-31133874657
artifactDigest=sha256:19c3d8d343eba98ddd60f6af1eee0d9a6d48d936c972ee7f5063023040069136
```

El artifact contiene:

```text
request-source-safe.json
rollback-result.txt
```

## 6. Fail-close

Se aplicó `STOP_RETRY` sin segundo intento.

```text
workflowRemovalCommit=a73fffb1fd758fc224482fb1774c1a4ff206286b
requestDisableCommit=0ed31c4c184d9147758247541635f6fd828fee7e
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedCreations=0
requestExecutable=false
secondAttempt=0
```

No se reutilizarán el request, workflow, run ni job.

## 7. Bloqueo real restante

La cuenta runtime sigue sin existir. El bloqueo ya no es de fuente, harness ni permisos de la identidad Firebase existente: falta configurar una identidad administrativa válida para este proyecto en el carril de ejecución, sin exponer secretos y sin reutilizar cuentas excluidas.

```text
decision=ADMIN_CREDENTIAL_CONFIGURATION_REQUIRED
requiredTarget=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Una futura ejecución requiere una credencial administrativa previamente configurada en GitHub o un mecanismo OIDC administrativo válido. La configuración de esa credencial o trust relationship es un gate separado y no quedó autorizada dentro de este bloque.

## 8. Phase A preservada

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

## 9. Clasificación documental

- **Reusable CXOrbia:** preflight de credencial administrativa antes de autenticar o escribir en GCP; fail-close sin mutaciones.
- **Exclusivo TyA:** dependencia del cierre C6 para SKIP13 y plan Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** separación entre autorización, disponibilidad de credencial y ejecución efectiva.
- **Sin impacto Claude:** UI, módulos, Portales, Finanzas, Reservas y Academia preservados.

## 10. Estado seguro

```text
newBranch=0
newPR=0
workflowPresent=false
requestExecutable=false
GCPAuthentication=0
serviceAccountCreates=0
serviceAccountDeletes=0
keysCreated=0
rolesAssigned=0
IAMWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
providerReads=0
providerWrites=0
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
merge=0
production=false
```

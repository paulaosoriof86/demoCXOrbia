# SOURCE LOCK — C6 IAM post-creation readback incomplete / STOP_RETRY

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__READBACK_INCOMPLETE__NO_FINAL_ISOLATION_PASS__NO_WRITES__NO_DEPLOY__STOP_RETRY`

## 1. Autorización

Paula autorizó un único bloque C6 IAM read-only post-creación sobre `cxorbia-backend-dev` para verificar exclusivamente:

```text
cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

El bloque debía confirmar existencia, estado habilitado, `uniqueId`, ausencia de llaves administradas por usuario, ausencia de bindings directos y ausencia de roles de proyecto; generar fingerprint y evidencia terminal. Quedaron prohibidos IAM writes, deploy, provider reads, SKIP13, Auth, HR, Firestore, Rules, Storage, Hosting, merge y producción.

## 2. Ejecución observable

```text
requestId=c6-iam-runtime-identity-postcreate-readonly-20260806-01
requestCommit=e4a5538158980746f94f30ddea42dd1380f00caa
parentCommit=6cad158f990e1f3a15880f25cd2198e6c291bd6b
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

## 3. Identidad confirmada

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
displayName=cxorbia-c6-runner-dev
projectId=cxorbia-backend-dev
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
```

La captura aportada por Paula también muestra visualmente la cuenta habilitada y sin claves visibles, pero esa evidencia visual no sustituye el readback IAM terminal requerido.

## 4. Readbacks no completados

El principal read-only disponible fue:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

Faltaron permisos para:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

Por ello quedaron sin confirmación terminal:

```text
zeroUserManagedKeys=NOT_PROVEN_TERMINALLY
zeroDirectServiceAccountBindings=NOT_PROVEN_TERMINALLY
zeroProjectRoles=NOT_PROVEN_TERMINALLY
```

Los conteos `0` obtenidos en arrays vacíos no se interpretan como ausencia real porque las lecturas fueron denegadas.

## 5. Decisión

```text
decision=STOP_RETRY_READBACK_INCOMPLETE
isolatedIdentityFinalPass=false
```

Fingerprint provisional:

```text
ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
```

Este fingerprint no es final porque se calculó con identidad y estado confirmados, pero con llaves y bindings no legibles.

Contrato:

```text
backend/contracts/c6-runtime-identity-postcreate-verification-v1.json
```

## 6. Fail-close

```text
workflowRemovalCommit=795f2296a70b3f92169f409e7017b828fe0c486a
requestDisableCommit=0e12b33172f8d9df423b87fc5037c53b602691fc
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
secondAttempt=0
STOP_RETRY=true
```

No se reutilizarán el request, workflow, run ni job consumidos.

## 7. Estado seguro

```text
iamWrites=0
deploys=0
providerReads=0
providerWrites=0
SKIP13Executed=false
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=0
production=false
```

## 8. Pendiente real

Se necesita únicamente una visibilidad IAM read-only suficiente para ejecutar los tres readbacks pendientes. Puede ser una identidad administrativa en modo lectura o una concesión temporal mínima de permisos de visualización IAM, seguida de retiro. No se requiere recrear la cuenta ni repetir la creación manual.

## 9. Clasificación

- **Reusable CXOrbia:** verificación fail-close y fingerprint provisional con distinción entre `0` real y lectura denegada.
- **Exclusivo TyA:** cierre de identidad runtime antes del deploy C6.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** evidencia visual versus evidencia terminal y principio de no inferir ausencia desde permisos insuficientes.
- **Sin impacto Claude:** UI, módulos, Portales, Finanzas, Reservas y Academia preservados.

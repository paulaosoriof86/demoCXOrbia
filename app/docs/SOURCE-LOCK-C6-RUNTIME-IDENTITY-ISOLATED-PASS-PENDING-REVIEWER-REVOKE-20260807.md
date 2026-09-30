# SOURCE LOCK — C6 runtime identity isolated PASS / pending reviewer revoke

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKE_PENDING__DIRECT_RUNNER_NOT_DEPLOYED__NO_PROVIDER__NO_PRODUCTION`

## 1. Resultado terminal

```text
requestId=c6-iam-runtime-isolation-readonly-final-20260807-01
sourceLock=a7357d4b0a80b164560423a673a6430e5a16b2d7
runId=31180615131
jobId=92872746963
artifactId=8994613975
artifactDigest=sha256:b4ff0ffe54dca09f07264109eb327c71d84be6e4256b058a364cd494d6348e9c
decision=PASS_ISOLATED_RUNTIME_IDENTITY
```

## 2. Identidad runtime

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
```

Fingerprint final:

```text
ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
status=FINAL_ISOLATED_IDENTITY
```

## 3. Rol temporal de visibilidad

Durante la verificación se confirmó exactamente un binding temporal:

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
role=roles/iam.securityReviewer
temporaryReviewerBindingCount=1
```

Este rol fue agregado manualmente por Paula para completar los readbacks IAM. Debe retirarse antes de cualquier nuevo provider write o deploy y su retiro debe confirmarse por readback.

## 4. Trigger root-fix

El workflow anterior de visibilidad no materializó ejecución con `pull_request:synchronize`. El nuevo verificador se instaló primero y luego se disparó mediante un evento `pull_request:edited`, manteniendo:

```text
PR_HEAD_SHA=github.event.pull_request.head.sha
```

La ejecución materializó correctamente. Esto demuestra que el problema recurrente del bloque anterior estaba en el carril de activación del workflow one-shot, no en el source lock ni en Google Cloud.

## 5. Fail-close

```text
workflowRemovalCommit=e76588a21bace175776c6878ce6b27301f6b7d70
requestDisableCommit=ce05006345fa4f3af0dfafd566edd0516ab639ff
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
secondAttempt=0
```

## 6. Estado seguro

```text
IAM writes by verifier=0
Cloud Build writes=0
Cloud Run deploys=0
Hosting deploys=0
provider reads=0
provider writes=0
SKIP13 executed=false
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
merge=false
production=false
```

## 7. Pendiente exacto

1. Retirar manualmente `roles/iam.securityReviewer` del principal Firebase Admin SDK.
2. Ejecutar un readback read-only que confirme que ese binding temporal desapareció.
3. Solo con PASS autorizar un nuevo deploy DEV del direct trusted runner.
4. Después continuar con SKIP13, Auth, smoke multirrol, validación humana y cutover.

## 8. Clasificación

- **Reusable CXOrbia:** identidad runtime aislada con fingerprint final y trigger `pull_request:edited` para workflows one-shot nuevos.
- **Exclusivo TyA:** cierre C6 previo a Auth y cutover.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** separación entre identidad de control-plane y runtime, least privilege y evidencia terminal.
- **Sin impacto Claude:** UI y módulos preservados.

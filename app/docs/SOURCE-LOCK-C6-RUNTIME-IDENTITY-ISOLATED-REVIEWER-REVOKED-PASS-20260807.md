# SOURCE LOCK — C6 runtime identity isolated + reviewer revoked PASS

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKED_PASS__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_PRODUCTION`

## Identidad runtime

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
uniqueId=112507526829412676643
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
decision=PASS_ISOLATED_RUNTIME_IDENTITY
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
```

## Revocación del rol temporal

El rol temporal `roles/iam.securityReviewer` había sido agregado únicamente a la identidad de control-plane `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` para permitir los readbacks IAM que demostraron el aislamiento de la identidad runtime. No era un rol de la identidad runtime.

Paula lo retiró manualmente. El readback terminal posterior confirmó:

```text
requestId=c6-iam-reviewer-revoke-readback-20260807-01
sourceLock=7b57957a297beb0505337c007ee89e6a02fba057
runId=31184231219
jobId=92884658675
artifactId=8996049168
artifactDigest=sha256:574dd060914cf69046d266f63a0eacb49f64919c9271898d9166eee3dc9b61bc
decision=PASS_TEMP_SECURITY_REVIEWER_EFFECTIVELY_REVOKED
effectiveSensitiveIamPermissions=[]
projectGetIamPolicyReturnCode=1
serviceAccountGetIamPolicyReturnCode=1
userManagedKeysListReturnCode=1
temporaryReviewerEffective=false
```

## Fail-close

```text
workflowRemovalCommit=9f75e76b3ac22165ab8503e0ab08d88c9f8945b7
requestDisableCommit=1d6cb4bdc549e9d2a2b385a7602a408cd1ebdfe6
workflowPresent=false
requestExecutable=false
allowedExecutions=0
```

## Estado seguro

```text
IAM writes by readback=0
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

## Siguiente paso

El cierre IAM previo al deploy queda PASS. El siguiente bloque autorizado debe ser un nuevo deploy DEV único del direct trusted runner; después continúan SKIP13 read-only, Auth sobre el plan congelado de 340 filas, smoke multirrol, validación humana y cutover autorizado.

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKED_PASS__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-REVIEWER-REVOKED-PASS-20260807.md`;
- request IAM revoke readback ejecutable: ninguno;
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

El source y el harness de `PR_HEAD_SHA=github.event.pull_request.head.sha` están corregidos. El ejecutor todavía no está desplegado.

## 3. Identidad runtime — PASS final

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
decision=PASS_ISOLATED_RUNTIME_IDENTITY
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=FINAL_ISOLATED_IDENTITY
```

## 4. Rol temporal de visibilidad — revocado PASS

El rol `roles/iam.securityReviewer` se añadió temporalmente a la identidad de control-plane `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` únicamente para completar los readbacks IAM. No pertenecía a `cxorbia-c6-runner-dev`.

Paula lo retiró manualmente. El readback terminal confirmó:

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

## 5. Root-fix del workflow one-shot

El patrón vigente para C6 one-shot es instalar primero el workflow y dispararlo después con `pull_request:edited`. Este patrón materializó correctamente tanto la verificación final de aislamiento como la verificación de revocación, manteniendo siempre `PR_HEAD_SHA=github.event.pull_request.head.sha`.

## 6. Fail-close

```text
workflowRemovalCommit=9f75e76b3ac22165ab8503e0ab08d88c9f8945b7
requestDisableCommit=1d6cb4bdc549e9d2a2b385a7602a408cd1ebdfe6
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
```

## 7. Diagnóstico de causa raíz acumulativo

Documento vigente:

```text
app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md
```

Causas demostradas:

1. geometría de permisos incorrecta del principal de control-plane;
2. carril one-shot efímero con `synchronize`, corregido con instalación previa + `edited`;
3. uso histórico de SHA sintético del PR, ya corregido con `pull_request.head.sha`.

No hay evidencia de una regresión general del frontend ni del plan Auth.

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

1. Autorizar un nuevo deploy DEV único del direct trusted runner.
2. Completar SKIP13 read-only.
3. Ejecutar Auth sobre el plan congelado de 340 filas con snapshot/rollback.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada a producción.

## 11. Estado seguro

```text
provider data reads=0
provider writes=0
IAM writes by readback=0
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

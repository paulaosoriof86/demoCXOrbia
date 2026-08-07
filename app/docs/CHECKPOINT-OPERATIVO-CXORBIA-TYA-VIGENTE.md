# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_RUNTIME_IDENTITY_ISOLATED_PASS__TEMP_SECURITY_REVIEWER_REVOKE_PENDING__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-RUNTIME-IDENTITY-ISOLATED-PASS-PENDING-REVIEWER-REVOKE-20260807.md`;
- request IAM final ejecutable: ninguno;
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

## 3. Identidad runtime — PASS

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

```text
decision=PASS_ISOLATED_RUNTIME_IDENTITY
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
fingerprintStatus=FINAL_ISOLATED_IDENTITY
```

## 4. Evidencia terminal

```text
requestId=c6-iam-runtime-isolation-readonly-final-20260807-01
sourceLock=a7357d4b0a80b164560423a673a6430e5a16b2d7
runId=31180615131
jobId=92872746963
artifactId=8994613975
artifactDigest=sha256:b4ff0ffe54dca09f07264109eb327c71d84be6e4256b058a364cd494d6348e9c
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
identity describe=PASS
user-managed keys read=PASS
service-account IAM policy read=PASS
project IAM policy read=PASS
runtime isolation classification=PASS
```

## 5. Rol temporal de visibilidad

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
role=roles/iam.securityReviewer
temporaryReviewerBindingCount=1
```

El rol fue agregado manualmente para completar los readbacks y continúa pendiente de retiro. No procede ningún provider write ni deploy hasta retirarlo y comprobar la revocación.

## 6. Root-fix del workflow one-shot

El workflow IAM VISIBILITY anterior no materializó run usando `pull_request:synchronize`. El verificador final se instaló primero y se disparó después mediante `pull_request:edited`, manteniendo el source lock sobre `github.event.pull_request.head.sha`.

```text
runMaterialized=true
runId=31180615131
result=PASS
```

Este patrón queda como root-fix para workflows C6 one-shot nuevos mientras PR #7 permanezca acumulativo.

## 7. Fail-close del verificador

```text
workflowRemovalCommit=e76588a21bace175776c6878ce6b27301f6b7d70
requestDisableCommit=ce05006345fa4f3af0dfafd566edd0516ab639ff
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
```

## 8. Diagnóstico de causa raíz acumulativo

Documento vigente:

```text
app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md
```

Causas demostradas:

1. **Geometría de permisos incorrecta del principal de control-plane:** capacidades amplias de Firebase/Cloud Run/Cloud Build, pero huecos en IAM create/read necesarios para C6.
2. **Carril one-shot efímero:** un workflow nuevo no materializó con `synchronize`; el trigger `edited` posterior sí materializó y pasó.
3. **SHA sintético del PR:** causa histórica ya corregida; no debe volver a usarse `GITHUB_SHA` para source lock C6.

No hay evidencia de que estos bloqueos sean una regresión general del frontend o del plan de datos/Auth.

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

1. Retirar manualmente `roles/iam.securityReviewer` del principal Firebase Admin SDK.
2. Ejecutar un readback read-only que demuestre `temporaryReviewerBindingCount=0`.
3. Autorizar un nuevo deploy DEV único del direct trusted runner.
4. Completar SKIP13 read-only.
5. Ejecutar Auth sobre el plan congelado de 340 filas con snapshot/rollback.
6. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
7. Validación humana.
8. Cutover/promoción autorizada a producción.

## 12. Estado seguro

```text
provider data reads=0
provider writes=0
IAM writes by final verifier=0
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

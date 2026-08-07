# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__IAM_VISIBILITY_EXECUTION_LANE_NOT_MATERIALIZED__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__ZERO_IAM_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-IAM-VISIBILITY-NO-EXECUTION-LANE-STOP-RETRY-20260806.md`;
- request IAM visibility ejecutable: ninguno;
- request IAM post-create ejecutable: ninguno;
- request IAM ADMIN ejecutable: ninguno;
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

El source lock y el harness de `PR_HEAD_SHA` continúan corregidos. El ejecutor no está desplegado.

## 3. Identidad runtime

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
displayName=cxorbia-c6-runner-dev
projectId=cxorbia-backend-dev
uniqueId=112507526829412676643
oauth2ClientId=112507526829412676643
```

La identidad fue creada manualmente y confirmada terminalmente mediante `describe`.

## 4. Readback IAM anterior

```text
requestId=c6-iam-runtime-identity-postcreate-readonly-20260806-01
runId=31135508722
jobId=92733827812
artifactId=8977774322
artifactDigest=sha256:c579dceb2d02df82dc5397ea2b0dcd1afbdc6cafcdd914f259ad33970e9d3ccb
```

Pasaron checkout exacto, request/source lock, claim único, Google Cloud authentication, gcloud setup e identity describe.

El principal conectado careció de:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

Siguen sin demostrarse terminalmente:

```text
zeroUserManagedKeys
zeroDirectServiceAccountBindings
zeroProjectRoles
```

Fingerprint provisional:

```text
ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
status=PROVISIONAL_INCOMPLETE_READBACK
final=false
```

## 5. Bloque IAM VISIBILITY autorizado

Paula autorizó un único grant/revoke temporal de `roles/iam.securityReviewer` a:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

con máximo dos IAM writes y obligación de revoke inmediato.

Carril source preparado:

```text
workflowCreateCommit=3a1bb800950e00ac5caa0482afa26d69429d7047
requestCreateCommit=6d14c9b4458f4b7a37efa77542f101d617b745b4
workflowTriggerCorrectionCommit=338dd13d73920b372d005092afd2cce6375152d9
requestRearmCommit=891a6acedcd620abbf70c4fc55d11b716c22d4dd
```

## 6. Bloqueo terminal del bloque IAM VISIBILITY

El workflow esperado no materializó un run observable. No se alcanzó Google Cloud ni se intentó el grant.

```text
workflowRunMaterialized=false
claimMaterialized=false
GoogleCloudAuthenticationReached=false
iamGrantAttempted=false
iamRevokeAttempted=false
IAMWrites=0
```

Clasificación segura:

```text
GITHUB_ACTIONS_NEW_WORKFLOW_NOT_MATERIALIZED
ADMINISTRATIVE_IAM_AUTHORITY_STILL_REQUIRED
STOP_RETRY=true
```

No se declara causa raíz del no-materializado más allá de la evidencia observable.

## 7. Fail-close IAM VISIBILITY

```text
workflowRemovalCommit=74ffa1c3049af2e79598b48ef6d3650c5bc6abb3
requestDisableCommit=2a3a08acce1b8d4ea57bedca9a70692e24c95910
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
allowedIamWrites=0
requestExecutable=false
```

No se reutilizarán el workflow ni request cerrados.

## 8. Contratos vigentes

```text
backend/contracts/c6-runtime-identity-postcreate-verification-v1.json
backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json
```

La decisión reconciliada continúa siendo que la identidad existe y está habilitada, pero su aislamiento final no está probado.

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

1. Resolver una vía administrativa IAM observable; el principal GitHub actual no puede autoelevarse de forma segura y no hay identidad administrativa conectada demostrada.
2. No recrear `cxorbia-c6-runner-dev`.
3. Obtener evidencia terminal de cero llaves administradas por usuario, cero bindings directos y cero roles de proyecto.
4. Generar fingerprint final y contrato PASS de identidad aislada.
5. Solo con PASS autorizar un nuevo deploy DEV del direct runner.
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

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__READBACK_INCOMPLETE__DIRECT_RUNNER_NOT_DEPLOYED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-IAM-POSTCREATE-READBACK-INCOMPLETE-STOP-RETRY-20260806.md`;
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

El source lock y el harness de `PR_HEAD_SHA` están corregidos. El ejecutor no está desplegado.

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

La identidad fue creada manualmente por Paula y confirmada terminalmente mediante `describe`.

## 4. Bloque IAM post-creación read-only

```text
requestId=c6-iam-runtime-identity-postcreate-readonly-20260806-01
requestCommit=e4a5538158980746f94f30ddea42dd1380f00caa
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

## 5. Bloqueo terminal

```text
decision=STOP_RETRY_READBACK_INCOMPLETE
```

El principal read-only disponible carece de:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

Por ello no quedaron demostrados terminalmente:

```text
zeroUserManagedKeys
zeroDirectServiceAccountBindings
zeroProjectRoles
```

## 6. Fingerprint

```text
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
status=PROVISIONAL_INCOMPLETE_READBACK
final=false
```

No debe usarse como PASS final de aislamiento.

## 7. Fail-close

```text
workflowRemovalCommit=795f2296a70b3f92169f409e7017b828fe0c486a
requestDisableCommit=0e12b33172f8d9df423b87fc5037c53b602691fc
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedExecutions=0
requestExecutable=false
secondAttempt=0
STOP_RETRY=true
```

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

1. Obtener una identidad o permiso temporal estrictamente read-only para leer llaves y políticas IAM.
2. No recrear `cxorbia-c6-runner-dev`.
3. Verificar cero llaves administradas por usuario, cero bindings directos y cero roles de proyecto.
4. Generar fingerprint final y contrato PASS de identidad aislada.
5. Solo con PASS autorizar un nuevo deploy DEV del ejecutor.
6. Mantener provider deshabilitado hasta terminal PASS.

## 11. Estado seguro

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

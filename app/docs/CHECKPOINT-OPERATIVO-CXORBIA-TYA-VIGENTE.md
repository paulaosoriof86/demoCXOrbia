# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_DIRECT_RUNNER_DEV_DEPLOY_PASS__PRIVATE_AUTHENTICATED__RUNTIME_ISOLATED__PROVIDER_BOUNDARY_OFF__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
- request direct runner ejecutable: ninguno;
- request SKIP13 ejecutable: ninguno;
- Auth ejecutado: no.

## 2. Direct trusted runner DEV — desplegado PASS

```text
service=cxorbia-c6-direct-runner-dev
region=us-central1
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
sourceGate=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
deployDecision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
revision=cxorbia-c6-direct-runner-dev-00001-2vz
serviceUrl=https://cxorbia-c6-direct-runner-dev-mzgge2pnia-uc.a.run.app
private=true
providerBoundaryEnabled=false
```

## 3. Ejecución terminal

```text
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
artifactId=8996863935
artifactDigest=sha256:d1c5b954bc69c2874aeb1e77136b53bf2b3d1699e1e1b03efddf198d8c0d8a0d
cloudBuildsExecuted=1
cloudRunDeploysExecuted=1
```

Todas las etapas del run terminaron success. No hubo segundo deploy.

## 4. Identidad runtime — preservada e aislada

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
uniqueId=112507526829412676643
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
identityDecision=PASS_ISOLATED_RUNTIME_IDENTITY
temporarySecurityReviewerRevoked=PASS
```

El deploy no creó bindings ni roles nuevos para la identidad runtime.

## 5. Endpoint, autenticación, lease e idempotencia

```text
unauthenticated /health=HTTP 403
authenticated /health=PASS
environment=DEV
runtimeSourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
providerBoundaryEnabled=false
providerReads=0
providerWrites=0
```

Primera invocación técnica:

```text
HTTP=202
decision=PASS_C6_DIRECT_TRUSTED_RUNNER_TECHNICAL_VALIDATION
leaseMode=single_instance_memory_dev
leaseTtlMs=600000
```

Duplicado:

```text
HTTP=409
decision=HOLD_C6_DIRECT_RUNNER_DUPLICATE_REJECTED
```

## 6. Rollback

El servicio no existía antes del bloque.

```text
rollbackType=DELETE_NEW_DEV_SERVICE
runtimeIdentityPreserved=true
rollbackPlan=PASS
rollbackExecuted=false
```

No fue necesario rollback porque todo el bloque terminó PASS.

## 7. SKIP13

El workflow histórico SKIP13 se materializó como efecto del evento PR `edited`, pero reconoció que no era su request exacto y saltó la ejecución real:

```text
claim=SKIPPED
credentialPreparation=SKIPPED
providerAdjudication=SKIPPED
SKIP13Executed=false
providerReads=0
providerWrites=0
```

No debe confundirse el éxito técnico de ese workflow con una adjudicación SKIP13 realizada.

## 8. Auth congelado

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
AuthExecuted=false
```

## 9. Fail-close

```text
workflowRemovalCommit=76dbc80634805e7ca4e77e423b2a846221014150
requestDisableCommit=f088078ef915eeb07e524faefb701dc258216593
workflowPresent=false
requestEnabled=false
requestConsumed=true
allowedCloudBuilds=0
allowedDeploys=0
```

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 11. Siguiente cadena exacta

1. Autorizar un único SKIP13 read-only explícito mediante el direct runner DEV ya desplegado.
2. Con SKIP13 cerrado, ejecutar Auth sobre el plan congelado de 340 filas con snapshot/rollback.
3. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
4. Validación humana.
5. Cutover/promoción autorizada a producción.

## 12. Estado seguro

```text
CloudBuildsExecuted=1
CloudRunDeploysExecuted=1
HostingDeploys=0
IAMWrites=0
providerReads=0
providerWrites=0
SKIP13Executed=false
AuthWrites=0
HRWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
merge=false
production=false
providerBoundaryEnabled=false
```

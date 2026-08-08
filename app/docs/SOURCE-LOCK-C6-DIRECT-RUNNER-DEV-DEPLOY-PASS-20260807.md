# SOURCE LOCK — C6 direct trusted runner DEV deploy PASS

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_DEPLOY_PASS__PRIVATE_AUTHENTICATED__RUNTIME_ISOLATED__PROVIDER_BOUNDARY_OFF__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Autorización consumida

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260807-03
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
runtime=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
runtimeFingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
allowedCloudBuilds=1
allowedDeploys=1
```

El request quedó consumido y deshabilitado; no existe autorización residual para un segundo build o deploy.

## 2. Evidencia terminal

```text
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
artifactId=8996863935
artifactDigest=sha256:d1c5b954bc69c2874aeb1e77136b53bf2b3d1699e1e1b03efddf198d8c0d8a0d
```

Pasaron:

```text
checkout exacto PR_HEAD_SHA=PASS
request/source lock=PASS
claim único=PASS
syntax/source gate=PASS_C6_DIRECT_RUNNER_SOURCE_GATE_V2
runtime predeploy describe=PASS
Cloud Build=PASS
Cloud Run deploy=PASS
private IAM surface=PASS
authenticated health=PASS
source lock runtime=PASS
lease=PASS
idempotency duplicate 409=PASS
rollback plan=PASS
```

## 3. Build y deploy

```text
cloudBuildsExecuted=1
cloudRunDeploysExecuted=1
image=gcr.io/cxorbia-backend-dev/cxorbia-c6-direct-runner-dev:5c467be8d7359e66b6362a07dd3908ada3cf1c17
revision=cxorbia-c6-direct-runner-dev-00001-2vz
serviceUrl=https://cxorbia-c6-direct-runner-dev-mzgge2pnia-uc.a.run.app
deployOutputUrl=https://cxorbia-c6-direct-runner-dev-87461567267.us-central1.run.app
traffic=100% revision 00001-2vz
```

El servicio no existía antes del bloque.

## 4. Privacidad y autenticación

El servicio quedó privado, sin `allUsers` ni `allAuthenticatedUsers` en su IAM policy.

```text
unauthenticated /health HTTP=403
authenticated /health=PASS
runtimeServiceAccount=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Health autenticado:

```text
ok=true
environment=DEV
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
providerBoundaryEnabled=false
providerReads=0
providerWrites=0
production=false
```

## 5. Lease e idempotencia

Primera invocación técnica:

```text
HTTP=202
decision=PASS_C6_DIRECT_TRUSTED_RUNNER_TECHNICAL_VALIDATION
leaseMode=single_instance_memory_dev
leaseTtlMs=600000
providerBoundaryAllowed=false
providerReads=0
providerWrites=0
```

Repetición del mismo request:

```text
HTTP=409
decision=HOLD_C6_DIRECT_RUNNER_DUPLICATE_REJECTED
providerBoundaryAllowed=false
providerReads=0
providerWrites=0
```

## 6. Aislamiento

La identidad runtime previamente validada se preservó sin cambios. El deploy no creó bindings IAM ni asignó roles provider/Firebase/Auth/Firestore/Storage/HR.

```text
runtimeUniqueId=112507526829412676643
runtimeFingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
iamWrites=0
providerBoundaryEnabled=false
providerReads=0
providerWrites=0
```

## 7. Rollback

Como el servicio no existía antes:

```text
rollbackType=DELETE_NEW_DEV_SERVICE
runtimeIdentityPreserved=true
rollbackExecuted=false
```

No fue necesario ejecutar rollback porque todas las validaciones terminaron PASS.

## 8. SKIP13 y límites

Un workflow histórico de SKIP13 se materializó por el evento `pull_request:edited`, pero clasificó el evento como no-request y saltó claim, credencial y ejecución.

```text
SKIP13 logical execution=SKIPPED
provider credential preparation=SKIPPED
provider adjudication=SKIPPED
SKIP13 executed=false
```

No hubo Auth, HR, Firestore, Rules, Storage ni Hosting writes; no hubo Make, Gemini, pagos, merge ni producción.

## 9. Fail-close

```text
workflowRemovalCommit=76dbc80634805e7ca4e77e423b2a846221014150
requestDisableCommit=f088078ef915eeb07e524faefb701dc258216593
workflowPresent=false
requestExecutable=false
allowedCloudBuilds=0
allowedDeploys=0
secondDeploy=0
```

## 10. Siguiente bloque exacto

El direct trusted runner DEV ya está desplegado y técnicamente validado, pero su provider boundary permanece deliberadamente apagado y su operación actual es únicamente `control_plane_self_test`. Por tanto, el siguiente bloque es una nueva adjudicación SKIP13 read-only explícita mediante el contrato y workflow source-safe ya existentes (`backend/contracts/c6-skip13-auth-access-adjudication-v1.json` y `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`), no una ejecución provider a través del runner actual. Solo después procede Auth sobre el plan congelado de 340 filas, smoke multirrol, validación humana y cutover autorizado.

## 11. Clasificación

- **Reusable CXOrbia:** runner privado, autenticación, lease, idempotencia, rollback y source lock.
- **Exclusivo TyA:** preparación para SKIP13/Auth Phase A.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** least privilege, identidad runtime aislada y fail-close.
- **Sin impacto Claude:** UI, rutas y módulos preservados.

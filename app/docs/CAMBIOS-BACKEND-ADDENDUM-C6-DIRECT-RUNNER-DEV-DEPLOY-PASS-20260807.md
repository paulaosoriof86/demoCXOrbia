# CAMBIOS BACKEND — Addendum C6 direct runner DEV deploy PASS

## Resultado

Se desplegó y validó una única instancia privada DEV del `direct trusted runner` usando exclusivamente la identidad runtime aislada ya aprobada.

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260807-03
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
artifactId=8996863935
artifactDigest=sha256:d1c5b954bc69c2874aeb1e77136b53bf2b3d1699e1e1b03efddf198d8c0d8a0d
revision=cxorbia-c6-direct-runner-dev-00001-2vz
decision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
```

## Infraestructura creada

```text
service=cxorbia-c6-direct-runner-dev
region=us-central1
runtime=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
private=true
providerBoundaryEnabled=false
cloudBuildsExecuted=1
cloudRunDeploysExecuted=1
```

No se otorgaron roles IAM ni se modificó la identidad runtime.

## Validaciones

- source gate: PASS;
- predeploy: PASS;
- Cloud Build: PASS;
- Cloud Run privado: PASS;
- acceso anónimo rechazado con HTTP 403;
- health autenticado: PASS;
- source lock runtime: PASS;
- lease: PASS;
- primera invocación técnica HTTP 202: PASS;
- duplicado HTTP 409: PASS;
- rollback plan: PASS;
- rollback no ejecutado porque el bloque terminó PASS.

## Safe state

```text
providerReads=0
providerWrites=0
SKIP13Executed=false
AuthWrites=0
HRWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HostingDeploys=0
IAMWrites=0
merge=false
production=false
```

## Archivos tocados/creados

- `.github/workflows/cxorbia-c6-direct-trusted-runner-dev-deploy-once-v3.yml` — temporal, ejecutado una vez y retirado;
- `backend/config/c6-direct-trusted-runner-dev-deploy-request-v3.json` — consumido y deshabilitado;
- `backend/contracts/c6-runtime-identity-isolated-final-v2.json` — reconciliado con revocación PASS;
- `backend/contracts/c6-direct-trusted-runner-dev-v2.json` — actualizado con deploy PASS;
- `backend/contracts/c6-execution-control-plane-v2.json` — actualizado con runner desplegado;
- `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`.

## Clasificación

- **Reusable CXOrbia:** patrón private Cloud Run + source lock + lease + idempotencia + rollback.
- **Exclusivo TyA:** preparación C6 previa a SKIP13/Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** least privilege y ejecución observable.
- **Sin impacto Claude:** módulos, rutas y UX preservados.

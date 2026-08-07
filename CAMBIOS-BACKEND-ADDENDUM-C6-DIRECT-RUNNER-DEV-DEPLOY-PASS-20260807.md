# CAMBIOS BACKEND — C6 direct runner DEV deploy PASS

```text
requestId=c6-direct-trusted-runner-dev-deploy-20260807-03
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
revision=cxorbia-c6-direct-runner-dev-00001-2vz
decision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
```

Se ejecutaron exactamente un Cloud Build y un deploy privado de Cloud Run DEV con la identidad runtime aislada `cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com`.

Pasaron source gate, predeploy, endpoint privado, autenticación, source lock, lease, idempotencia y rollback plan. Provider boundary quedó apagado; provider reads/writes, SKIP13, Auth writes, Hosting, merge y producción permanecieron en cero.

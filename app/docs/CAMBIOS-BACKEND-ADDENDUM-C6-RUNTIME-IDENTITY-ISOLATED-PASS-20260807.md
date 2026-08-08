# CAMBIOS BACKEND — Addendum C6 runtime identity isolated PASS

## Resultado

```text
decision=PASS_ISOLATED_RUNTIME_IDENTITY
runId=31180615131
jobId=92872746963
artifactId=8994613975
fingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
```

Verificado para `cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com`:

```text
exists=true
enabled=true
userManagedKeyCount=0
directServiceAccountBindingCount=0
projectRoleCount=0
```

El rol temporal `roles/iam.securityReviewer` permanece únicamente en la credencial de control-plane y debe ser retirado antes del siguiente provider write/deploy.

## Archivos

- creado y retirado `.github/workflows/cxorbia-c6-iam-runtime-isolation-readonly-final-v2.yml`;
- consumido `backend/config/c6-iam-runtime-isolation-readonly-final-request-v2.json`;
- creado `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
- creado source lock y diagnóstico de causa raíz del bloque.

## Clasificación

- Reusable CXOrbia: aislamiento runtime y trigger one-shot por `pull_request:edited`.
- Exclusivo TyA: cierre C6 pre-deploy/Auth.
- Claude/prototipo: sin cambios frontend.
- Academia: least privilege y separación de identidades.
- Sin impacto Claude: UI preservada.

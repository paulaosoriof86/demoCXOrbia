# CAMBIOS BACKEND — Addendum C6 direct runner DEV / STOP_RETRY

## Archivos creados

- `backend/runtime/c6-direct-trusted-runner/server.mjs`;
- `backend/runtime/c6-direct-trusted-runner/package.json`;
- `backend/runtime/c6-direct-trusted-runner/Dockerfile`;
- `backend/runtime/c6-direct-trusted-runner/cloudbuild.yaml`;
- `backend/contracts/c6-direct-trusted-runner-dev-v1.json`;
- `tools/qa/cxorbia-c6-direct-runner-source-gate.mjs`;
- `backend/config/c6-direct-trusted-runner-dev-deploy-request.json`;
- `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-DEPLOY-STOP-RETRY-20260806.md`.

## Archivo temporal retirado

- `.github/workflows/cxorbia-c6-direct-trusted-runner-dev-deploy-once.yml`.

## Resultado

```text
runId=31131197140
jobId=92720222820
failure=TEST_HARNESS_PULL_REQUEST_SHA_CONTEXT_MISMATCH
deploysExecuted=0
STOP_RETRY=true
```

La ejecución se detuvo antes de claim, Google Cloud auth, Cloud Build, Cloud Run, IAM, endpoint y proveedor. El request quedó deshabilitado y el workflow temporal fue retirado.

## Clasificación

- Reusable CXOrbia: contrato y runtime técnico fuente; corrección de contexto SHA para eventos `pull_request`.
- Exclusivo TyA: ningún dato ni operación TyA ejecutados.
- Claude/prototipo: sin cambios frontend.
- Academia: evidencia de clasificación TEST_HARNESS frente a PRODUCT/INFRASTRUCTURE.
- Sin impacto Claude: módulos y UX preservados.

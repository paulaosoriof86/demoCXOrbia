# CAMBIOS BACKEND — Addendum C6 direct runner IAM denied

## Archivos creados en el bloque

- `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
- `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
- `backend/config/c6-direct-trusted-runner-dev-deploy-request-v2.json`;
- `app/docs/SOURCE-LOCK-C6-DIRECT-TRUSTED-RUNNER-DEV-IAM-CREATE-DENIED-STOP-RETRY-20260806.md`.

## Archivo temporal retirado

- `.github/workflows/cxorbia-c6-direct-trusted-runner-dev-deploy-once-v2.yml`.

## Resultado

```text
runId=31132278764
jobId=92723768448
sourceGate=PASS
failure=IAM_PERMISSION_DENIED_SERVICE_ACCOUNT_CREATE
permission=iam.serviceAccounts.create
deploysExecuted=0
successfulIAMWrites=0
STOP_RETRY=true
```

La fuente y el harness corregido quedaron validados. El bloqueo restante es exclusivamente IAM para crear la identidad runtime aislada.

## Clasificación

- Reusable CXOrbia: source lock por PR head, separación deployer/runtime y fail-close pre-Build.
- Exclusivo TyA: ningún dato ni operación TyA ejecutados.
- Claude/prototipo: sin cambios frontend.
- Academia: least privilege e intento denegado versus write efectivo.
- Sin impacto Claude: módulos y UX preservados.

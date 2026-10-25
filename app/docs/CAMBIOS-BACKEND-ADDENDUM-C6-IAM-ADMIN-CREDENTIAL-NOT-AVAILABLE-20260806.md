# CAMBIOS BACKEND — Addendum C6 IAM ADMIN credential not available

## Archivos y carril

- se creó temporalmente `.github/workflows/cxorbia-c6-iam-admin-runtime-identity-create-once-v1.yml` y luego se retiró;
- se creó y consumió `backend/config/c6-iam-admin-runtime-identity-create-request-v1.json`;
- se actualizó `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
- se creó `app/docs/SOURCE-LOCK-C6-IAM-ADMIN-CREDENTIAL-NOT-AVAILABLE-STOP-RETRY-20260806.md`.

## Resultado

```text
runId=31133874657
jobId=92728797539
failureClassification=ADMIN_CREDENTIAL_NOT_AVAILABLE
GCPAuthentication=0
serviceAccountCreates=0
keysCreated=0
rolesAssigned=0
IAMWrites=0
```

El request, source lock y claim pasaron. El preflight bloqueó antes de Google Cloud porque no existe una credencial administrativa configurada en el carril.

## Clasificación

- Reusable CXOrbia: preflight de credencial administrativa y fail-close.
- Exclusivo TyA: identidad runtime C6 pendiente.
- Claude/prototipo: sin cambios frontend.
- Academia: autorización no equivale a credencial disponible.
- Sin impacto Claude: operación funcional preservada.

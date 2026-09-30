# CAMBIOS BACKEND — Addendum C6 IAM read-only inventory

## Archivos creados

- `.github/workflows/cxorbia-c6-iam-readonly-inventory-once-v1.yml` — temporal, luego retirado;
- `backend/config/c6-iam-readonly-inventory-request-v1.json` — consumido y deshabilitado;
- `backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json`;
- `app/docs/SOURCE-LOCK-C6-IAM-READONLY-INVENTORY-ADMIN-IDENTITY-CREATION-REQUIRED-20260806.md`.

## Resultado

```text
runId=31133025584
jobId=92726136842
serviceAccountsListed=2
projectIamPolicyRead=false
missingPermission=resourcemanager.projects.getIamPolicy
candidateCount=0
decision=ADMIN_IDENTITY_CREATION_REQUIRED
```

Las únicas identidades visibles fueron Default Compute y Firebase Admin SDK; ambas quedaron excluidas. No hubo IAM writes, deploy ni provider reads.

## Clasificación

- Reusable CXOrbia: inventario source-safe y fingerprint de identidades.
- Exclusivo TyA: bloqueo de identidad runtime para C6.
- Claude/prototipo: sin cambios frontend.
- Academia: least privilege e inventario parcial.
- Sin impacto Claude: operación funcional preservada.

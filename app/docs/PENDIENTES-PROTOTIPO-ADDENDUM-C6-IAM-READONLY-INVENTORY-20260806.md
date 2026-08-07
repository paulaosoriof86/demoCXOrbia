# PENDIENTES PROTOTIPO — Addendum C6 IAM read-only inventory

## Pendiente real

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
requiredIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

No existe una identidad user-managed limpia reutilizable. Las únicas cuentas listadas son Default Compute y Firebase Admin SDK, ambas excluidas.

La creación de la identidad requiere autorización administrativa separada. Debe quedar sin roles de proyecto, provider, Firebase, Auth, Firestore, Storage, HR, Cloud Build o administrativos.

## No reusar

- request `c6-iam-readonly-inventory-20260806-01`;
- workflow retirado `cxorbia-c6-iam-readonly-inventory-once-v1.yml`;
- run `31133025584`;
- job `92726136842`.

# CAMBIOS BACKEND — C6 IAM read-only inventory

Se ejecutó un único inventario IAM read-only sobre `cxorbia-backend-dev`.

```text
serviceAccountsListed=2
projectIamPolicyRead=false
missingPermission=resourcemanager.projects.getIamPolicy
candidateCount=0
decision=ADMIN_IDENTITY_CREATION_REQUIRED
```

Identidades encontradas:

- Default Compute service account — excluida;
- Firebase Admin SDK service account — excluida.

No hubo IAM writes, deploy, provider reads, SKIP13, merge ni producción.

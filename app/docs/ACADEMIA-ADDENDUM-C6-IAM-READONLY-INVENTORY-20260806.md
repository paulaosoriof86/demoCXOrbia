# ACADEMIA — Addendum C6 IAM read-only inventory

## Aprendizaje reusable

Una identidad puede tener permiso para listar cuentas de servicio y aun así no poder leer el IAM policy del proyecto. La visibilidad IAM es granular:

```text
iam.serviceAccounts.list=permitido
resourcemanager.projects.getIamPolicy=denegado
```

El inventario parcial todavía permitió una decisión determinística porque las únicas identidades existentes eran cuentas predeterminadas o asociadas a Firebase Admin SDK, ambas incompatibles con el aislamiento requerido.

## Clasificación

```text
READ_ONLY_CONTROL_PLANE=true
IAM_WRITE=false
PROVIDER_DATA_READ=false
DEPLOY=false
DECISION=ADMIN_IDENTITY_CREATION_REQUIRED
```

# PENDIENTES PROTOTIPO — Addendum C6 IAM post-creation readback

## Estado real

```text
identityExists=true
identityEnabled=true
uniqueId=112507526829412676643
isolatedIdentityFinalPass=false
decision=STOP_RETRY_READBACK_INCOMPLETE
```

## Pendiente único

Conseguir visibilidad IAM read-only suficiente para verificar:

```text
zero user-managed keys
zero direct service-account IAM bindings
zero direct project roles
```

Permisos faltantes observados:

```text
iam.serviceAccountKeys.list
iam.serviceAccounts.getIamPolicy
resourcemanager.projects.getIamPolicy
```

No recrear la cuenta. No reutilizar request, workflow, run `31135508722` ni job `92733827812`.

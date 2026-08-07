# PENDIENTES PROTOTIPO — Addendum C6 IAM ADMIN credential not available

## Pendiente real

```text
decision=ADMIN_CREDENTIAL_CONFIGURATION_REQUIRED
requiredTarget=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Antes de cualquier nueva creación debe existir un mecanismo administrativo válido para `cxorbia-backend-dev`:

- credencial administrativa configurada en GitHub sin exponer el secreto; o
- OIDC administrativo con trust relationship válida.

No reutilizar Default Compute, Firebase Admin SDK, request `c6-iam-admin-runtime-identity-create-20260806-01`, workflow retirado, run `31133874657` ni job `92728797539`.

## Estado

```text
runtimeIdentityCreated=false
directRunnerDeploy=0
IAMWrites=0
STOP_RETRY=true
```

# PENDIENTES PROTOTIPO — Addendum C6 direct runner IAM denied

## Bloqueo real

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
missingPermission=iam.serviceAccounts.create
runtimeIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

La fuente y el harness corregido ya pasaron. No repetir diagnóstico de PR head ni source lock.

## Siguiente condición

Antes de un nuevo deploy debe existir una identidad administrativa capaz de precrear la cuenta runtime aislada sin roles de proyecto, o una autorización temporal mínima equivalente con retiro posterior.

## No reusar

- request `c6-direct-trusted-runner-dev-deploy-20260806-02`;
- workflow V2 retirado;
- run `31132278764`;
- job `92723768448`.

```text
requestExecutable=false
deploysExecuted=0
STOP_RETRY=true
```

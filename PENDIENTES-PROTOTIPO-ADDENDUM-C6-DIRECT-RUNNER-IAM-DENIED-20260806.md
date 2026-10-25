# PENDIENTES PROTOTIPO — C6 direct runner IAM denied

El carril directo permanece fuente-ready y no desplegado.

Bloqueo exacto:

```text
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
missingPermission=iam.serviceAccounts.create
runtimeIdentity=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

La siguiente acción debe resolver únicamente la creación administrativa de la identidad runtime aislada, sin reutilizar el request, workflow, run ni job consumidos.

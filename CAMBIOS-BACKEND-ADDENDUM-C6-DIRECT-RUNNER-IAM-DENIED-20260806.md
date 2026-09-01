# CAMBIOS BACKEND — C6 direct runner IAM denied

Se validaron el source lock corregido, el request exclusivo y el source gate V2. GitHub Actions autenticó correctamente contra Google Cloud, pero la identidad de despliegue no pudo crear la cuenta runtime aislada.

```text
runId=31132278764
jobId=92723768448
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
missingPermission=iam.serviceAccounts.create
deploysExecuted=0
successfulIAMWrites=0
CloudBuild=0
CloudRun=0
STOP_RETRY=true
```

El workflow temporal fue retirado y el request quedó deshabilitado.

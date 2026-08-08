# CAMBIOS BACKEND — C6 IAM ADMIN credential not available

El carril autorizado pasó source lock y claim, pero no encontró una credencial administrativa configurada.

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

Se aplicó STOP_RETRY, se retiró el workflow y se deshabilitó el request.

# PHASE A TRACKER — Addendum C6 direct runner IAM denied

## Estado del carril directo

```text
directRunnerSource=READY
sourceIdentityGate=PASS
sourceGateV2=PASS
googleCloudAuthentication=PASS
runtimeIdentityCreate=DENIED
directRunnerDeploy=NOT_EXECUTED
endpoint=NOT_AVAILABLE
authenticatedInvocation=NOT_VALIDATED
leaseDuplicateRejection=NOT_VALIDATED
rollback=NOT_REQUIRED_PRE_WRITE_FAILURE
providerBoundaryEnabled=false
```

## Evidencia

```text
sourceLock=5d95130a9813ed04461218fbc96c5b9c52c84b1f
runId=31132278764
jobId=92723768448
artifactId=8976504179
failurePermission=iam.serviceAccounts.create
STOP_RETRY=true
secondAttempt=0
```

## Phase A preservada

El plan Auth de 340 filas, snapshot/rollback, smoke acumulativo, HR viva, frontend acumulativo, shoppers, visitas, certificaciones, liquidaciones, Finanzas, Portales y Reservas continúan sin cambios.

## Próximo gate

Resolver únicamente la capacidad administrativa para precrear la identidad runtime aislada. No repetir el diagnóstico de source lock ni reutilizar request/workflow/run/job consumidos.

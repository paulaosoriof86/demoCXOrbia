# CAMBIOS BACKEND — C6 direct runner DEV / STOP_RETRY

Se preparó el runtime fuente `direct_trusted_runner`, su contrato, contenedor, Cloud Build y gate source-safe. El único run autorizado fue `31131197140`, job `92720222820`.

La ejecución falló en el validador preprovider por usar `GITHUB_SHA` como si fuera el head real del PR. En eventos `pull_request`, ese valor representa el merge commit sintético; el checkout estaba fijado a `github.event.pull_request.head.sha`.

```text
deploysExecuted=0
CloudBuild=0
CloudRun=0
IAMWrites=0
providerReads=0
providerWrites=0
STOP_RETRY=true
```

El workflow temporal fue retirado y el request quedó deshabilitado.

# ACADEMIA — Addendum C6 direct runner DEV / STOP_RETRY

## Aprendizaje reusable

Un workflow `pull_request` maneja dos identidades SHA distintas:

- `github.event.pull_request.head.sha`: último commit real de la rama head;
- `GITHUB_SHA`: merge commit sintético de `refs/pull/<n>/merge`.

Cuando el checkout se fija al head real, el validador debe comparar contra el mismo `pull_request.head.sha`. Mezclar ambos contextos genera un falso drift antes de ejecutar el producto o la infraestructura.

## Clasificación del fallo

```text
PRODUCT=false
TEST_HARNESS=true
INFRASTRUCTURE=false
GOVERNANCE=false
PROVIDER=false
```

## Evidencia

```text
runId=31131197140
jobId=92720222820
failureStep=Validate exact one-shot deployment request
GoogleCloudAuth=skipped
CloudBuild=skipped
CloudRunDeploy=skipped
```

La separación de fases permitió probar que el fallo no cruzó la frontera de Google Cloud ni la frontera provider.

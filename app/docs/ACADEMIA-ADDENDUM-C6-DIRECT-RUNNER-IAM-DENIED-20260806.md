# ACADEMIA — Addendum C6 direct runner IAM denied

## Aprendizaje reusable

La autenticación correcta a Google Cloud no implica autorización suficiente para administrar IAM. En este bloque:

```text
GoogleCloudAuthentication=PASS
sourceGate=PASS
iam.serviceAccounts.create=DENIED
```

La separación entre identidad de despliegue e identidad runtime permite aplicar mínimo privilegio, pero exige una ruta administrativa explícita para crear la identidad aislada.

## Clasificación

```text
SOURCE=true
TEST_HARNESS=false
PRODUCT=false
IAM=true
CLOUD_BUILD=false
CLOUD_RUN=false
PROVIDER=false
```

Un intento IAM denegado no constituye una mutación exitosa. El fail-close detuvo Build, Run y cualquier frontera provider.

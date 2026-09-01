# ACADEMIA — Addendum C6 IAM visibility no execution lane

## Aprendizaje reusable

Una autorización válida y una preparación source-safe no equivalen a una ejecución efectiva. Cuando el workflow esperado no materializa un run observable, la operación debe cerrarse sin inferir que el proveedor fue alcanzado.

```text
authorizationValid=true
sourcePrepared=true
workflowRunMaterialized=false
providerReached=false
IAMWrites=0
STOP_RETRY=true
```

Este bloque refuerza la separación entre intención, carril, ejecución y evidencia terminal.

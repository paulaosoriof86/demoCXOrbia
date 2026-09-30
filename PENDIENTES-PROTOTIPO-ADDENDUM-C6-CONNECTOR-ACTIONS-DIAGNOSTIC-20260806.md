# PENDIENTES PROTOTIPO — Addendum C6 conector / Actions

## Pendiente crítico

`C6-ACTIONS-SCHEDULER-CAUSE-NOT-PROVEN`

El conector no expone política Actions, estado del workflow, audit log, tipo exacto de token ni listado integral de runs. La instalación tampoco recibe eventos `push` o `workflow_run`.

```text
rootCauseProven=false
observabilityGapProven=true
STOP_RETRY=true
newTrigger=0
newSKIP13Request=0
```

Este pendiente mantiene bloqueados la adjudicación SKIP13, el repair Auth y la cadena posterior de smoke/cutover. No existe pendiente frontend nuevo.

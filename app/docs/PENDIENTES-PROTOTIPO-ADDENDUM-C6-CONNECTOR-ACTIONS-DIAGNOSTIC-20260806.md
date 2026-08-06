# PENDIENTES PROTOTIPO — Addendum C6 conector / Actions

**Fecha:** 2026-08-06

## P0 de control plane

`C6-ACTIONS-SCHEDULER-CAUSE-NOT-PROVEN`

Evidencia:

- rama, path y orden del workflow/request coinciden;
- el conector tiene acceso administrativo y de push;
- existe un run histórico exitoso en el repositorio;
- el actor visible es el mismo en el caso histórico y en el caso no ejecutado;
- la instalación del conector no recibe eventos `push` ni `workflow_run`;
- la consulta disponible de runs filtra únicamente eventos `pull_request`;
- no están disponibles Actions permissions, estado del workflow, audit log ni tipo exacto del token del write.

```text
rootCauseProven=false
STOP_RETRY=true
newTrigger=0
newSKIP13Request=0
```

## Impacto

El pendiente mantiene bloqueados:

1. adjudicación terminal de los 13 perfiles SKIP13;
2. clasificación del perfil `7cc28c78de9bfda01d14`;
3. autorización posterior del repair Auth;
4. smoke acumulativo y cutover.

## Criterio de cierre

Debe obtenerse evidencia administrativa read-only que permita identificar al menos:

- política Actions actual;
- estado enabled/disabled del workflow;
- actor y tipo exacto de token;
- evento push recibido por GitHub;
- decisión del scheduler o listado integral de runs.

No existe pendiente frontend nuevo.

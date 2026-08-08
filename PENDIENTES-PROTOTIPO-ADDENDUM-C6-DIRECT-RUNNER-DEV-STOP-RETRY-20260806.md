# PENDIENTES PROTOTIPO — C6 direct runner DEV / STOP_RETRY

El runtime fuente está listo, pero el servicio no existe en DEV.

Un bloque futuro deberá crear un request y workflow nuevos que usen exclusivamente:

```text
PR_HEAD_SHA=${{ github.event.pull_request.head.sha }}
checkoutRef=PR_HEAD_SHA
validatedHead=PR_HEAD_SHA
```

No se reutilizan el request consumido, el run `31131197140`, el job `92720222820` ni el workflow retirado.

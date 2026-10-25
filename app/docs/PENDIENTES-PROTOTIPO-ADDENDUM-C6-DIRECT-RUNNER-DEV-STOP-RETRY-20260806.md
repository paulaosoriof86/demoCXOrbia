# PENDIENTES PROTOTIPO — Addendum C6 direct runner DEV

## Pendiente técnico real

El runtime fuente está preparado, pero no desplegado.

Antes de cualquier nuevo intento debe existir autorización separada y un carril nuevo que use:

```text
PR_HEAD_SHA=${{ github.event.pull_request.head.sha }}
checkoutRef=PR_HEAD_SHA
validatedHead=PR_HEAD_SHA
```

No utilizar `GITHUB_SHA` para validar el head dentro de un evento `pull_request`.

## No reusar

- request `c6-direct-trusted-runner-dev-deploy-20260806-01`;
- run `31131197140`;
- job `92720222820`;
- workflow temporal retirado.

## Estado

```text
requestExecutable=false
deploysExecuted=0
providerBoundaryEnabled=false
STOP_RETRY=true
```

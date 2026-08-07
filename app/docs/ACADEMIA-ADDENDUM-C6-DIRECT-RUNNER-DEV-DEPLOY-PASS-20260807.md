# ACADEMIA — Addendum C6 direct runner DEV deploy PASS

## Aprendizajes reutilizables

El bloque demuestra separación efectiva entre identidad de control-plane e identidad runtime. La identidad runtime puede operar un servicio Cloud Run sin recibir roles de proyecto ni credenciales persistentes.

El patrón validado combina:

```text
source lock exacto sobre pull_request.head.sha
runtime identity aislada
servicio privado
autenticación OIDC
provider boundary deshabilitado
lease temporal
rechazo idempotente de duplicados
rollback definido antes del cambio
one-shot request consumible
```

La primera invocación técnica devolvió HTTP 202 y una repetición idéntica devolvió HTTP 409, demostrando el gate de idempotencia sin acceder a datos provider.

## Evidencia

```text
runId=31186229092
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
revision=cxorbia-c6-direct-runner-dev-00001-2vz
providerReads=0
providerWrites=0
production=false
```

## Clasificación

- Reusable CXOrbia: sí.
- Exclusivo cliente: no en infraestructura base.
- Claude/prototipo: sin impacto.
- Academia: evidencia de least privilege, fail-close e idempotencia.
- Sin impacto Claude: sí.

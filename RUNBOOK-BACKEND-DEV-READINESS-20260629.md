# RUNBOOK-BACKEND-DEV-READINESS-20260629

## Objetivo

Ejecutar una revisión local compacta antes de avanzar a conexión preview DEV.

## Comando

```text
node firebase/client-write-tools/run-backend-dev-readiness-dry-run.mjs
```

Si se quiere indicar HR V4 manualmente:

```text
node firebase/client-write-tools/run-backend-dev-readiness-dry-run.mjs --file="firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json"
```

## Qué corre

```text
validate-backend-runtime-files.mjs
run-finance-benefits-full-pipeline-dry-run.mjs si existe HR V4
```

## Salidas

```text
firebase/private-output/backend-dev-readiness-dry-run.json
firebase/private-output/backend-dev-readiness-dry-run-summary.md
```

## Interpretación

```text
OK = se puede preparar conexión preview DEV.
REVIEW = revisar reporte antes de avanzar.
FAIL = detener.
```

## No hace

No escribe datos, no publica hosting, no cambia reglas y no toca producción.

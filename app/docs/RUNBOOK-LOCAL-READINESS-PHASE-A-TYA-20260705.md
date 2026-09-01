# Runbook local readiness Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Se agrego un camino local unico para ejecutar la cadena completa de readiness preview de Phase A, desde el manifest sintetico hasta la matriz de produccion controlada.

## Archivos agregados

1. `app/contracts/phase-a-local-readiness-runbook.tya.contract.json`
   - Contrato del runbook local.
   - Define pasos ordenados.
   - Mantiene todos los gates apagados.

2. `tools/migration/tya-phase-a-local-readiness-runbook.mjs`
   - Orquestador Node local.
   - Ejecuta la cadena completa.
   - Guarda resultados en `_diagnosticos/tya-release-readiness`.
   - Genera indice local de salidas.

## Pasos de salida

- `00-phase-a-local-readiness-runbook-index-*.json`
- `01-synthetic-pack-runner-*.json`
- `02-synthetic-pack-readiness-map-*.json`
- `03-release-readiness-snapshot-input-*.json`
- `04-release-readiness-snapshot-report-*.json`
- `05-release-readiness-sanitized-report-*.md`
- `05b-release-readiness-sanitized-summary-*.json`
- `06-controlled-production-matrix-*.md`
- `06b-controlled-production-matrix-*.json`

## Ejecucion local

Desde la raiz del repo:

`node tools/migration/tya-phase-a-local-readiness-runbook.mjs`

Para validadores locales preview, despues de revisar el primer resultado:

`node tools/migration/tya-phase-a-local-readiness-runbook.mjs --executeValidators`

## Estado seguro

Sin frontend modificado, sin deploy, sin merge, sin produccion, sin import real, sin escrituras reales, sin proveedores reales, sin pagos reales y sin datos sensibles.

## Bloqueo de source lock

Aunque el runbook local complete, `prototype_audit` sigue bloqueado mientras el P0 frontend de V87 no este corregido y auditado.

## Nota

La ruta unica se implemento en Node para evitar detener el avance. No necesito nada de Paula para este bloque.

# Preflight local readiness Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Agregar una revision previa local antes de ejecutar el runbook Phase A. El preflight valida que existan archivos minimos, contratos principales y gates apagados.

## Archivos agregados

1. `app/contracts/local-readiness-preflight-phase-a.tya.contract.json`
   - Contrato reducido del preflight.
   - Define rama esperada, archivos minimos y contratos minimos.

2. `tools/migration/tya-local-readiness-preflight.mjs`
   - Script Node de preflight.
   - Revisa rama local si Git esta disponible.
   - Revisa existencia de archivos y contratos.
   - Revisa flags principales para evitar activaciones reales.

## Ejecucion local

Desde la raiz del repo:

`node tools/migration/tya-local-readiness-preflight.mjs`

Si el resultado es `preflight_preview_ready`, se puede ejecutar despues:

`node tools/migration/tya-phase-a-local-readiness-runbook.mjs`

## Estado seguro

Este preflight no ejecuta importaciones, no escribe datos, no llama proveedores y no cambia frontend.

## Nota

No necesito nada de Paula para este bloque. Cuando necesite accion manual o dato externo, lo pedire de forma directa.

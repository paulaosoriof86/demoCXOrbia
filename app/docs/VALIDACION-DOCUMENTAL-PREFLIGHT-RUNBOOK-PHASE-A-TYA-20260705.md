# Validacion documental preflight/runbook Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Agregar una validacion documental antes de pedir cualquier ejecucion local del preflight o del runbook Phase A.

Este bloque revisa consistencia entre contratos, scripts, documentos, comandos y salidas esperadas.

## Archivos agregados

1. `app/contracts/local-readiness-consistency-phase-a.tya.contract.json`
   - Contrato de consistencia documental.
   - Define archivos a revisar, comandos esperados y prefijos de salida esperados.

2. `tools/migration/tya-local-readiness-consistency-check.mjs`
   - Script Node de validacion documental.
   - Revisa existencia de archivos.
   - Revisa que comandos esten documentados.
   - Revisa que salidas esperadas esten documentadas y guionizadas.
   - Revisa referencias principales de scripts.
   - Revisa que flags principales no esten activos en contratos.

## Ejecucion local

Desde la raiz del repo:

`node tools/migration/tya-local-readiness-consistency-check.mjs`

Si el resultado es `consistency_preview_ready`, el siguiente paso local es:

`node tools/migration/tya-local-readiness-preflight.mjs`

Si el preflight queda `preflight_preview_ready`, luego se ejecuta:

`node tools/migration/tya-phase-a-local-readiness-runbook.mjs`

## Estado seguro

Esta validacion no ejecuta el runbook, no importa datos, no escribe en servicios, no llama proveedores y no toca frontend.

## Uso esperado

La secuencia segura queda:

1. Consistency check documental.
2. Preflight local.
3. Runbook local structure preview.
4. Revision de salidas.
5. Solo despues, runbook con validadores locales preview si aplica.

## Decision

La validacion documental no autoriza produccion ni source lock. El P0 frontend sigue bloqueando salida controlada hasta que Claude entregue candidata correctiva con delta real y auditoria aprobada.

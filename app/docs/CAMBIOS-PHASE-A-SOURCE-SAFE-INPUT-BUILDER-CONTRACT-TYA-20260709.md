# Cambios - Phase A source-safe input builder contract TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Archivos agregados

- `backend/contracts/phase-a-source-safe-input-builder-contract-v1.json`
- `tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs`
- `app/docs/PHASE-A-SOURCE-SAFE-INPUT-BUILDER-CONTRACT-TYA-20260709.md`

## Objetivo

Definir como construir localmente el JSON source-safe que alimenta el real-data domain readiness pack desde HR/export original sanitizado TyA, sin subir datos privados al repo y sin activar runtime, imports ni writes.

## Impacto Phase A real TyA

Permite preparar el siguiente paso para evaluar datos reales/sanitizados de TyA sin pedirlos en chat, manteniendo HR como fuente operacional, junio como liquidaciones/pagos, certificaciones preservadas, shoppers historicos y cuestionarios configurables.

## Inputs permitidos

- HR source-safe/full-flow report.
- Export original TyA sanitizado.
- Project config source-safe.

## Output futuro

`tya-phase-a-domains.source-safe.local.json`, solo local, no commiteado, con flags de seguridad en false y dominios Phase A completos.

## Guardrails

- No subir output local al repo.
- No copiar filas HR crudas.
- No copiar datos sensibles.
- No fixture como real.
- No `.tmp` derivado como original.
- No base vieja.
- No deduplicacion visual.
- No pago real.
- No pedir certificacion preservada sin revision.
- No inventar links de cuestionario.

## Impacto backend reusable

Patron reusable de builder local source-safe para generar inputs de readiness antes de adapter/runtime.

## Impacto Claude/prototipo

Claude debe mostrar estados honestos si fuente/build/dry-run no esta listo; no debe presentar runtime ni datos reales si solo existe contrato.

## Impacto Academia

Debe explicar builder local, output no commiteado, derivacion de ids estables, no deduplicar por nombre, junio como pago/liquidacion y que builder no importa ni escribe.

## Estado seguro

Sin cambios en `/app/modules` o `/app/core`, builder no ejecutado, output local no commiteado, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.

## Commits

- `26856f268f0d374531dbc20e435ddd57b0c191a0`
- `6b25777198e16c6d97fe0e2b822070224b3a278c`
- `85096345227a0e96a8f916ef05c3141084244448`

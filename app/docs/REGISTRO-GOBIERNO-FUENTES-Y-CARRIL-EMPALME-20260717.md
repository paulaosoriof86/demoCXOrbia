# REGISTRO — GOBIERNO DE FUENTES Y CARRIL DE EMPALME

Fecha: 2026-07-17

## Documentos canónicos creados

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

## Objetivo

Evitar que futuras candidatas se auditen sin un carril capaz de empalmarlas en la misma sesión y evitar que múltiples versiones de fuentes compitan entre sí.

## Reglas cerradas

- El índice se lee primero.
- Solo una fuente maestra activa por tema.
- Las fuentes canónicas se reemplazan; no se duplican con fechas o `(1)`.
- Antes de auditar una candidata se exige `EXECUTION_LANE_READY`.
- Auditoría y empalme ocurren en el mismo workspace file-aware.
- Candidata GO implica `APPLY_DELTA_DIRECTLY` inmediato.
- No `update_file` serial, blobs, trees, workflows, PowerShell, ramas o PR nuevos.
- `main` queda prohibido como destino accidental.
- Paula solo entrega la candidata.

## Fuentes activas que deben retirarse del proyecto

- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-COMPLETO.md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-20260716(1).md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-ACTUALIZADO-20260717.md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-ACTUALIZADO-20260717(1).md`

Los históricos permanecen en el repositorio, pero no compiten como Fuentes activas.

## Estado V159

- `AUDITED_GO_READY_DIRECT_APPLY`.
- No empalmada.
- No reauditar.
- No solicitar V160.
- Siguiente bloque: abrir en workspace file-aware y aplicar directamente sobre `docs-tya-v6-v71-audit`.

## Estado seguro

Sin merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

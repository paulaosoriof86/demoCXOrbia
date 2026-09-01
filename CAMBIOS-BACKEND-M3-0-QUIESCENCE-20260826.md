# CAMBIOS BACKEND — M3-0 QUIESCENCE / SINGLE AUTHORITY BARRIER

Fecha: 2026-08-26

## Estado

M1/M2/F0 permanecen cerrados. M3 queda congelado en 3 tombstones / 27 residuales hasta que M3-0 cierre PASS. PR #7 está cerrado temporalmente, sin merge.

## Hallazgo causal adicional

La primera clean probe con PR cerrado redujo drásticamente el fan-out, pero todavía aparecieron runs `push` de workflows que en Git estaban aparentemente inertes. Los runs terminaron inmediatamente y tenían cero jobs. Se reprodujo la sintaxis exacta del blob inerte y se demostró la causa: el scalar `run: echo 'HISTORICAL_INERT_M3: ...'` era YAML inválido porque el `:` quedaba dentro de un scalar no citado a nivel YAML.

Eso explica por qué GitHub seguía creando failures sin ejecutar jobs: no era una nueva autorización ni provider execution, sino workflows inválidos registrados por Actions.

## Reparación aplicada

- Los 22 workflows históricos se reemplazan atómicamente por YAML válido usando `run: |`.
- Nuevo blob esperado: `5e33e90c4498f8f6bbbd8a0dda4d79a1ae393c96`.
- `validate-cxorbia-canonical-authority.js` se endurece para exigir exactamente el nuevo contrato válido.
- Validator authority y evidencia rootfix se actualizan.
- La cola sigue congelada; no se adjudica avance porcentual todavía.

## Seguridad

Provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge/frontend funcional = 0.

## Siguiente exacto

Readback remoto de esta transición y nueva clean probe sin tocar workflows. Solo si existe un único push workflow canónico, cero PR runs, cero bot commit y HEAD estable se cierra M3-0 y `PRODUCTION_REAL_READINESS` pasa 68→69.

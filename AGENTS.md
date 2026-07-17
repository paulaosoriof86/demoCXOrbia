# CXOrbia — ejecución obligatoria

Este archivo se lee antes de cualquier acción en el repositorio.

## Fuente obligatoria

Antes de planear, auditar, responder o modificar, leer:

1. `app/docs/ADDENDUM-MAESTRO-CORTE-DE-RAIZ-EJECUCION-EMPALME-CXORBIA-TYA-20260716.md`.
2. `app/docs/EMPALME-CHECKPOINT-ACTIVO.json`.
3. `backend/contracts/empalme-execution-lock-v1.json`.
4. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y PR #7.

## Regla de ejecución

Cuando una candidata ya tiene auditoría PASS/GO y no existe P0 comprobado, la única acción permitida es empalmar directamente el delta sobre `docs-tya-v6-v71-audit`.

Secuencia única:

1. Aplicar el delta auditado sobre la rama viva.
2. Preservar backend, contratos, adapters, tools, overlays TyA y documentación acumulada.
3. Generar manifest, `build-lock.js`, verificador y registro de baseline.
4. Actualizar documentación obligatoria.
5. Crear un solo commit y mover la rama viva.
6. Ejecutar gates y smoke después del empalme, antes de DEV/producción.

## Prohibiciones absolutas durante un empalme ordinario

No crear ramas, PR, workflows, Actions, artefactos Drive, transferencias Base64, service accounts, proyectos Firebase, colas CI, PowerShell para Paula, nuevas candidatas, nuevas metodologías ni reauditorías completas.

No convertir gates post-empalme en bloqueo previo.

No responder con otra explicación metodológica cuando el checkpoint indique una acción ejecutable. Ejecutar primero y reportar después.

## Lock actual

V156 está en estado `AUDITED_GO_READY_DIRECT_APPLY`. La única operación permitida es `APPLY_DELTA_DIRECTLY`.

Antes de cualquier mutación ejecutar:

`node tools/qa/assert-empalme-execution-lock.mjs --operation APPLY_DELTA_DIRECTLY`

Si la operación no coincide con el lock, detenerla. Un bloqueo real debe describirse una sola vez con evidencia concreta; no se permite experimentar con rutas alternativas.
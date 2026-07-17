# CXOrbia — ejecución obligatoria

Este archivo se lee antes de cualquier acción en el repositorio.

## Fuente obligatoria

Antes de planear, auditar, responder o modificar, leer:

1. `app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md`.
2. `app/docs/ADDENDUM-MAESTRO-CARRIL-OPERATIVO-LOCAL-REUTILIZABLE-CXORBIA-20260717.md`.
3. `CAMBIOS-BACKEND.md` y sus addenda recientes.
4. `RESUMEN-PARA-CLAUDE.md` y sus addenda recientes.
5. `PENDIENTES-PROTOTIPO.md` y sus addenda recientes.
6. PR #7 actual.

## Regla de ejecución

Cuando una candidata ya tiene auditoría PASS/GO y no existe P0 comprobado, la única acción permitida es empalmar directamente el delta sobre `docs-tya-v6-v71-audit`.

Secuencia única:

1. Ejecutar el preflight de `tools/integration/`.
2. Aplicar el delta auditado sobre la rama viva.
3. Preservar backend, contratos, adapters, tools, overlays TyA y documentación acumulada.
4. Generar manifest, `build-lock.js`, verificador y registro de baseline.
5. Actualizar documentación obligatoria.
6. Crear el commit de empalme y mover la rama viva.
7. Ejecutar gates y smoke después del empalme, antes de DEV/producción.

## Regla multi-tenant y multi-proyecto

El motor es genérico CXOrbia. Cada tenant es multi-proyecto y cada proyecto se selecciona explícitamente. Cinépolis es solo el primer proyecto TyA y nunca puede convertirse en default del tenant ni en lógica global.

## Prohibiciones absolutas durante un empalme ordinario

No crear ramas, PR, workflows, Actions, artefactos Drive, transferencias Base64, service accounts, proyectos Firebase, colas CI, PowerShell para Paula, nuevas candidatas, nuevas metodologías ni reauditorías completas.

No convertir gates post-empalme en bloqueo previo.

No responder con otra explicación metodológica cuando existe una acción ejecutable. Ejecutar primero y reportar después.

## Lock actual

V156 está en estado `AUDITED_GO_READY_DIRECT_APPLY`. La única operación permitida es `APPLY_DELTA_DIRECTLY` mediante el carril local determinístico.

Si el preflight falla, detenerse sin experimentar con rutas alternativas. No declarar empalme completo sin commit/push verificable, `build-lock.js` V156 y gates aplicables.

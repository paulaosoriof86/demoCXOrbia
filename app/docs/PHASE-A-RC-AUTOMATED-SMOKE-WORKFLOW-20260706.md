# Phase A RC automated smoke workflow - CXOrbia TyA

Fecha: 2026-07-06

## Bloque completado

Se agregó un workflow de GitHub Actions para ejecutar el smoke gate RC Phase A sin pedir pasos manuales largos a Paula.

## Archivo creado

- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`

## Qué ejecuta

El workflow corre:

```bash
node tools/migration/tya-phase-a-rc-smoke-gate.mjs --out .tmp/phase-a-rc-smoke
```

## Cuándo corre

- Manualmente con `workflow_dispatch`.
- En pull request hacia `release/cxorbia-tya-rc-20260630` cuando cambien `app/**`, `tools/migration/**` o el propio workflow.
- En push a `docs-tya-v6-v71-audit` cuando cambien `app/**`, `tools/migration/**` o el propio workflow.

## Qué valida indirectamente

El workflow no hace validaciones nuevas; ejecuta el gate ya documentado:

- index y charset UTF-8.
- scripts locales existentes.
- orden correcto del guard de copy.
- sintaxis JS de `app/`.
- documentos post V89 obligatorios.
- IDs de Academia.
- cursos `a_backend_prepared` y `a_ops_conflicts_route`.
- residuos de fuente como warning mitigado por guard.

## Artifact

Si corre en GitHub Actions, sube artifact:

- `phase-a-rc-smoke-report`

Incluye:

- `phase-a-rc-smoke-report.json`
- `phase-a-rc-smoke-report.md`

## Seguridad

El workflow usa permisos `contents: read`, no hace deploy, no escribe Firestore/Auth/Storage/HR, no llama Make/Gemini/mensajería/correo, no importa datos y no usa secretos.

## Impacto Phase A

Este bloque reduce fricción para avanzar a RC Phase A controlada. El objetivo es que el criterio de go/no-go no dependa de memoria ni de revisión manual parcial.

## Impacto Academia

Mantiene como requisito que Academia no tenga IDs duplicados y que existan los cursos post V89 requeridos. La validación visual de Academia sigue pendiente antes de producción real.

## Estado seguro

Sin deploy, sin producción, sin merge, sin escritura real y sin datos sensibles.

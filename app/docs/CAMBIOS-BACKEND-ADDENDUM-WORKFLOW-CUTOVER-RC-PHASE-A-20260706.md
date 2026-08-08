# Cambios backend addendum - workflow y cutover RC Phase A

Fecha: 2026-07-06

## Bloque completado

Se agregó automatización de smoke gate en GitHub Actions y checklist de cutover para preparar RC Phase A controlada.

## Archivos creados

- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`
- `app/docs/PHASE-A-RC-AUTOMATED-SMOKE-WORKFLOW-20260706.md`
- `app/docs/PHASE-A-RC-CUTOVER-CHECKLIST-CONTROLADO-20260706.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-WORKFLOW-CUTOVER-RC-PHASE-A-20260706.md`

## Qué cambia

- El smoke gate puede ejecutarse automáticamente o manualmente desde GitHub Actions.
- Se reduce dependencia de pasos manuales largos.
- Se deja criterio explícito para GO/NO GO de RC Phase A controlada.
- No se habilita producción real ni proveedores reales.

## Qué NO cambia

- No hay deploy.
- No hay merge.
- No hay escritura Firestore/Auth/Storage/HR.
- No hay Make/Gemini/mensajería/correo real.
- No hay import real ni datos sensibles.

## Impacto Phase A

Avanza el bloque de preparación para salida controlada: ahora la rama cuenta con gate técnico, guard de copy y checklist de smoke visual/consola.

## Impacto Academia

El gate revisa IDs de Academia y presencia de cursos post V89 requeridos. La validación visual de Academia queda como P0 del cutover controlado.

## Siguiente bloque

Revisar estado de workflow/smoke gate, preparar comentario de PR y si el gate no reporta hard fails, avanzar a RC Phase A controlada sin activar integraciones reales.

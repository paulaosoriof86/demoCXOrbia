# CAMBIOS BACKEND — Corte 4 visual P0 proven

Fecha: 2026-07-29

## Hallazgo

La validación visual de Paula probó `P0-C4-VIS-01`: Hosting DEV renderiza datos demo/localStorage cuando Auth temporal ya fue limpiado.

Evidencia visible: `Fuente: localStorage/demo`, `Auth: pendiente`, 3 proyectos, 108 visitas, 18 shoppers y 48 postulaciones, además de Proyecto Retail/Banca/Restaurantes y badge de datos ficticios.

## Causa raíz

`backend-config-preview-dev.js` exige preview Auth; `backend-firebase.js` ante credencial ausente marca y conserva `localStorage/demo`. Ese comportamiento contradice el contrato Corte 4 fail-closed/no-fallback.

## Cambios realizados en este bloque

Solo documentación y clasificación del P0. No se modificó runtime, no se ejecutó nuevo deploy, no se tocó Firebase ni producción.

## Archivos creados/documentados

- `app/docs/VALIDACION-VISUAL-CORTE4-P0-PROVEN-20260729.md`
- este addendum;
- addendum de resumen para Claude;
- addendum de pendientes;
- impacto Academia.

## Clasificación

- Reusable CXOrbia: fail-closed real frente a ausencia de Auth temporal.
- Exclusivo cliente: URL/projectId DEV TyA y conteos visuales observados.
- Claude/prototipo: no requiere nueva candidata; no tocar módulos UI.
- Academia: patrón de falso PASS técnico cuando el runtime visual conserva fallback heredado.
- Sin impacto Claude: corrección futura debe permanecer en backend/core.

## Estado

`P0_PROVEN__CORTE4_FREEZE_BLOCKED__RUNTIME_PATCH_NOT_AUTHORIZED_YET`.
# PHASE A — PLAN COMPLETO DE MATERIALIZACIÓN V131

Fecha: 2026-07-15

## Objetivo

Generar y validar un plan Firestore completo, source-safe y sin escrituras a partir de los activos canónicos TyA ya existentes en la baseline V131:

- `app/data/tya-hr-source-safe-periods.js`;
- `app/data/tya-financial-control-source-safe.js`;
- `app/data/tya-certification-carryover-source-safe.js`.

## Alcance esperado

- 1 tenant y 1 proyecto;
- 14 periodos;
- 616 visitas;
- 213 shoppers únicos protegidos;
- 572 liquidaciones candidatas hasta junio de 2026;
- cero pagos confirmados inferidos;
- cero certificaciones creadas sin fuente confirmada;
- lotes de máximo 400 operaciones;
- rutas únicas, precondición `exists:false` y datos sensibles excluidos.

## Gate

El workflow conserva la prueba fixture y añade la construcción y validación del plan completo en `.tmp/firestore-materialization-plan-full`.

## Seguridad

Dry-run únicamente. Sin Firestore writes, importación, deploy, producción, Make, Gemini ni pagos reales.

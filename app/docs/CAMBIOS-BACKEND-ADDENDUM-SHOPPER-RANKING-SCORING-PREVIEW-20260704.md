# Cambios backend addendum - Shopper ranking/scoring preview

Fecha: 2026-07-04

## Bloque completado

Contrato y preview validator de shopper ranking/scoring, trabajando sobre la ultima baseline auditada de continuidad backend.

## Archivos creados

1. `app/contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para ranking/scoring shopper como ayuda de revision, sin decisiones automaticas ni datos sensibles.
   - Por que: el tracker marcaba ranking/scoring shopper como siguiente bloque seguro si no habia input source-safe para ejecutar validators previos.

2. `tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con rankingRun y shopperMetrics.
   - Por que: permite clasificar score listo, ranking listo para revision, muestra insuficiente, conflicto, metrica sensible bloqueada y ajuste manual requerido.

3. `app/docs/SHOPPER-RANKING-SCORING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-SHOPPER-RANKING-SCORING-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Make real.
- Sin Gemini real.
- Sin autoasignacion.
- Sin decisiones reales.
- Sin datos sensibles.

## Phase A que avanza

- Ranking queda como decision support de admin/ops, no como autoasignacion.
- Score queda explicado por desglose de metricas, no por caja negra.
- Se bloquean datos sensibles y atributos protegidos.
- Muestra insuficiente y conflictos pasan a revision manual.
- Ajuste manual requiere razon y reviewer.
- Ranking queda segmentado por tenant/proyecto/periodo.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado de ranking metrics.
2. Integrar este validator en una secuencia local segura.
3. Definir versionamiento de reglas de score por proyecto/tenant.
4. Preparar payload futuro para ranking UI sin activar runtime.
5. Relacionar ranking con assignment sync y visit lifecycle sin autoasignar.

## Pendientes prototipo/Claude derivados

1. Ranking UI debe mostrar que es preview/ayuda admin, no asignacion automatica.
2. Mostrar desglose de metricas y razones.
3. Mostrar muestra insuficiente, conflicto y revision manual.
4. No exponer datos sensibles ni atributos protegidos.
5. No usar ranking como decision punitiva ni final.
6. Academia debe explicar metricas permitidas, inputs prohibidos y revision humana.

## Impacto Academia

Se creo documento especifico para Academia sobre ranking shopper, metrica operativa, fairness, revision manual, score breakdown, limites del ranking y uso correcto para seleccion operativa.

## Siguiente bloque recomendado

Preparar inputs sinteticos/sanitizados para ejecutar validators previos o, si no hay input seguro todavia, continuar con un contrato transversal de versionamiento de reglas y configuraciones por proyecto/tenant.

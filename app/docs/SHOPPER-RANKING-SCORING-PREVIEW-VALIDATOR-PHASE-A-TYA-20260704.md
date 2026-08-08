# Shopper ranking/scoring preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de ranking/scoring shopper. Este bloque prepara un contrato y validador preview para ranking operativo de shoppers basado en metricas source-safe, sin usar datos sensibles, sin tomar decisiones automaticas de asignacion, sin escribir Firestore, sin ejecutar Gemini y sin activar produccion.

## Archivos creados

- `app/contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Make, Gemini e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de datos de identidad, contacto, banco, documentos, cuerpos de comunicacion, adjuntos o atributos sensibles.
4. Ranking por `tenantId`, `projectId`, `rankingRunId`, `rankingPeriodId` y `shopperId`.
5. Metricas permitidas por categoria operativa.
6. Rango numerico de `metricValue` y `metricWeight`.
7. Muestra insuficiente y conflictos como revision manual.
8. Ajustes manuales con razon y reviewer.
9. Que ranking no signifique asignacion automatica.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "rankingRun": {
    "tenantId": "tya",
    "projectId": "cinepolis_gt",
    "rankingRunId": "ranking_run_ref_001",
    "rankingPeriodId": "period_ref_2026_07",
    "rankingScope": "project_period_preview",
    "scoreVersion": "score_rules_preview_001",
    "status": "draft_preview"
  },
  "shopperMetrics": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "rankingRunId": "ranking_run_ref_001",
      "rankingPeriodId": "period_ref_2026_07",
      "shopperId": "shopper_ref_001",
      "metricId": "metric_ref_001",
      "metricCategory": "visit_completion",
      "metricValue": 90,
      "metricWeight": 15,
      "metricSourceRef": "safe_metric_source_ref_001",
      "sourceSafe": true,
      "sampleSize": 5
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs
node tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs --input path/to/shopper-ranking-scoring-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `shopper_score_preview_ready`
- `shopper_ranking_ready_for_review`
- `insufficient_sample_review_required`
- `conflict_review_required`
- `blocked_sensitive_metric`
- `manual_adjustment_review_required`
- `not_ranked_preview`

## Reglas clave

- Ranking es ayuda para revision/admin, no decision automatica.
- No autoasignar visitas por ranking preview.
- No usar DPI/documento, banco, telefono, correo, direccion, edad, genero, salud, religion, familia ni datos privados.
- No usar monto pagado como proxy de calidad.
- No comparar globalmente entre tenants/proyectos sin filtro explicito.
- Debe mostrarse desglose de metricas, no solo puntaje final.
- Muestra insuficiente va a revision manual.
- Conflictos de asignacion, visita o revision bloquean score limpio.
- Ajustes manuales requieren razon y reviewer.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de ranking metrics.
2. Integrar este validator en runner local seguro.
3. Definir versionamiento de reglas de score por proyecto/tenant.
4. Preparar payload futuro para ranking UI sin activar runtime.
5. Relacionar ranking con assignment sync y visit lifecycle sin autoasignar.

## Pendientes prototipo / Claude derivados

1. Ranking UI debe mostrar que es preview/ayuda admin, no asignacion automatica.
2. Mostrar desglose de metricas y razones.
3. Mostrar muestra insuficiente, conflicto y revision manual.
4. No exponer datos sensibles ni atributos protegidos.
5. No usar ranking como decision punitiva ni final.
6. Academia debe explicar metricas permitidas, inputs prohibidos y revision humana.

## Impacto Academia

Academia debe crear/profundizar curso de ranking shopper por rol, metrica operativa, fairness, revision manual, score breakdown, limites del ranking y uso correcto para seleccion operativa.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Make, sin Gemini, sin autoasignacion, sin decisiones reales y sin datos sensibles.

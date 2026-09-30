# Academia impact - Shopper ranking/scoring preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs`
- `app/docs/SHOPPER-RANKING-SCORING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir ranking/scoring shopper en aprendizaje operativo por rol, dejando claro que el ranking es una ayuda de revision y no una decision automatica, punitiva o definitiva.

## Rutas por rol

### Admin

Debe aprender:

- como leer el ranking;
- como revisar desglose de metricas;
- como interpretar muestra insuficiente;
- como tratar conflictos;
- cuando no usar ranking para decidir;
- como registrar ajuste manual con razon.

### Ops

Debe aprender:

- como usar ranking como apoyo para seleccion operativa;
- como revisar disponibilidad y reglas antes de asignar;
- por que ranking no reemplaza validacion de franja/quincena/visita;
- como elevar casos a revision manual.

### Shopper

Debe aprender:

- que datos operativos pueden influir en desempeno;
- que datos privados no se usan;
- que el ranking no es castigo automatico;
- como mejorar cumplimiento operativo: agenda, visita, cuestionario, correcciones y comunicacion.

### Cliente

Debe aprender:

- que puede ver indicadores agregados o resumen autorizado;
- que no ve datos privados ni ranking interno individual salvo autorizacion;
- que la plataforma usa controles para mejorar calidad operativa.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar reglas de scoring por tenant/proyecto;
- como versionar score rules;
- como auditar fairness y datos prohibidos;
- como ajustar pesos sin afectar historico.

## Manuales a crear o actualizar

1. Manual shopper ranking.
2. Manual metric breakdown.
3. Manual fair scoring rules.
4. Manual manual adjustment review.
5. Manual assignment decision support.
6. Manual prohibited inputs.

## Lecciones requeridas

### Leccion 1 - Ranking no es autoasignacion

Debe explicar que el score ayuda a revisar, pero no asigna visitas ni toma decisiones automaticamente.

### Leccion 2 - Metricas permitidas

Debe explicar certificacion, confiabilidad de asignacion, agenda, visita, cuestionario, revision, correcciones y comunicacion.

### Leccion 3 - Inputs prohibidos

Debe explicar que no se usan datos de identidad crudos, banco, contacto, salud, edad, genero, religion, familia ni pagos como proxy de calidad.

### Leccion 4 - Muestra insuficiente

Debe explicar que pocos datos no permiten rankear de forma confiable y se manda a revision.

### Leccion 5 - Ajuste manual

Debe explicar que cualquier ajuste manual exige razon, reviewer y trazabilidad.

## Checklists interactivos

### Antes de usar ranking para asignacion

- Proyecto/tenant correcto.
- Periodo correcto.
- Shopper tiene muestra suficiente.
- No hay conflicto de asignacion/visita.
- Ranking no reemplaza disponibilidad ni reglas de agenda.
- Admin reviso desglose de metricas.

### Antes de ajustar score manualmente

- Existe razon operativa.
- Existe reviewer.
- No se basa en dato sensible.
- Queda audit trail.

### Antes de mostrar ranking a shopper

- Solo metricas permitidas.
- Sin datos de otros shoppers.
- Sin datos privados.
- Mensaje no punitivo.

## Glosario requerido

- rankingRunId
- rankingPeriodId
- scoreVersion
- metricId
- metricCategory
- metricWeight
- metricValue
- metricSourceRef
- scoreStatus
- insufficient_sample_review_required
- blocked_sensitive_metric
- manual_adjustment_review_required

## Estado seguro

Documento academico. No activa runtime, no escribe score real, no autoasigna, no llama Gemini, no escribe Firestore/Storage y no cambia frontend.

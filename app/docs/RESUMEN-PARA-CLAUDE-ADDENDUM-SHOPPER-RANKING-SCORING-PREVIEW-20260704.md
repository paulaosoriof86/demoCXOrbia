# Resumen para Claude addendum - Shopper ranking/scoring preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para shopper ranking/scoring. El ranking queda como ayuda de revision para admin/ops, no como decision automatica ni autoasignacion.

Archivos agregados:

- `app/contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json`
- `tools/migration/tya-shopper-ranking-scoring-preview-validator.mjs`
- `app/docs/SHOPPER-RANKING-SCORING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-SHOPPER-RANKING-SCORING-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-SHOPPER-RANKING-SCORING-PREVIEW-20260704.md`

No se activo runtime, Firestore, Make, Gemini ni decisiones reales.

## Reglas que debe reflejar el prototipo

1. Ranking es preview/ayuda admin, no autoasignacion.
2. Debe mostrar desglose de metricas, no solo puntaje final.
3. Debe mostrar muestra insuficiente.
4. Debe mostrar conflicto/revision manual.
5. No debe exponer datos sensibles ni atributos protegidos.
6. No debe usar pago/monto como proxy de calidad.
7. No debe comparar shoppers entre tenants/proyectos sin filtro explicito.
8. Cualquier ajuste manual requiere razon y reviewer.

## Pendientes frontend concretos

### Ranking shopper

- Mostrar `rankingRunId`, periodo, proyecto y scoreVersion si aplica.
- Mostrar metricas permitidas y pesos.
- Mostrar score como ayuda, no decision final.
- Mostrar estados: ready for review, insufficient sample, conflict review, blocked sensitive metric, manual adjustment required.
- Mostrar explicacion de por que un shopper no esta rankeado.

### Privacidad

- No mostrar documento/DPI.
- No mostrar banco/cuenta.
- No mostrar telefono/correo/WhatsApp.
- No mostrar cuerpos de comunicacion.
- No mostrar atributos protegidos.

### Operacion

- Ranking no puede asignar visitas automaticamente.
- Antes de asignar, validar disponibilidad, franja/quincena, lifecycle, assignment sync y conflicto.

## Academia que Claude debe actualizar

- Curso Admin: ranking review.
- Curso Ops: seleccion operativa apoyada en ranking.
- Curso Shopper: transparencia de desempeno sin datos privados.
- Curso Superadmin: configuracion de pesos y versionamiento.
- Manual shopper ranking.
- Manual metric breakdown.
- Manual fair scoring rules.
- Manual manual adjustment review.
- Checklist antes de usar ranking para asignacion.
- Checklist antes de ajuste manual.
- Glosario: rankingRunId, rankingPeriodId, scoreVersion, metricId, metricWeight, scoreStatus.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Make/Gemini reales.
- Autoasignacion real.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales, IA real ni decisiones reales.

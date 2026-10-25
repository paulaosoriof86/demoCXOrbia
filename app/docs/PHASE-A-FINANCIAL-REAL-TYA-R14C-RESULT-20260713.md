# Phase A R14C — conciliación financiera real TyA contra HR viva

Decisión: **PASS_WITH_REVIEW_REAL_TYA_FINANCIAL_RECONCILIATION_R14C**

## Resultado verificable

- Visitas HR source-safe: 616.
- Visitas HR enero-junio 2026: 264.
- Filas reales únicas del control de liquidaciones: 247.
- Enlaces exactos aceptados entre control de liquidación y visita HR: 196.
- Enlaces exactos mediante compuesto completo: 0.
- Enlaces exactos mediante compuesto operacional protegido: 196.
- Filas de liquidación todavía en revisión: 51.
- Evidencias itemizadas del ledger financiero: 37.
- Evidencias del ledger vinculadas de forma única a una visita: 1.
- Cola de revisión consolidada: 92.

## Qué significa “enlace exacto aceptado”

Un enlace exacto aceptado identifica de forma única la visita HR correspondiente a una fila del control financiero mediante:

`periodo + país + shopperId protegido + sucursal protegida + boleto + combo`

No significa que la visita esté pagada. Los 196 registros continúan con estado `pending_financial_source`; el importador dry-run aceptó **0 pagos confirmados** porque la fuente no aporta todavía evidencia suficiente de lote, actor y confirmación de pago.

## Cobertura enero-mayo 2026

| Periodo | GT exactos / fuente | HN exactos / fuente | Total exactos |
|---|---:|---:|---:|
| Enero | 34 / 34 | 0 / 10 | 34 |
| Febrero | 30 / 34 | 9 / 10 | 39 |
| Marzo | 33 / 34 | 8 / 10 | 41 |
| Abril | 32 / 34 | 9 / 10 | 41 |
| Mayo | 32 / 34 | 9 / 10 | 41 |
| **Total** | **161 / 170** | **35 / 50** | **196 / 220** |

Quedan 24 filas enero-mayo en revisión: principalmente diferencias de monto/detalle, además de una referencia shopper distinta, una ambigüedad y un caso sin candidato protegido.

## Junio 2026 — corte operativo pendiente

- HR: 44 visitas ejecutadas, 34 GT y 10 HN.
- Fuente financiera disponible: 27 filas, 17 GT y 10 HN.
- Enlaces exactos: 0.
- Brecha de cobertura fuente: 17 visitas GT sin fila financiera.
- Las 27 filas existentes permanecen en revisión por diferencias entre la fuente financiera y los campos operativos HR disponibles.

Esto confirma que junio sigue siendo un bloque de **liquidaciones/pagos**, no de visitas pendientes. Para cerrar el corte inicial se necesita reconciliar esas 27 filas y obtener las 17 filas GT faltantes o una decisión auditada sobre su ausencia.

## Causas de las 51 revisiones de liquidación

- 48: candidato único por shopper+sucursal, pero boleto/combo u otro detalle financiero no coincide.
- 1: candidato único por sucursal+montos, pero la referencia shopper difiere.
- 1: más de un candidato protegido posible.
- 1: sin candidato protegido.

No se usó nombre, similitud visual ni coincidencia shopper+monto aislada para resolverlas.

## Disponibilidad HR enero-junio 2026

- 264 visitas.
- Fecha realizada disponible en el payload source-safe: 0.
- Honorario disponible: 258.
- Boleto y combo disponibles: 212.

La ausencia de `realizada` impidió el compuesto estricto R14. R14C recuperó enlaces únicamente cuando el compuesto operacional protegido fue único.

## Evidencia de pago

- 37 filas itemizadas del ledger fueron inspeccionadas.
- Solo 1 quedó vinculada de forma única a una visita.
- Las 37 permanecen en revisión porque faltan uno o más de estos campos de confirmación: `paymentBatchId`, `confirmedBy` y, según el caso, `paidAt`.
- Un día planificado, una fila de liquidación o el estado `liquidada` no equivalen a pago confirmado.

## Estado seguro

- Fuente real TyA procesada y sanitizada.
- Sin nombres de shoppers, tiendas, bancos, cuentas, DPI, teléfonos o correos en el reporte.
- Workbook crudo no incorporado al repositorio.
- Sin lecturas o escrituras de proveedor durante R14C.
- Sin importación real.
- Sin ejecución de pagos.
- Sin deploy.
- Sin producción.

## Bloqueo de producción independiente

La conciliación financiera avanzó con datos reales, pero el proyecto `cxorbia-backend-dev` no es una baseline vacía: contiene 17 usuarios Auth y datos Firestore. Por la regla maestra, no puede conectarse el adapter `CX.data` ni materializar Phase A allí. Debe resolverse la procedencia o crearse un proyecto Firebase DEV nuevo y vacío antes de cualquier escritura.

## Siguiente bloque operativo exacto

1. Crear y verificar una base Firebase DEV nueva y vacía, con autorización separada.
2. Reconciliar las 51 filas financieras abiertas, priorizando junio.
3. Obtener o reconstruir source-safe las 17 filas GT faltantes de junio.
4. Completar evidencia de pago con lote, fecha y actor antes de marcar `paid`.
5. Mantener certificaciones presentadas y shopper gap 210/213 en reviewQueue hasta resolver sus llaves estables.

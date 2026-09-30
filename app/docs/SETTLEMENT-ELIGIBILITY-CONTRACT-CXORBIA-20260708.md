# Settlement eligibility contract - CXOrbia Phase A

Fecha: 2026-07-08

## Bloque completado

Se creo contrato preview-only para elegibilidad de liquidaciones y lotes de pago Phase A.

Archivo creado:

- `tools/contracts/cxorbia-settlement-eligibility-contract.mjs`

## Objetivo Phase A

Phase A requiere conservar liquidaciones/pagos con estado de pago, al menos junio para el corte inicial, sin ejecutar pagos reales ni escribir datos sensibles en repo.

Este contrato valida si una visita puede entrar a liquidacion/lote solo despues de cumplir gates operativos.

## Gates de elegibilidad

Una visita no debe entrar a liquidacion si no cumple:

- visita asociada a `tenantId`, `projectId`, `visitId` y `shopperId`;
- cuestionario completado;
- submit revisado o submitido;
- moneda definida;
- honorario y reembolso numericos no negativos;
- batch/lote cuando aplica;
- auditoria obligatoria;
- sin DPI ni banco en payload.

## Acciones soportadas

- `preview_settlement_eligibility`;
- `request_add_to_batch`;
- `request_remove_from_batch`;
- `request_batch_recalculation`;
- `request_payment_status_review`;
- `mark_payment_prepared_preview`;
- `mark_payment_confirmed_review`;
- `export_settlement_report`.

## Estados resultantes

- `not_eligible`;
- `eligible_preview`;
- `batch_review_required`;
- `prepared_preview`;
- `confirmed_review_required`;
- `paid_confirmed`;
- `blocked_gate`.

## Reglas de seguridad

El contrato bloquea:

- `execute: true`;
- `payNow: true`;
- `writeToDatabase: true`;
- `notifyReal: true`;
- `containsBankData: true`;
- `containsDpi: true`.

El contrato no ejecuta pagos ni confirma dinero real.

## Llaves estables

- `tenantId`;
- `projectId`;
- `visitId`;
- `shopperId`;
- `batchId`.

Estas llaves evitan mezclar liquidaciones por coincidencia visual, nombre de shopper o sucursal.

## Por que importa

Junio tiene visitas ejecutadas y lo pendiente son pagos, no visitas. Este contrato separa:

- elegible para liquidacion;
- agregado a lote;
- preparado para pago;
- confirmado en revision;
- pagado confirmado.

## Pendientes Claude/prototipo

Claude debe reflejar este patron sin activar pagos reales:

- mostrar estado de liquidacion por visita;
- distinguir `preparado` de `pagado`;
- mostrar lote/batch;
- permitir revision administrativa con razon;
- evitar copy `pagado` si no hay confirmacion real;
- no mostrar banco/DPI en UI general;
- explicar por que visita sin submitido no liquida;
- mantener trazabilidad por tenant/proyecto/visita/shopper/lote.

## Academia

Academia debe explicar:

- diferencia entre visita ejecutada, cuestionario completado, submitido y liquidable;
- diferencia entre lote preparado y pago confirmado;
- por que no se solicita de nuevo una certificacion ya presentada;
- por que junio requiere pagos pendientes, no nuevas visitas;
- que datos sensibles como banco/DPI no se manejan en material visible ni repo;
- errores frecuentes: liquidar sin submitido, duplicar lote, marcar pagado sin confirmacion.

## Clasificacion

### Reusable CXOrbia

Si. Elegibilidad de liquidaciones por gate es reusable para cualquier tenant/proyecto.

### Exclusivo cliente

No. Junio/TyA es caso Phase A, pero el contrato es generico.

### Claude/prototipo

Si. Requiere UI de estados, lote, copy honesto y proteccion de datos sensibles.

### Academia

Si. Afecta cursos, manuales, rutas por rol y glosario financiero-operativo.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin pagos reales, sin proveedores reales, sin base real, sin imports reales, sin notificaciones reales y sin datos sensibles.

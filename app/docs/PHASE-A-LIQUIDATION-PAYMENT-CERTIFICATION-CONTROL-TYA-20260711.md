# Phase A — control de liquidación/pago y carryover de certificaciones TyA

Fecha: 2026-07-11

## Propósito

Continuar producción real Phase A sobre la nueva baseline viva empalmada V103, sin tocar módulos UI y sin activar proveedores, imports o producción.

## Liquidación y pago

Se separan expresamente dos dominios:

- liquidación operativa de una visita;
- confirmación financiera de pago.

Reglas vinculantes:

- `liquidada` no significa `pagada`;
- `realizada` no puede usarse como `paidAt`;
- pago confirmado exige lote, fecha de pago, fuente, actor y `auditRef`;
- junio 2026 es el corte inicial de control de liquidaciones/pagos; sus visitas no están pendientes de ejecución;
- conflicto de pago va a revisión humana y no se sobrescribe silenciosamente.

Contrato: `backend/contracts/phase-a-liquidation-payment-control-v1.json`.

## Certificaciones ya presentadas

Se preserva toda certificación presentada y útil para no exigirla nuevamente sin regla explícita del proyecto.

Reglas vinculantes:

- preview o `pending_backend` no habilita visitas reales;
- solo carryover revisado o confirmación backend puede habilitar operación;
- escribir un nombre de revisor no equivale a segundo actor autenticado;
- Gemini puede proponer bancos/preguntas, pero la aprobación es humana;
- evidencia conflictiva va a revisión y no se deduplica por nombre visual.

Contrato: `backend/contracts/phase-a-certification-carryover-control-v1.json`.

## Impacto reusable CXOrbia

Los dos contratos son multi-tenant y multi-proyecto. No contienen lógica exclusiva hardcodeada de Cinépolis; Cinépolis se mantiene como primer proyecto configurable TyA.

## Impacto Claude/prototipo

La UI debe mostrar estados honestos:

- liquidada;
- pendiente fuente de pago;
- pendiente revisión;
- pagada solo con confirmación backend;
- certificación preservada;
- práctica preview;
- certificación válida;
- conflicto.

No debe mostrar `pagada`, `certificada`, `habilitada` o `notificada` solo por estado local/demo.

## Impacto Academia

Actualizar manuales/cursos para explicar:

- liquidación vs pago;
- lote y referencia opaca;
- junio como corte de pagos;
- carryover de certificaciones;
- práctica vs habilitación real;
- segundo actor autenticado;
- revisión humana;
- datos que no deben ir en logs o repo.

## Estado seguro

Contratos/documentación solamente. Sin cambios en `/app/modules`, sin deploy, sin import, sin writes, sin Firestore/Auth/Storage, sin HR writeback, sin Make/Gemini live y sin pagos reales.

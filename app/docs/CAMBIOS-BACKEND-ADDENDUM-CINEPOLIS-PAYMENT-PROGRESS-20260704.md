# Addendum cambios backend - Cinepolis payment batch y tracker

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/cinepolis-reimbursements-payment-batch-phase-a.tya.contract.json`
- `tools/migration/tya-cinepolis-reimbursements-payment-batch-validator.mjs`
- `app/docs/CINEPOLIS-REIMBURSEMENTS-PAYMENT-BATCH-MOVEMENTS-PHASE-A-TYA-20260704.md`
- `app/docs/MASTER-CONTEXT-ADDENDUM-BLOCK-PROGRESS-TRACKING-20260704.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-CINEPOLIS-PAYMENT-BATCH-MOVEMENTS-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CINEPOLIS-PAYMENT-PROGRESS-20260704.md`

## Motivo

Paula aclaro que en Cinepolis los reembolsos vienen de columnas HR `Boleto` y `Combo`, que los pagos historicos estan en fuentes TyA/liquidaciones/mayo/julio, y que al pagar lotes debe conservarse movimiento individual con detalle y lote asociado. Tambien solicito un tracker de avance por bloque.

## Decision

Se documento contrato Cinepolis Boleto/Combo + lote seleccionable + movimiento individual + reconciliacion historica. Tambien se agrego regla de cierre por bloque y tracker vivo de Phase A.

## Estado seguro

Sin cambios frontend, sin runtime, sin lectura de archivos reales, sin Firestore real, sin HR writes, sin pago real, sin datos bancarios, sin deploy y sin produccion.

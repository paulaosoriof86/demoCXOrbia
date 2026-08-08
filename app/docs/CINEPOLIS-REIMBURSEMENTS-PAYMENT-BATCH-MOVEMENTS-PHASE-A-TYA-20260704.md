# Cinepolis reimbursements, payment batches and individual movements Phase A TyA

Fecha: 2026-07-04

## Objetivo

Complementar el bloque de liquidaciones/pagos con reglas especificas de Cinepolis: reembolsos desde columnas HR `Boleto` y `Combo`, lotes de pago seleccionables, movimientos individuales y reconciliacion de pagos historicos de mayo/julio.

Este bloque no procesa archivos reales, no importa fuentes, no ejecuta pagos, no escribe Firestore y no escribe HR.

## Contrato creado

- `app/contracts/cinepolis-reimbursements-payment-batch-phase-a.tya.contract.json`

## Validador creado

- `tools/migration/tya-cinepolis-reimbursements-payment-batch-validator.mjs`

## Fuentes indicadas por Paula

- HR con columnas `Boleto` y `Combo`.
- Archivo/fuentes de hojas TyA y liquidaciones.
- Liquidaciones mayo.
- Pagos hechos en mayo.
- Pagos hechos en julio.

Estas fuentes quedan referenciadas como origen esperado, pero este bloque no lee ni guarda archivos crudos.

## Regla de reembolso Cinepolis

Para Cinepolis:

- `Boleto` corresponde a reembolso de boleto.
- `Combo` corresponde a reembolso de combo.
- `reimbursementTotal = boletoAmount + comboAmount`, salvo regla de proyecto/pais con override auditado.
- Honorario es independiente de boleto/combo.
- Boleto o combo pueden ser cero/no aplicar.

## Lote de pago

La plataforma debe permitir preparar un lote y seleccionar a quienes incluir.

Reglas:

1. Admin elige items elegibles para incluir.
2. No todos los elegibles entran automaticamente.
3. Cada item mantiene shopper, visita, HR row, honorario, boleto, combo, total, moneda y estado.
4. El lote puede prepararse, revisarse, aprobarse, pagarse, cerrarse o reabrirse segun politica.
5. El pago de lote no elimina la trazabilidad individual.
6. Cada pago individual debe quedar en movimientos.

## Movimientos individuales

Aunque se pague un lote, los movimientos deben mostrar cada pago individual.

Cada movimiento debe indicar:

- `batchId`;
- `paymentItemId`;
- shopper;
- visita / HR row;
- honorario;
- boleto;
- combo;
- total;
- moneda;
- fuente: lote, historico, ajuste o reversa;
- estado;
- auditoria.

Esto permite que en movimientos se vea el detalle individual y a que lote pertenece.

## Reconciliacion historica mayo/julio

Los pagos historicos de mayo y julio deben mapearse para evitar duplicidades.

Reglas:

- Pagos historicos pueden entrar como movimientos pagados o referencias fuente.
- Si un pago ya existe historicamente, no debe volver a pagarse en lote nuevo.
- Si no hay llave estable suficiente, no se deduplica visualmente: pasa a revision manual.
- Llaves sugeridas: tenant, proyecto, shopper, periodo, visitId/hrRowId, monto, fuente.

## Estados de item de pago

- `eligible_not_selected`
- `selected_for_batch`
- `in_batch_review`
- `approved_in_batch`
- `paid_in_batch`
- `paid_historical_import`
- `held_conflict`
- `held_missing_data`
- `manual_review_required`
- `cancelled`
- `reversed_or_adjusted`

## Estados de movimiento

- `draft_preview`
- `pending_batch_payment`
- `paid_manual_confirmed`
- `paid_historical_confirmed`
- `reconciled`
- `conflict_review_required`
- `reversed_or_adjusted`

## Gaps detectados

- Falta preview seguro de mapeo Boleto/Combo con HR staging/mock.
- Falta preview de seleccion de lote.
- Falta ledger de movimientos individuales con referencia a lote.
- Falta reconciliar pagos historicos mayo/julio con llaves estables.
- Falta politica de cierre/reapertura de lotes.

## Pendientes backend

- Crear preview validator de Boleto/Combo.
- Crear preview de lote seleccionable.
- Crear ledger de movimientos individuales.
- Integrar con Mis beneficios shopper.
- Integrar con historical import y source refs.
- Definir reglas de cierre/reapertura/reversa.

## Pendientes prototipo

- Admin debe poder seleccionar items para lote.
- Movimientos debe mostrar pago individual aunque provenga de lote.
- Cada movimiento debe mostrar lote asociado.
- Mis beneficios debe reflejar honorario, boleto, combo, total y estado.
- No mostrar banco/datos sensibles en vistas shopper.

## Impacto Academia

Academia debe explicar:

- que son Boleto y Combo;
- como se calcula reembolso;
- como se arma un lote;
- como seleccionar items;
- como se reflejan movimientos individuales;
- como se evita duplicar pagos historicos;
- que ve el shopper en Mis beneficios.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin lectura de archivos reales.
- Sin Firestore writes.
- Sin HR writes.
- Sin pago real.
- Sin datos bancarios.
- Sin deploy.
- Sin produccion.

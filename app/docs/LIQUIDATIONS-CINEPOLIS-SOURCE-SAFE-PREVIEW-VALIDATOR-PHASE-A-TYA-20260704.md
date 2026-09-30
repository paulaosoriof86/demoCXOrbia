# Liquidations + Cinepolis source-safe preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el siguiente bloque seguro del tracker Phase A: preview validators y source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo, sin leer archivos reales, sin datos sensibles y sin ejecutar pagos.

Este bloque convierte los contratos previos de liquidaciones/pagos y Cinepolis Boleto/Combo en un validador de preview seguro. Sirve para probar estructura, llaves, estados, montos y reglas de revision manual usando solo entrada sintetica o sanitizada.

## Archivos creados

- `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
- `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`

## Dependencias documentales

Este bloque depende de:

- `app/contracts/liquidation-payment-phase-a.tya.contract.json`
- `app/contracts/cinepolis-reimbursements-payment-batch-phase-a.tya.contract.json`
- `app/contracts/submitido-hr-driven-phase-a.tya.contract.json`
- `app/contracts/admin-review-phase-a.tya.contract.json`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`

## Que valida

El validador revisa:

1. Que los gates sigan apagados:
   - `runtimeEnabled=false`
   - `productionAllowed=false`
   - `firestoreWritesAllowed=false`
   - `paymentProviderAllowed=false`
   - `hrWriteAllowed=false`
   - `makeEnabled=false`
   - `geminiEnabled=false`
   - `emailEnabled=false`
2. Que el contrato declare llaves estables para tenant, proyecto, shopper, visita, HR row, periodo, moneda, lote, item y movimiento.
3. Que la entrada opcional sea segura y contenga:
   - `sourceSafe=true`
   - `containsRawSensitiveData=false`
   - `isSyntheticOrSanitized=true`
4. Que no aparezcan campos sensibles como DPI, banco, cuenta, NDA, adjuntos crudos o cuerpos crudos de correo.
5. Que Boleto y Combo se normalicen a:
   - `boletoAmount`
   - `comboAmount`
   - `reimbursementTotal = boletoAmount + comboAmount`
6. Que honorario siga separado de reembolso.
7. Que una fila sin `visitId`, `hrRowId` o `sourceVisitRef` pase a revision manual.
8. Que un pago marcado como pagado sin referencia estable pase a conflicto/revision manual.
9. Que las filas de junio se clasifiquen como liquidacion/pago, no como visitas pendientes.

## Uso futuro local seguro

Cuando exista un archivo local sintetico o sanitizado, el comando previsto sera:

```bash
node tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs --input path/to/safe-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contrato y avisa que no leyo ni mapeo filas fuente.

## Forma esperada de entrada segura

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "runtimeEnabled": false,
  "productionAllowed": false,
  "firestoreWritesAllowed": false,
  "hrWriteAllowed": false,
  "paymentProviderAllowed": false,
  "rows": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "projectKey": "cinepolis",
      "shopperId": "shopper_ref_001",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "periodId": "2026-06",
      "quincena": "Q2",
      "country": "GT",
      "currency": "GTQ",
      "visitPerformed": true,
      "questionnaireCompleted": true,
      "submitidoStatus": "submitido_registered",
      "reviewStatus": "approved_for_submitido",
      "honorariumAmount": 0,
      "boletoAmount": 0,
      "comboAmount": 0,
      "selectedForBatch": false
    }
  ]
}
```

No se debe usar este formato para pegar informacion real cruda. Debe ser sintetico o sanitizado.

## Clasificacion esperada

El preview puede clasificar filas en:

- `candidate_pending_submitido`: visita ejecutada, pero aun no cumple submitido/revision.
- `candidate_ready`: lista como candidata de pago, sin lote seleccionado.
- `approved_for_payment` + `scheduled`: seleccionada para lote.
- `paid`: solo si existe referencia estable historica/manual.
- `held_for_conflict` o `manual_review_required`: faltan llaves, hay campo sensible, monto invalido, pago sin referencia estable o ambiguedad.

## Reglas de junio

- Junio no debe entrar como visita pendiente de realizar.
- Las visitas hasta junio estan ejecutadas; lo pendiente son liquidaciones/pagos.
- Visita realizada no equivale a pagada.
- Cuestionario realizado no equivale a submitido ni pago.
- Submitido/revision controla elegibilidad salvo excepcion admin documentada.

## Reglas Boleto/Combo

- `Boleto` solo alimenta `boletoAmount`.
- `Combo` solo alimenta `comboAmount`.
- `reimbursementTotal = boletoAmount + comboAmount`.
- Honorario queda separado.
- Boleto o Combo pueden ser cero/no aplicar.
- Esta regla es especifica de Cinepolis y no debe convertirse en regla global del tenant TyA ni de CXOrbia.

## Reglas de pagos historicos

- Los pagos historicos de mayo/julio deben reconciliarse con referencia estable antes de cerrar nuevos lotes.
- No se permite deduplicacion por coincidencia visual o por nombre del shopper.
- Si falta `visitId`, `hrRowId`, `sourceVisitRef`, `sourcePaymentRef` o monto estable suficiente, queda `manual_review_required`.
- Un pago marcado como `paid` sin `historicalPaymentRef` o `manualPaymentConfirmationRef` queda en conflicto.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin lectura de archivos reales.
- Sin Firestore writes.
- Sin HR writes.
- Sin pagos reales.
- Sin Make/Gemini/correo real.
- Sin datos bancarios/DPI/NDA/adjuntos crudos.

## Pendientes backend derivados

1. Ejecutar el validador contra un archivo local sintetico/sanitizado cuando se prepare la fuente segura.
2. Crear politica consolidada de datos sensibles para banco, DPI, NDA, correo y adjuntos antes de cualquier import real.
3. Preparar validadores de assignment sync/conflicts y visit lifecycle/reservas.
4. Preparar payloads Make futuros solo cuando los gates correspondientes se autoricen.

## Pendientes prototipo / Claude derivados

1. Mis beneficios debe separar honorario, boleto, combo, total, pendiente, programado y pagado.
2. Admin debe ver estados de preview/revision/conflicto sin prometer pago real.
3. Lotes deben permitir seleccionar items, no incluir todos automaticamente.
4. Movimientos debe mostrar cada item individual aunque venga de lote.
5. La UI debe mostrar `manual_review_required` cuando falte llave estable o referencia de pago.
6. No exponer banco/DPI/NDA ni notas internas al shopper.

## Impacto Academia

Academia debe crear o profundizar:

- curso admin: corte junio y preview de liquidaciones;
- curso ops: reconciliacion historica sin duplicar pagos;
- curso shopper: Mis beneficios, honorario, reembolso y estados de pago;
- manual financiero: Boleto, Combo, lote, movimiento individual y revision manual;
- checklist interactivo: antes de preparar lote, antes de marcar pagado, antes de reconciliar historico, antes de publicar beneficios shopper;
- glosario: `submitido`, `candidate_ready`, `manual_review_required`, `sourceSafe`, `sourcePaymentRef`, `paymentItemId`, `movementId`, `batchId`.

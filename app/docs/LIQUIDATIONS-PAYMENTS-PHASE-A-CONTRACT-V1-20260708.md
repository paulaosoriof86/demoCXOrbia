# Liquidations Payments Phase A Contract v1

Fecha: 2026-07-08  
Bloque: liquidaciones/pagos Phase A con auditoria y estados  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar Phase A en el control operativo de liquidaciones y pagos sin ejecutar pagos reales, sin guardar datos bancarios sensibles en repo y sin tocar frontend.

El bloque parte de una regla operacional critica: las visitas hasta junio ya estan ejecutadas; lo pendiente de junio para el corte inicial son pagos/liquidaciones, no visitas.

## 2. Archivos creados

- `backend/contracts/liquidations-payments-phase-a-v1.json`
- `backend/adapters/liquidations-payment-state-adapter.preview.mjs`
- `tools/contracts/tya-liquidations-payments-contract-validate.mjs`
- `app/docs/LIQUIDATIONS-PAYMENTS-PHASE-A-CONTRACT-V1-20260708.md`

## 3. Colecciones definidas

- liquidations;
- paymentBatches;
- paymentStateAudit;
- paymentConflicts.

## 4. Estados de liquidacion

- pending_source_review;
- calculated_preview;
- review_required;
- approved_for_batch;
- batched_prepared;
- payment_scheduled;
- payment_reprogrammed;
- paid_confirmed_audited;
- disputed;
- cancelled_with_audit.

## 5. Estados de lote de pago

- draft_preview;
- review_required;
- approved_prepared;
- scheduled;
- partially_paid_audited;
- paid_confirmed_audited;
- cancelled_with_audit.

## 6. Validacion de fuente

Para estado final pagado/controlado se requiere:

- HR como fuente operacional;
- cuestionario completado validado;
- fecha submitido para pago final;
- regla estimada viernes + 15 dias desde submitido, configurable por proyecto;
- conflictos revisados antes de avanzar.

## 7. Llaves estables

No se deduplica por nombre visual. El contrato usa:

- tenantId;
- projectId;
- liquidationId;
- paymentBatchId;
- shopperId;
- visitId;
- hrRowId;
- assignmentId;
- periodKey;
- country;
- currency.

## 8. Datos prohibidos en repo

- rawBankAccount;
- rawAccountNumber;
- bankRoutingRaw;
- dpiRaw;
- paymentReceiptBinary;
- paymentReceiptBase64;
- privateBankPortalUrl;
- paymentProviderToken;
- signedPaymentInstruction;
- rawShopperEmail;
- rawShopperPhone.

## 9. Gates

- devCalculationPreview: permitido, sin pagos reales.
- devPaymentStateWrite: bloqueado.
- stagingPaymentOps: bloqueado.
- productionPaymentState: bloqueado.
- realPaymentExecution: bloqueado y fuera de alcance del preview Phase A.

## 10. Copy honesto

- Calculada/preparada no significa pagada.
- Lote preparado no significa pago ejecutado.
- Pago programado no significa pago confirmado.
- Pagado solo si existe auditoria/evidencia.
- Requiere revision si hay conflicto o falta fuente.

## 11. Impacto Phase A

Este bloque cubre:

- pagos junio como corte inicial;
- honorarios y reembolsos;
- lotes de pago;
- estados visibles para admin/shopper cuando el backend real se conecte;
- auditoria de cambios;
- conflictos de HR/plataforma/liquidacion;
- multiproyecto, pais y moneda.

## 12. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron reusable de liquidaciones/pagos con auditoria.
- Exclusivo cliente: parcial. Junio TyA y reglas de HR/submitido nacen del cliente actual.
- Claude/prototipo: si. Claude debe evitar copy de pagado si no existe auditoria y estado real.
- Academia: indirecto. Impacta manuales/admin training sobre pagos, estados y auditoria.
- Sin impacto Claude: no.

## 13. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin pagos reales.
- Sin payment provider.
- Sin datos bancarios.
- Sin recibos/base64.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.

# Liquidations and payments module review Phase A TyA

Fecha: 2026-07-04

## Objetivo

Continuar el arbol backend Phase A con liquidaciones, pagos, honorarios, reembolsos, beneficios shopper, cortes de pago y estado junio.

Este bloque no ejecuta pagos reales, no escribe Firestore, no escribe HR y no expone datos bancarios.

## Contrato creado

- `app/contracts/liquidation-payment-phase-a.tya.contract.json`

## Validador creado

- `tools/migration/tya-liquidation-payment-contract-validator.mjs`

## Decision

Phase A debe tratar visitas ejecutadas y pagos pendientes correctamente.

Para TyA/Cinepolis:

- visitas hasta junio ya ejecutadas no deben tratarse como visitas pendientes de realizar;
- junio debe entrar como corte inicial de pagos/liquidaciones pendientes;
- honorarios y reembolsos se manejan separados;
- reembolso puede ser cero/no aplica;
- pago es estado financiero separado de visita realizada, cuestionario realizado, revision y submitido;
- no se paga automaticamente por marcar visita realizada o cuestionario realizado.

## Estados de liquidacion

- `not_eligible`
- `candidate_pending_review`
- `candidate_pending_submitido`
- `candidate_ready`
- `approved_for_payment`
- `held_for_conflict`
- `held_for_missing_data`
- `cancelled`
- `paid`
- `reprogrammed_payment`

## Estados de pago

- `not_scheduled`
- `scheduled`
- `pending_payment`
- `paid`
- `payment_reprogrammed`
- `payment_failed_future`
- `manual_review_required`
- `cancelled`

## Reglas clave

1. Visita realizada no equivale a liquidacion.
2. Cuestionario realizado no equivale a liquidacion.
3. Submitido/revision debe cumplir politica antes de quedar lista para pago, salvo excepcion admin documentada.
4. Junio ejecutado debe entrar como pago pendiente, no como visita pendiente.
5. Pagos pendientes historicos pueden entrar en lotes sin duplicar visitas nuevas.
6. Multi-proyecto/multi-pais debe respetar moneda y reglas del proyecto.
7. Honorario y reembolso son montos separados.
8. No se expone banco/DPI/datos sensibles en vistas shopper.

## Lotes de pago

Un lote debe permitir:

- agrupar items de un corte;
- agregar items posteriores si el lote no esta cerrado;
- incluir pendientes de meses anteriores;
- mantener futuros separados salvo decision admin;
- registrar creado por, aprobado por, pagado por futuro/manual, fechas y auditoria.

## Mis beneficios shopper

El shopper debe poder ver, segun permisos:

- honorarios ganados;
- reembolsos;
- montos pendientes;
- montos programados;
- pagos realizados;
- historial relevante.

No debe ver:

- datos bancarios sensibles;
- notas internas;
- auditoria financiera interna;
- informacion de otros shoppers.

## Gaps detectados

- Falta mapa final HR/revision/submitido -> elegibilidad de liquidacion.
- Falta preview seguro de corte junio.
- Falta definir lote inicial y reglas de cierre.
- Falta decidir politica de datos sensibles/banco antes de cualquier almacenamiento real.
- Falta profundizar Academia para beneficios, liquidaciones y pagos.

## Pendientes backend

- Crear preview validator de corte junio con datos mock/staging.
- Mapear montos desde HR o projectConfig por pais/moneda.
- Integrar con submitido/revision admin.
- Definir lotes y estados de pago sin ejecutar pago real.
- Preparar proteccion de datos sensibles.

## Pendientes prototipo

- Separar claramente: realizada, cuestionario, submitido, liquidacion y pago.
- Mis beneficios debe mostrar honorario, reembolso, pendiente, programado y pagado.
- Admin debe poder revisar lote/corte.
- No mostrar pago real si no existe confirmacion.
- No exponer datos bancarios sensibles.

## Impacto Academia

Academia debe crear cursos/manuales para:

### Shopper

- Que es honorario.
- Que es reembolso.
- Que significa pendiente de pago.
- Que significa pago programado.
- Que significa pagado.
- Por que cuestionario realizado no significa pagado.

### Admin / ops

- Como revisar elegibilidad.
- Como preparar lote.
- Como revisar conflictos.
- Como separar honorario y reembolso.
- Como manejar corte junio.

### Consultora / franquicia / aliado

- Como se controla pago multi-proyecto/multi-pais.
- Como se evita duplicidad.
- Como se comunica estado al shopper.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin pago real.
- Sin HR writes.
- Sin datos bancarios.
- Sin deploy.
- Sin produccion.

# Resumen para Claude addendum - liquidaciones Cinepolis preview validator

Fecha: 2026-07-04

## Que hizo backend

Backend agrego un bloque seguro de preview/source-safe mapping para liquidaciones, corte junio y Cinepolis Boleto/Combo.

Archivos creados:

- `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
- `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`
- `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`

No se toco frontend. No se activo runtime. No se leyeron fuentes reales. No se escribio Firestore/HR. No hay pagos reales.

## Regla funcional que Claude debe reflejar en prototipo

1. Junio no se debe tratar como visitas pendientes de realizar. Las visitas hasta junio estan ejecutadas; lo pendiente es liquidacion/pago.
2. Visita realizada no significa pagada.
3. Cuestionario realizado no significa submitido ni pagado.
4. Submitido/revision controla elegibilidad antes de pago, salvo excepcion admin documentada.
5. Cinepolis usa Boleto y Combo como reembolsos especificos de proyecto.
6. Boleto/Combo no deben convertirse en reglas globales de CXOrbia.
7. Honorario y reembolso deben verse separados.
8. Lote de pago debe ser seleccionable por admin; no debe incluir automaticamente todo.
9. Aunque se pague un lote, movimientos debe mostrar cada pago individual con `batchId` y `paymentItemId`.
10. Si falta llave estable o referencia de pago, debe mostrarse revision manual/conflicto, no auto-dedupe ni pagado.

## Pendientes frontend concretos

### Mis beneficios

Debe mostrar al shopper:

- honorario;
- Boleto;
- Combo;
- reembolso total;
- total;
- estado: pendiente, programado, pagado, en revision/conflicto;
- historial visible permitido.

No debe mostrar:

- banco;
- DPI;
- NDA;
- notas internas;
- auditoria financiera interna.

### Admin / liquidaciones

Debe permitir:

- revisar corte junio como liquidaciones/pagos;
- separar realizada, cuestionario, submitido, liquidacion y pago;
- seleccionar items para lote;
- ver items no seleccionados;
- ver movimientos individuales;
- ver conflictos/manual review;
- no marcar pago como real si no hay confirmacion.

### Movimientos

Cada movimiento debe conservar:

- `batchId` si viene de lote;
- `paymentItemId`;
- shopper;
- visita/HR row;
- honorario;
- boleto;
- combo;
- total;
- moneda;
- fuente;
- estado.

### Textos honestos

Si el gate esta apagado, la UI debe decir preparado, pendiente, preview, requiere revision o bloqueado. No usar textos que prometan pago real, HR sync real, correo real, Make real o import real.

## Academia que Claude debe implementar/profundizar

Crear o profundizar:

- curso shopper: Mis beneficios y estados de pago;
- curso admin: corte junio, liquidaciones, lotes, Boleto/Combo;
- curso ops: revision manual y conciliacion historica;
- manual de datos sensibles en pagos;
- checklist antes de preparar lote;
- checklist antes de marcar pagado;
- checklist antes de publicar beneficios shopper;
- glosario con `sourceSafe`, `candidate_ready`, `manual_review_required`, `sourcePaymentRef`, `batchId`, `paymentItemId`, `movementId`, Boleto y Combo.

## Lo que Claude no debe tocar

- `tools/migration`.
- Contratos backend.
- Gates de Firestore/Auth/Storage/Make/Gemini/correo/pagos.
- Runners o validators backend.
- Reglas de pago real.
- Importacion real.
- Fuente HR real.

## Estado seguro

Este bloque es documental/validator. No autoriza produccion, deploy, import real, Firestore real, HR writes, Make, Gemini, correo real, WhatsApp real ni pagos.

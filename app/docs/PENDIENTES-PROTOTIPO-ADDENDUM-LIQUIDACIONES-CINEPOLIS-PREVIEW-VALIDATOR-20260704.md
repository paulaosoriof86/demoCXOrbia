# Pendientes prototipo addendum - liquidaciones Cinepolis preview validator

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador source-safe para liquidaciones/corte junio y Cinepolis Boleto/Combo. Este documento lista pendientes frontend/prototipo para Claude derivados del bloque, sin incluir tareas backend.

## Pendientes para Mis beneficios

1. Mostrar honorario, Boleto, Combo, reembolso total y total separados.
2. Mostrar estado honesto: pendiente, programado, pagado, en revision o conflicto.
3. Mostrar historial de pagos permitido por shopper.
4. No mostrar banco, DPI, NDA, notas internas ni auditoria financiera interna.
5. Aclarar que cuestionario realizado no equivale a pagado.
6. Aclarar que submitido/revision puede ser requisito de elegibilidad segun proyecto.

## Pendientes para Admin / Liquidaciones

1. Corte junio debe aparecer como liquidaciones/pagos pendientes, no visitas pendientes.
2. Separar estados operativos: visita realizada, cuestionario realizado, revision, submitido, liquidacion y pago.
3. Permitir seleccionar items para lote.
4. No agregar automaticamente todos los elegibles a lote.
5. Mostrar items elegibles no seleccionados.
6. Mostrar items en revision manual/conflicto.
7. No permitir visualmente marcar pagado sin referencia estable o confirmacion manual.
8. Mostrar que pagos historicos mayo/julio requieren conciliacion antes de cerrar nuevos lotes.

## Pendientes para Movimientos

1. Mostrar movimiento individual aunque el pago venga de lote.
2. Mostrar `batchId` o referencia visible equivalente del lote.
3. Mostrar `paymentItemId` o referencia visible equivalente del item.
4. Mostrar shopper, visita/HR row, honorario, Boleto, Combo, total, moneda, fuente y estado.
5. Mantener ajustes/reversas como movimientos separados, no sobrescrituras silenciosas.

## Pendientes para textos honestos

1. No decir que se pago si solo esta en preview.
2. No decir que se sincronizo HR si Make/HR sync esta apagado.
3. No decir que se envio correo si correo real no esta conectado.
4. No decir que se ejecuto automatizacion real si el gate esta apagado.
5. Usar etiquetas como preparado, preview, pendiente backend, requiere autorizacion, revision manual o conflicto.

## Pendientes para Academia

1. Ruta shopper: Mis beneficios y estados de pago.
2. Ruta admin: corte junio, lotes, Boleto/Combo y revision manual.
3. Ruta ops: conciliacion historica y conflictos.
4. Manual de datos sensibles en pagos.
5. Checklist antes de preparar lote.
6. Checklist antes de marcar pagado.
7. Checklist antes de publicar beneficios.
8. Glosario de estados y referencias.

## No corresponde a Claude

- Implementar validator backend.
- Tocar `tools/migration`.
- Activar pagos reales.
- Activar Firestore/HR/Make/Gemini/correo real.
- Leer fuentes reales.
- Resolver politica de datos sensibles desde UI.

## Prioridad sugerida

P0: Mis beneficios + Admin/Liquidaciones con estados honestos y separacion de montos.

P1: Movimientos individuales con lote/item asociado.

P2: Academia interactiva completa para este flujo.

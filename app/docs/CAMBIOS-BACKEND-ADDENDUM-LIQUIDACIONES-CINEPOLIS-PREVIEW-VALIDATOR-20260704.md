# Cambios backend addendum - liquidaciones Cinepolis preview validator

Fecha: 2026-07-04

## Bloque completado

Preview validators y source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo.

## Archivos creados

1. `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato de preview seguro para liquidaciones junio, Boleto/Combo, lotes, movimientos individuales y reconciliacion historica sin datos reales.
   - Por que: el tracker marcaba como siguiente bloque inmediato crear preview validator de liquidaciones/corte junio y Cinepolis Boleto/Combo.
   - Impacto frontend: ninguno directo; deja pendientes para Claude en Mis beneficios, lotes, movimientos y estados honestos.
   - Riesgo: no debe usarse con fuentes crudas ni datos sensibles.

2. `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contrato y, opcionalmente, un JSON local sintetico/sanitizado con `sourceSafe=true`.
   - Por que: permite validar llaves, estados, montos, Boleto/Combo, pago con referencia estable y revision manual antes de leer fuentes reales.
   - Impacto frontend: ninguno directo.
   - Riesgo: si se usa con archivo real no sanitizado debe fallar por metadata y campos sensibles.

3. `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, uso seguro, forma de entrada, clasificaciones, reglas de junio, Boleto/Combo, historicos, estado seguro y pendientes.
   - Por que: cerrar bloque documentado sin depender de memoria.
   - Impacto frontend: define pendientes para Claude.

4. `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: convierte el bloque tecnico en cursos, manuales, rutas por rol, checklists, glosario y notificaciones para Academia.
   - Por que: Academia debe cubrir todos los bloques con profundidad operativa.
   - Impacto frontend: pendiente para Claude en Academia interactiva.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin lectura de fuentes reales.
- Sin Firestore writes.
- Sin HR writes.
- Sin pago real.
- Sin Make/Gemini/correo real.
- Sin datos bancarios/DPI/NDA/adjuntos crudos.

## Phase A que avanza

- Liquidaciones con estado de pago.
- Corte junio como pagos/liquidaciones pendientes, no visitas pendientes.
- Boleto/Combo de Cinepolis como reembolsos configurables por proyecto.
- Lotes seleccionables y movimientos individuales.
- Reconciliacion historica previa a cierre de nuevos lotes.
- Mis beneficios como pendiente frontend respaldado por contrato.

## Pendientes backend derivados

1. Ejecutar este validador contra input local sintetico/sanitizado cuando se prepare fuente segura.
2. Crear politica consolidada de datos sensibles.
3. Crear validators pendientes de assignment sync/conflicts y visit lifecycle/reservas.
4. Preparar Make payloads futuros sin activar.

## Pendientes prototipo/Claude derivados

1. Mis beneficios debe mostrar honorario, Boleto, Combo, total y estado.
2. Admin debe seleccionar items de lote, no incluir todo automaticamente.
3. Movimientos debe conservar item individual y lote asociado.
4. La UI debe mostrar revision manual/conflicto cuando falten llaves estables.
5. No prometer pago real, HR sync real, Make real o correo real mientras gates esten apagados.

## Impacto Academia

Se creo documento especifico de Academia con rutas por rol, manuales, lecciones, checklists, glosario y notificaciones relacionadas con liquidaciones, corte junio, Boleto/Combo, lotes y movimientos.

## Siguiente bloque recomendado

Preview validator de assignment sync/conflicts o politica consolidada de datos sensibles. Por prioridad operativa, conviene cerrar primero politica de datos sensibles antes de cualquier lectura local de fuentes reales.

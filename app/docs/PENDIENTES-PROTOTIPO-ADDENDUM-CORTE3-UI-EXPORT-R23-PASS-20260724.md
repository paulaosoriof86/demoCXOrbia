# PENDIENTES PROTOTIPO — Addendum Corte 3 UI/export R23 PASS

**Fecha:** 2026-07-24  
**Prioridad del bloque:** P1/P2 no bloqueante hasta validación visual remota.

## Pendientes vivos

### Finanzas

1. Verificar visualmente sobre Hosting DEV que mayo 2026 muestre 44 visitas operativas, 42 filas financieras exactas y 2 casos en revisión sin inventar liquidaciones.
2. Confirmar que país y moneda se mantengan separados en tarjetas, drill-down y exportaciones.
3. Mantener visible y comprensible que liquidada no significa pagada.
4. No mostrar pagos confirmados mientras la fuente canónica permanezca en cero.

### Beneficios

1. Verificar con un shopper autorizado los KPI Honorarios, Reembolsos, Por cobrar y Pagado.
2. Confirmar que el detalle y los KPI usen la misma colección que Finanzas.
3. Mantener cero en Pagado cuando no exista evidencia completa.

### PDF/Excel

1. PDF: validar que la gráfica se renderice en el archivo real, no solo en la especificación.
2. Excel: mejorar formato operativo, encabezados, anchos, monedas y legibilidad si la inspección real lo confirma.
3. Mantener datos idénticos entre UI, PDF y Excel.

### UI general preservada

1. Responsive parcial de tablas y fichas.
2. Copy visible de `sourceAccessMode` donde todavía se exponga como etiqueta técnica.
3. No mostrar información técnica del gate a usuarios operativos.

## No pendiente por este bloque

No se demuestra una regresión nueva en `modules/finanzas.js` ni `modules/beneficios.js`. No se solicita reescritura ni nueva candidata por rutina.

## Gate para cerrar

`HOSTING DEV AUTORIZADO → SMOKE REMOTO → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

## Estado seguro

Este documento no autoriza modificaciones de frontend, Hosting, deploy, merge, producción, importaciones, proveedores o pagos.

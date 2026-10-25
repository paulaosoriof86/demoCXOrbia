# RESUMEN PARA CLAUDE — Addendum Corte 3 Visual HOLD

**Fecha:** 2026-07-24  
**Estado:** `P0_PROVEN_VISUAL_HOLD_CORTE3`

## Evidencia visual ya demostrada

1. `app/modules/finanzas.js` suma CxP de GTQ y HNL y la muestra en la moneda del primer país.
2. `app/core/finanzas-core.js` y `app/modules/finanzas.js` usan copy de “honorarios pagados” para liquidaciones que siguen con 0 pagos confirmados.
3. `app/modules/finanzas.js` calcula reembolsado como 85% del reembolso y presenta la diferencia como conciliación real sin fuente.
4. El selector `finDashPer` usa `CX.finStore.periods(p.id)` y solo expone julio; debe alinearse con el selector canónico proyecto/periodo.
5. Exportación real: PDF de Movimientos/Tesorería con 0 filas y Excel sin generación.
6. Las dos filas `pendiente_fuente_financiera` no tienen superficie visible de revisión.
7. Beneficios requiere `shopperId`, pero Hosting DEV no ofrece una identidad Shopper real de validación.
8. Tablas, topbar, breadcrumbs y modales no son operables correctamente en móvil.
9. Copy `IA · hallazgos & estrategias` / “Con IA conectada (Gemini)” promete una integración no activa.

## Correcciones requeridas por archivo/módulo

### `app/modules/finanzas.js`

- separar KPIs y totales por moneda; no agregar GTQ/HNL sin conversión explícita;
- renombrar estados y montos según verdad: devengado/liquidado/por pagar/pagado;
- eliminar el 85% inferido y mostrar `Pendiente de fuente` hasta conciliación real;
- conectar selector de periodo al contexto canónico global;
- distinguir claramente Dashboard Financiero de Movimientos/Tesorería;
- bloquear exportación vacía con explicación y asegurar PDF/Excel reales;
- mostrar una bandeja de revisiones con país, visita, shopper, `visitId`, `hrRowId`, motivo y estado;
- corregir responsive y scroll con pistas visibles;
- reemplazar copy de IA/Gemini por estado honesto.

### `app/core/finanzas-core.js`

- separar `honorarioDevengado`, `honorarioPorPagar` y `honorarioPagado`;
- prohibir variables/cálculos con nombre `honPaga` cuando `paymentConfirmed=false`;
- mantener moneda por país en cualquier agregado;
- no duplicar presupuesto/fijos por país sin asignación explícita.

### `app/modules/beneficios.js` y sesión DEV

- preservar el guard de identidad;
- habilitar una identidad Shopper real/controlada desde el flujo visible de DEV, sin inyección oculta del gate;
- validar moneda por shopper/visita;
- hacer el detalle responsive.

### Reportes

- validar descarga real, no solo captura de spec;
- PDF con datos, gráfica, títulos y monedas;
- Excel con archivo generado, columnas, filtros, anchos y monedas;
- deshabilitar formatos cuando no haya filas.

## Reglas que no se pueden romper

- 44 visitas de mayo;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 GT y 10 HN exactas;
- 0 pagos y 0 lotes;
- `paymentConfirmed=false` hasta fuente completa;
- no mezclar proyecto con periodo;
- no hardcodear Cinépolis;
- no publicar Gemini ni IA live sin gate y revisión humana.

## Validación esperada

Viewport móvil real, cambio de mayo/julio desde una sola fuente de contexto, revisiones visibles, Shopper accesible, PDF y Excel descargados/abiertos, y cero suma multimoneda.

# VALIDACIÓN VISUAL CORTE 3 — HOLD

**Fecha:** 2026-07-24  
**Estado:** `P0_PROVEN_VISUAL_HOLD_CORTE3_NO_FREEZE_NO_PRODUCTION`

## Evidencia revisada

Paula realizó la validación móvil de Hosting DEV y aportó diez capturas de Finanzas, Movimientos/Tesorería, exportación y Beneficios Shopper.

## P0 comprobados

1. **Agregación multimoneda inválida.** La vista Movimientos muestra `Por pagar (CxP) Q 13,229`, que corresponde exactamente a sumar `Q 7,368` de Guatemala y `L 5,861` de Honduras y rotular el resultado como quetzales. No se permite sumar monedas sin conversión ni presentar el total en la moneda del primer país.
2. **Semántica de pago falsa.** La UI y el análisis muestran “honorarios pagados” aunque la fuente canónica mantiene `0 pagos confirmados`. Los montos pueden ser devengados/liquidados/por pagar, pero no pagados.
3. **Conciliación de reembolsos inferida.** La tabla presenta diferencias `Q 817` y `L 579` como “Pendiente conciliar” sin fuente de reintegro confirmada. El módulo calcula un reembolso supuesto del 85%, lo que fabrica estado financiero operativo.
4. **Periodo financiero desconectado del contexto canónico.** El selector interno solo expone `2026-07`; los 14 periodos se cambian desde el sidebar. El selector financiero usa el store local de movimientos/presupuesto y no el contexto central proyecto/periodo.
5. **Exportación funcionalmente fallida.** El PDF visible corresponde a `Movimientos & Tesorería`, contiene 0 filas y casi no muestra información. Excel no se genera. Esto supera el pendiente previo de formato: la función no entrega el contenido esperado.
6. **Revisiones financieras no localizables.** Las dos filas `pendiente_fuente_financiera` no son visibles ni identificables por visita, shopper, país, HR row ni motivo. La revisión humana no puede ejecutarse.
7. **Beneficios Shopper no validables en sesión real.** Hosting DEV no entrega una identidad Shopper autenticada para la prueba. El smoke técnico usó un shopper controlado/inyección de sesión; no validó el acceso real que Paula debía recorrer.

## P1 comprobados

1. Tablas cortadas y desplazadas sin pista de scroll; en Reembolsos se pierde la primera columna y se lee solo el final del encabezado.
2. Topbar y breadcrumbs truncados (`Mis Benefic`, `Finanzas /`) por saturación de acciones.
3. Modal y tarjetas demasiado anchos para móvil; lectura dependiente de scroll horizontal.
4. Selector de periodo usa `YYYY-MM` sin etiqueta operativa y no explica la relación con el periodo global.
5. La UI muestra `IA · hallazgos & estrategias` y “Con IA conectada (Gemini)” aunque Gemini live está bloqueado; el análisis actual es determinístico local.
6. El reporte permite PDF/Excel/PPT aunque la vista contiene 0 filas y además muestra el toast “Sin datos para esta vista”.

## Hallazgo metodológico

El gate R25 comprobó presencia del dashboard, especificación de reporte y una sesión Shopper controlada, pero no descargó ni abrió los archivos reales, no verificó el selector con interacción humana, no probó una identidad Shopper real y no ejecutó un viewport móvil representativo. Por eso el PASS técnico no era equivalente a aceptación visual.

## Estado de las dos revisiones

Los conteos prueban que ambas pertenecen a Guatemala: 34 visitas HR GT, 32 filas exactas GT y 10/10 exactas HN. La UI actual no expone los identificadores necesarios para precisar las dos visitas sin inspección técnica adicional.

## Decisión

- Corte 3: **HOLD**.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Producción/merge/pagos/imports/writes: no autorizados.

## Siguiente bloque exacto

`DIAGNÓSTICO DE CAUSA RAÍZ POR HALLAZGO → PAQUETE FOCALIZADO PARA CLAUDE/PROTOTIPO + AJUSTE DE GATES → CANDIDATA AUDITADA → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.

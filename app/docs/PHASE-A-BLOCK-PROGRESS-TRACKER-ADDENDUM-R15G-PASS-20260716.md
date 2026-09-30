# TRACKER PHASE A — R15G PASS

Fecha: 2026-07-16

## Completado

- Fast-lane atómico documentado y protegido por validador.
- Ruta de promoción híbrida eliminada.
- Ruta DEV antigua V110/R15F eliminada.
- Nueva ruta DEV manual R15G creada, con gates locales y remotos fail-closed.
- Proyecto y periodo separados de extremo a extremo.
- HR source-safe normalizada: fechas ISO y submitido separado de liquidación/pago.
- 14 periodos, 616 visitas, 216 shoppers y 44 visitas por periodo validados.
- MAY/JUN/JUL cambian contexto e histórico.
- KPI/Finanzas/Liquidaciones acotados al periodo activo.
- Admin, Cliente y Shopper: PASS sin errores de página o consola.

## En progreso

- Promoción atómica de V156.

## Bloqueo único real

El ZIP completo de V156 no está disponible en repo, refs, objetos Git, artifacts ni fuentes alcanzables. El payload temporal disponible estaba truncado y corrupto, por lo que se eliminó para impedir una promoción parcial.

## Siguiente bloque exacto

1. Recibir nuevamente el ZIP completo V156.
2. Verificar SHA/manifest y delta.
3. Materializar el runtime completo en rama aislada.
4. Reaplicar overlays R15G/R18D de forma explícita.
5. Generar un único manifest/source lock.
6. Ejecutar los mismos gates R15G y smoke por roles.
7. Fast-forward a PR #7.
8. Con autorización específica, deploy DEV R15G, smoke remoto y revisión visual Paula.
9. Corregir solo P0 reproducibles; después, autorización de producción.

## Estado seguro

Sin deploy, producción, import real, writes, Make, Gemini ni pagos.
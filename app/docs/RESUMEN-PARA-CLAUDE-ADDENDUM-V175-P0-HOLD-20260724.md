# RESUMEN PARA CLAUDE — V175 P0 HOLD

**Fecha:** 2026-07-24  
**Siguiente candidata requerida:** V176 incremental sobre V175  
**Baseline que debe preservarse:** V174

## Instrucción

Conserva las correcciones válidas de V175. No reinicies módulos ni rediseñes. Corrige solo los P0 residuales y entrega V176 incremental.

## Archivos autorizados

- `app/app.js`;
- `app/modules/finanzas.js`;
- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/styles/layout.css`, solo si la corrección móvil lo exige.

## Correcciones obligatorias

1. **Seguridad DEV:** no considerar DEV cualquier dominio `web.app` o `firebaseapp`. Usar allowlist exacta o flag de build/runtime fail-closed.
2. **Revisiones:** filtrar explícitamente `reviewRequired`, `financialSourceStatus`, `liquidationState` y `paymentState`. Mayo debe mostrar exactamente 2 revisiones GT.
3. **Periodo:** eliminar `CX.finStore.curPeriod()` como fuente de Finanzas/Movimientos. Datos, presupuesto y exportación deben usar el periodo canónico de `CX.data`.
4. **Multimoneda:** eliminar agregados principales basados en la moneda del primer país. Cada fila y cada KPI debe conservar moneda real.
5. **Presupuesto:** una llave canónica coherente por tenant/proyecto/periodo; no duplicar el mismo gasto fijo completo por país o moneda.
6. **Exportación:** bloquear Dashboard con cero filas financieras reales, no solo con cero países.
7. **Evidencia:** entregar capturas distintas de Dashboard, bandeja con 2 revisiones, mayo/julio, shopper HNL, host DEV, host no autorizado, PDF y Excel abiertos.

## Gates obligatorios

- `node --check` de cada JS modificado;
- R26 PASS;
- `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs` PASS;
- conteos canónicos intactos;
- 0 pagos y 0 lotes.

## Prohibido

No tocar backend, tools, contratos, adapters, HR Source, interfaz pública de `CX.data`, Firebase, Functions, Rules, Make, Gemini live, pagos, lotes ni importadores. No deploy, merge, producción, nueva rama o PR.

## Entrega

Una sola candidata V176 incremental con lista exacta de archivos, delta por P0, gates, capturas y archivos PDF/Excel reales.

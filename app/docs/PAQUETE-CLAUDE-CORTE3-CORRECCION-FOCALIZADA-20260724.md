# PAQUETE PARA CLAUDE — Corte 3 corrección focalizada

**Fecha:** 2026-07-24  
**Baseline obligatoria:** V174  
**Decisión:** `CORRECTIVE_CANDIDATE_REQUIRED_FOR_P0_PROVEN`  
**No rediseñar:** trabajar únicamente sobre los archivos y comportamientos indicados.

## Instrucción principal

Corrige los P0 demostrados por la validación móvil de Paula sobre la baseline V174. No reinicies módulos, no cambies navegación general, no toques contratos/backend/tools/gates, no alteres la interfaz pública de `CX.data` y no conviertas pendientes de fuente en datos confirmados.

La candidata debe ser incremental y contener solamente los archivos necesarios.

## Archivos autorizados para corrección

1. `app/core/finanzas-core.js`
2. `app/modules/finanzas.js`
3. `app/modules/beneficios.js`
4. `app/app.js`, únicamente para la identidad Shopper controlada y visible en DEV.
5. Estilos compartidos estrictamente necesarios para responsive, conservando la identidad visual existente.
6. Archivos de reportes ya existentes, solo cuando sean necesarios para que PDF/Excel funcionen realmente.

## Archivos prohibidos

- `backend/**`;
- `tools/**`;
- `app/contracts/**`;
- adapters y snapshots source-safe;
- HR Source y mapeos;
- `CX.data` público;
- manifest/build-lock/source lock;
- Firebase/Hosting/Functions/Rules;
- Make/Gemini live;
- pagos, lotes o importadores reales.

## Tarea 1 — Estados financieros honestos

En `app/core/finanzas-core.js`:

- reemplazar el concepto ambiguo `honPaga`;
- calcular por país y moneda:
  - `honorarioDevengado`;
  - `honorarioPorPagar`;
  - `honorarioPagado`;
- `honorarioPagado` solo suma filas con `paymentConfirmed=true` y referencia de pago;
- `honorarioPorPagar` suma liquidaciones válidas sin pago confirmado;
- conservar reembolso como flujo separado;
- conservar `liquidationState` y `paymentState` separados;
- no inferir pago por estado de visita, cuestionario, submitido o liquidación.

En `app/modules/finanzas.js`:

- usar esos tres campos en KPIs, tarjetas, modal, análisis y reportes;
- no mostrar “Honorarios pagados” cuando la cifra corresponde a devengado o por pagar;
- con la fuente actual debe verse `0` como pagado.

## Tarea 2 — Multimoneda real

En Finanzas, Movimientos y Beneficios:

- agrupar totales por `moneda` y país;
- no usar la moneda del primer país para cifras de otros países;
- no sumar GTQ y HNL;
- cuando existan monedas distintas, mostrar bloques separados;
- no crear moneda base ni tasa de conversión ficticia;
- en Beneficios, agrupar honorario, reembolso, por cobrar y pagado por moneda;
- cada fila conserva su propia moneda.

Validación visible mínima:

- Guatemala mantiene `Q`;
- Honduras mantiene `L`;
- no aparece `Q 13,229` como suma de `Q 7,368 + L 5,861`.

## Tarea 3 — Eliminar conciliación inferida

En `app/modules/finanzas.js`:

- eliminar cualquier cálculo `reembolso * 0.85`;
- no mostrar “Pendiente conciliar”, faltante o conciliado con cifras inventadas;
- sin fuente confirmada, mostrar `Pendiente de fuente` y valores confirmados como `—`;
- preparar la visualización para una futura fuente con monto, moneda, fecha y referencia, sin activarla.

## Tarea 4 — Una sola fuente de periodo

- Finanzas y Movimientos deben consumir el periodo canónico actual de `CX.data`.
- No usar `CX.finStore.periods()` como catálogo principal de periodos operativos.
- El cambio desde el selector global/sidebar debe actualizar todo el módulo.
- Si queda un selector interno, debe reflejar y modificar el mismo contexto central, sin estado paralelo.
- Mayo y julio deben mostrar cifras distintas y coherentes con el periodo seleccionado.

## Tarea 5 — Bandeja visible de revisión financiera

Agregar en Finanzas una superficie visible para las filas `reviewRequired=true`.

Debe mostrar:

- país y moneda;
- visita/sucursal;
- shopper;
- `visitId`;
- `hrRowId`;
- `financialSourceStatus`;
- motivo/campo pendiente;
- estado `Pendiente de revisión` o `Pendiente de fuente`.

No permitir pago, lote ni confirmación desde esa bandeja mientras la fuente esté incompleta.

En mayo deben aparecer exactamente dos revisiones, ambas de Guatemala.

## Tarea 6 — Exportación real

- Diferenciar reportes de Dashboard Financiero y Movimientos/Tesorería.
- Deshabilitar botones/formato cuando no haya filas.
- PDF debe descargar un archivo no vacío con título, proyecto, periodo, país/moneda, filas y gráfica cuando corresponda.
- Excel debe generarse y descargar con columnas, encabezados, filtros, anchos y moneda por fila.
- No considerar completada la tarea por crear solamente una especificación en memoria.

## Tarea 7 — Shopper visible en DEV

En `app/app.js`:

- preservar el comportamiento fail-closed de producción/live;
- agregar únicamente para Hosting DEV una selección visible de identidad Shopper controlada;
- rotularla claramente como acceso de validación DEV, no Auth real;
- la identidad debe obtener un `shopperId` existente y permitir recorrer Beneficios desde login;
- no usar un shopper fijo oculto ni inyección desde el gate.

## Tarea 8 — Responsive funcional

- wrappers de tabla con scroll horizontal visible;
- pista `Desliza para ver más` o equivalente accesible;
- no perder primera columna ni encabezados;
- modal usable en viewport móvil;
- topbar y breadcrumb sin ocultar la identificación funcional de la pantalla;
- mantener diseño actual, sin rediseño general.

## Tarea 9 — Copy honesto de análisis

Sustituir:

- `IA · hallazgos & estrategias`;
- `Con IA conectada (Gemini)`.

Por un estado como:

- `Análisis determinístico`;
- `Reglas locales sobre los datos visibles`;
- `Gemini no conectado` solo cuando sea útil mostrar el estado.

No afirmar IA live, proveedor conectado ni predicción.

## Reglas de datos que deben pasar intactas

- V174/M1/Corte 1/Corte 2A intactos.
- 14 periodos y 616 visitas.
- Mayo: 44 visitas, 42 filas exactas, 2 revisiones fail-closed.
- 32 exactas GT y 10 HN.
- 209 vínculos exactos.
- 207 montos canónicos listos.
- 0 pagos confirmados.
- 0 lotes.
- Sin hardcodear Cinépolis como regla global.

## Validación que debe acompañar la candidata

1. Lista exacta de archivos modificados.
2. Explicación delta por tarea.
3. `node --check` PASS de cada JS.
4. Evidencia de que no quedan:
   - `Honorarios pagados` sobre obligaciones no confirmadas;
   - `honPaga` ambiguo;
   - `d.reemb*0.85`;
   - totales con moneda del primer país;
   - selector financiero aislado;
   - copy de Gemini conectado.
5. Capturas móvil de Finanzas, Movimientos, revisión y Beneficios.
6. PDF y Excel reales generados y abiertos.
7. Confirmación de que no tocaste archivos prohibidos.

## Criterio de aceptación para auditoría

La candidata solo puede quedar GO cuando:

- el gate R26 pase;
- no haya sintaxis/rutas rotas;
- las dos revisiones sean visibles;
- pagado permanezca en cero;
- no exista suma multimoneda;
- periodo sea canónico;
- exportación tenga archivos reales;
- Shopper sea accesible desde flujo DEV visible;
- responsive sea operable.

Después del GO, ChatGPT aplicará el delta directamente sobre `docs-tya-v6-v71-audit`, ejecutará post-gates y publicará Hosting DEV para la revalidación de Paula.

## Impacto Academia

Actualizar o marcar como pendiente en Academia:

- diferencia entre devengado, liquidado, por pagar y pagado;
- manejo multimoneda sin conversión implícita;
- revisión financiera fail-closed;
- exportación por formato;
- acceso Shopper de validación DEV vs Auth real.

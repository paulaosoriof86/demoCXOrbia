# RESUMEN PARA CLAUDE — V180 P0 HOLD → V181

## Instrucción

Trabaja sobre V180 y entrega una sola candidata **V181 incremental**. Preserva V174 y todos los fixes válidos de V175–V180.

## Conteos protegidos

- 14 periodos;
- 616 visitas;
- mayo 2026: 44 visitas HR;
- 42 filas exactas;
- 2 revisiones GT fail-closed;
- 32 exactas GT;
- 10 exactas HN;
- 209 vínculos;
- 207 montos;
- 0 pagos;
- 0 lotes.

## Delta real V180

Solo cambió `app/modules/finanzas.js`. `finanzas-core.js`, `beneficios.js`, `app.js` y `layout.css` son idénticos a V179.

## Archivos autorizados V181

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

No reescribas `app.js` o `layout.css` sin una necesidad funcional demostrada.

## Prohibido

No modificar backend, tools, contracts, adapters, HR, snapshots, mapeos, interfaz pública `CX.data`, Firebase, Make, Gemini live, pagos/lotes reales, importadores, Hosting o producción.

## Correcciones obligatorias

### 1. Revisión fuera de métricas

Antes de calcular por país, excluye de métricas y export monetario cualquier fila con:

- `reviewRequired===true`;
- `financialSourceStatus==='pending_or_review'`;
- `liquidationState==='pending_financial_source'`;
- `paymentState==='pending_source_confirmation'`;
- país/moneda no resueltos.

Conserva esas filas en una cola visible.

### 2. Presupuesto no fabricado

`finStore.pres(pid,period)` no puede copiar el periodo anterior al leer. Un periodo sin presupuesto queda vacío/Pendiente de fuente.

### 3. CxP sin duplicación

Elimina la doble suma:

- `_one.cxp + cxpLiq + _one.financiamiento`;
- `(a.cxp||0) + (a.financiamiento||0)`.

Cada obligación aparece una sola vez.

### 4. Liquidaciones y CxP histórica

- toda impresión monetaria exige moneda resuelta;
- export incluye columna moneda y bloquea revisión/falta de moneda;
- edición permite resolver país/moneda;
- elimina `p.currency[r.pais] || defCur`;
- listado histórico bloquea pendientes;
- handler `Pagar seleccionadas` vuelve a validar cada fila.

### 5. Lotes

Un lote `pending_currency` o `Revisión requerida`:

- no muestra monto monetario;
- no ofrece ni ejecuta `Marcar pagado`;
- no exporta;
- no llama `data.payVisits`;
- no aparece Pagado/Preview.

### 6. Beneficios

- detecta moneda faltante antes de agrupar;
- muestra revisión visible;
- excluye pendientes de KPIs, barras, tablas y beneficio total;
- no llama `ui.money` con moneda indefinida o `—`.

## Gates obligatorios

Ejecuta R26, R27, R28, R29, R30, R31 y R32. Todos deben pasar.

## Límite final

R32 es el cierre consolidado de fuente. Con R26–R32 PASS no crees R33 por falta de datos TyA, móvil, host o archivos abiertos. Entrega V181 para aplicación directa; esas pruebas son post-apply.

## Evidencia source requerida

1. fila exacta + review: solo la exacta afecta métricas;
2. periodo vacío no copia presupuesto;
3. CxP no duplicada;
4. liquidación sin moneda en revisión;
5. CxP histórica bloqueada;
6. lote sin moneda sin acciones;
7. Beneficios sin moneda en revisión.

## Entrega

Incluye versión exacta, lista real de archivos, SHA-256, `node --check`, reportes R26–R32, pruebas semánticas y confirmación de 0 pagos y 0 lotes reales.

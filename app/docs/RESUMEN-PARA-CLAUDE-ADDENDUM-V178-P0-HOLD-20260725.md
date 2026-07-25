# RESUMEN PARA CLAUDE — V178 P0 HOLD → V179

## Instrucción

Trabaja sobre la candidata exacta V178 y entrega una sola candidata **V179 incremental**.

No reinicies módulos, no rediseñes, no cambies arquitectura y no abras otra línea de trabajo. Preserva V174 como baseline funcional y todos los fixes válidos de V175, V176, V177 y V178.

## Estado protegido

- 14 periodos;
- 616 visitas;
- mayo 2026: 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed GT;
- 32 exactas GT;
- 10 exactas HN;
- 209 vínculos exactos;
- 207 montos canónicos;
- 0 pagos confirmados;
- 0 lotes.

## Delta real de V178

Cambios funcionales:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

Idénticos a V177:

- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

No reescribas los tres archivos idénticos sin una modificación funcional demostrada.

## Archivos autorizados para V179

1. `app/modules/finanzas.js`.
2. `app/core/finanzas-core.js`, únicamente si la resolución de contexto necesita un ajuste real.
3. `app/modules/beneficios.js`, solo si una prueba de moneda faltante demuestra una fuga nueva.
4. Estilos mínimos, solo si una nueva superficie de revisión necesita wrapper móvil.

## Archivos prohibidos

No modifiques:

- `backend/**`;
- `tools/**`;
- `app/contracts/**`;
- `app/adapters/**`;
- HR Source;
- snapshots source-safe;
- mapeos HR;
- interfaz pública de `CX.data`;
- Firebase, Functions, Rules o Storage;
- Make;
- Gemini live;
- pagos;
- lotes reales;
- importadores;
- Hosting;
- producción.

## Correcciones obligatorias

### 1. Movimiento sin moneda

Antes de cualquier `bump()`:

- resuelve moneda;
- si es `pending_currency`, agrega la fila a `pendingCurrencyRows` con tipo `mov`;
- no la agregues a Q, L ni a ningún total;
- no la incluyas como monto operativo confirmado.

### 2. Bandeja visible de moneda pendiente

`pendingCurrencyRows` debe tener una superficie humana visible con:

- tipo de registro;
- país;
- moneda;
- concepto;
- monto;
- fecha;
- id estable;
- motivo;
- estado `Pendiente de moneda`;
- pago/lote/export bloqueados.

No ocultes silenciosamente CxP, CxC, movimiento o liquidación.

### 3. Export fail-closed

Cuando existan filas con moneda pendiente:

- bloquea el export financiero completo, o
- exclúyelas del reporte monetario y genera una hoja/sección de revisión claramente separada.

Nunca exportes `pending_currency` como si fuera una moneda.

### 4. Gráfica de exportación

Elimina la suma única `byCat` de Ingreso/Egreso. Genera series por moneda:

- Ingresos Q;
- Egresos Q;
- Ingresos L;
- Egresos L;

o una gráfica separada por moneda. Nunca sumes GTQ y HNL.

### 5. Presupuesto mensual

El presupuesto no asignado no tiene moneda confirmada:

- elimina `${cur}` de rubros y totales;
- elimina `Monto mensual (${cur})`;
- exige asignación explícita de país/moneda antes de convertirlo en presupuesto monetario operativo;
- mientras no exista, muestra `sin moneda asignada`;
- no afecta margen ni gasto real.

Elimina el texto de `＋ Mes siguiente`, porque esa acción ya no existe.

### 6. Financiamientos

Elimina `p.currency[f.pais] || cur`.

- registro con país válido: usa la moneda de ese país;
- registro con moneda explícita válida: usa esa moneda;
- sin país/moneda: `Pendiente de moneda`, sin devolución operativa;
- el formulario debe actualizar la moneda visible según el país seleccionado antes de registrar el monto.

### 7. CxP/CxC manuales y edición

Elimina `Saldo (${cur})` y `Monto (${cur})`.

- país o moneda explícita es obligatorio antes de registrar/editar monto;
- sin moneda: fila en revisión;
- no habilites abono, pago o export monetario.

### 8. Lotes

Elimina `cur: ls[0].moneda || cur`.

Un lote sin moneda confirmada:

- queda en revisión;
- no muestra Q/L;
- no se suma;
- no permite marcar pago;
- no se exporta como lote monetario válido.

### 9. Contexto de periodo

El Dashboard debe leer presupuesto desde el objeto `data` recibido y su periodo canónico, no desde `CX.data.currentPeriodId` global.

## Gates obligatorios

Ejecuta los gates reales del repositorio:

- R26;
- R27;
- R28;
- R29;
- R30.

Los cinco deben devolver PASS. No sustituyas los scripts por una lista propia de tokens.

## Evidencia obligatoria

Entrega evidencia real y diferente de:

1. dos revisiones GT en mayo;
2. cambio mayo ↔ julio;
3. movimiento sin moneda en revisión;
4. export bloqueado o revisión separada;
5. gráfica por moneda;
6. presupuesto mensual sin moneda inventada;
7. financiamiento con país GT y HN;
8. financiamiento sin moneda bloqueado;
9. CxP/CxC sin moneda bloqueada;
10. lote sin moneda en revisión;
11. shopper HNL sin Q 0;
12. PDF real abierto;
13. Excel real abierto;
14. viewport móvil;
15. host DEV autorizado y host no autorizado.

## Criterio de entrega

Incluye:

- versión exacta V179;
- lista real de archivos modificados;
- SHA-256;
- `node --check` por archivo;
- reportes R26–R30;
- capturas y archivos exportados;
- confirmación de que backend, adapters, HR, `CX.data`, Firebase, Make, Gemini, pagos, lotes e importadores no fueron modificados;
- confirmación de 0 pagos y 0 lotes.

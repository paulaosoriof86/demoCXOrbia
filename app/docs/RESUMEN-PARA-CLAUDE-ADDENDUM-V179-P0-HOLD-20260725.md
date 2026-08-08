# RESUMEN PARA CLAUDE — V179 P0 HOLD → V180

## Instrucción

Trabaja sobre la candidata exacta V179 y entrega una sola candidata **V180 incremental**.

No reinicies módulos, no rediseñes, no cambies arquitectura y no abras otra línea de trabajo. Preserva V174 como baseline funcional y todos los fixes válidos de V175–V179.

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

## Delta real de V179

Solo cambió:

- `app/modules/finanzas.js`.

Son idénticos a V178:

- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

No reescribas archivos idénticos sin una modificación funcional demostrada.

## Archivo autorizado principal

- `app/modules/finanzas.js`.

`app/core/finanzas-core.js` solo puede tocarse si una única identidad canónica de presupuesto requiere un ajuste real. No toques Beneficios, app.js o estilos por rutina.

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

### 1. Una sola identidad de periodo para presupuesto

Todas las operaciones `pres`, `setPres` y `delPres` deben usar exactamente la misma identidad canónica derivada del contexto `data` recibido.

No mezcles:

- `p.id`;
- `canonicalPeriodId`;
- `canonMonth()`;
- `CX.data.currentPeriodId` global.

Dashboard y Movimientos deben abrir el mismo presupuesto para la misma selección visible.

### 2. Totales únicamente desde grupos con moneda resuelta

Elimina los totales crudos `ing`, `egr`, `ingOper`, `remesas`, CxP y CxC calculados antes del filtro.

Todos los KPIs, drill y resúmenes deben derivarse de `aggByCur` después de excluir `pending_currency`.

Esto aplica también cuando el proyecto tenga una sola moneda.

### 3. Ingresos por tipo

Filtra `PENDING_CURRENCY` antes de sumar.

Nunca muestres `Moneda pending_currency` ni llames `ui.money('pending_currency', monto)`.

La fila pendiente aparece solo en la bandeja de revisión.

### 4. Formularios reactivos y fail-closed

Para financiamientos, movimientos y CxP/CxC:

- añade listener `change` al selector de país;
- actualiza el rótulo de moneda inmediatamente;
- país o moneda explícita es obligatorio antes de guardar monto;
- sin moneda, bloquea Guardar y explica el motivo;
- no crees registros monetarios incompletos nuevos.

### 5. Edición de CxP/CxC

El modal de edición debe incluir país o moneda, permitir resolver una fila antigua y bloquear el guardado de saldo mientras siga `pending_currency`.

### 6. Abono y devolución

- CxP pendiente de moneda no muestra `Abonar` y el handler también verifica fail-closed.
- Financiamiento con saldo y moneda pendiente muestra `Pendiente de moneda`, nunca `saldado`.
- `Devolver` solo aparece y funciona con moneda resuelta.

### 7. Pago por lote

Si existe cualquier `pendingCurrencyRows` relevante:

- oculta o deshabilita `Pagar lote`;
- el handler vuelve a verificar y falla cerrado;
- ningún registro pendiente entra en `data.payVisits`.

### 8. Lotes sin moneda

Un lote `pending_currency`:

- estado `Revisión requerida`;
- no aparece como `Pagado` o `Pagado (preview)`;
- no renderiza `_m('pending_currency', monto)`;
- no permite marcar pago;
- no se exporta como lote monetario válido.

### 9. Exportación fail-closed

No dependas de `reviewSection` sin contrato runtime demostrado.

Mientras existan filas `pending_currency`, bloquea el export financiero y muestra el motivo. Después:

- `summary` usa `exportMovs.length`, no `movs.length`;
- tablas, gráficas y conteos incluyen exactamente las mismas filas;
- PDF y Excel se descargan y abren realmente.

### 10. Copy y markup

Elimina `</div>y queda editable.</div>` y revisa que el bloque de presupuesto quede balanceado y sin texto residual.

## Gates obligatorios

Ejecuta los scripts reales del checkout:

- R26;
- R27;
- R28;
- R29;
- R30;
- R31.

Los seis deben devolver PASS. No sustituyas los scripts por una lista propia de tokens.

## Evidencia obligatoria

Entrega evidencia real y diferente de:

1. dos revisiones GT en mayo;
2. cambio mayo ↔ julio;
3. mismo presupuesto en Dashboard y Movimientos;
4. movimiento sin moneda solo en revisión;
5. ingreso por tipo sin `pending_currency`;
6. formulario de movimiento con moneda reactiva y guardado bloqueado;
7. financiamiento sin moneda bloqueado y no marcado saldado;
8. CxP/CxC antigua corregida desde edición;
9. Abonar bloqueado sin moneda;
10. Pagar lote bloqueado con revisión;
11. lote sin moneda en revisión;
12. export bloqueado con revisión;
13. PDF real abierto sin pendientes;
14. Excel real abierto sin pendientes;
15. viewport móvil;
16. host DEV autorizado;
17. host no autorizado;
18. shopper HNL sin Q 0.

## Entrega requerida

Incluye:

- versión exacta V180;
- lista real de archivos modificados;
- SHA-256;
- `node --check` por archivo;
- reportes R26–R31;
- capturas y archivos exportados;
- confirmación de que backend, adapters, HR, `CX.data`, Firebase, Make, Gemini, pagos, lotes e importadores no fueron modificados;
- confirmación de 0 pagos y 0 lotes.

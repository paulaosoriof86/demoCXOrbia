# AUDITORÍA V179 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V179_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline viva preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP recibido: `Prototype development request CXOrbia V179.zip`.
- Candidata extraída: `CANDIDATA_V179_CORTE3_20260725`.
- SHA-256 ZIP: `7cd49963c0dd16622d45de313fae9307a27b7af5507695d2c9d57e18b4a54fb4`.
- GitHub autenticado, rama viva y PR #7 verificados en HEAD `9804c4c60955065a47b0f861f143072af7d9287c` antes de la auditoría.
- Manifest y cinco hashes SHA-256: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Sin secretos detectados.
- V179 no fue aplicada parcial ni totalmente.

## 2. Delta real V178 → V179

Cambio funcional real:

- `app/modules/finanzas.js`.

Byte a byte idénticos a V178:

- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

La candidata declara cinco archivos, pero el delta real funcional es de uno.

## 3. Correcciones válidas de V179

- movimiento sin moneda sale de `bump()` y entra a `pendingCurrencyRows`;
- bandeja visible de moneda no resuelta;
- gráfica exportable agrupada por moneda;
- presupuesto mensual deja de rotular importes con la primera moneda;
- lote usa `pending_currency` en vez de una moneda heredada;
- R26, R27, R28, R29 y R30 pasan sobre la candidata;
- cero pagos confirmados y cero lotes preservados.

Estas mejoras son preservables, pero no bastan para GO.

## 4. P0 comprobados

### P0-1 — Presupuesto conserva dos identidades de periodo

Dashboard/core leen con identificador de periodo/proyecto (`p.id` o `canonicalPeriodId`), mientras Movimientos usa `per=canonMonth()` (`YYYY-MM`) para `pres`, `setPres` y `delPres`.

La misma selección visible puede abrir dos presupuestos distintos. Reaparece la desalineación de llaves de V175/V176.

### P0-2 — Totales crudos se calculan antes del filtro de moneda

Persisten `ing`, `egr`, `ingOper`, `remesas`, CxP y CxC calculados directamente desde todas las filas. En una superficie de una sola moneda, una fila `pending_currency` puede entrar en KPIs rotulados Q o L.

### P0-3 — Ingresos por tipo agrega `pending_currency`

`porTipoMoneda` usa `curOf(m)` sin excluir primero `PENDING_CURRENCY`. Puede mostrar y sumar un bloque `Moneda pending_currency`.

### P0-4 — Tablas y drill renderizan moneda pendiente como dinero

Varias rutas continúan llamando `ui.money(curOf(m), monto)`. La fila no queda exclusivamente en revisión; puede aparecer como una moneda operativa literal.

### P0-5 — Formularios muestran “elige país” pero no lo implementan

Financiamientos, movimientos y CxP/CxC:

- no actualizan el rótulo monetario al cambiar país;
- no exigen país/moneda antes de guardar;
- permiten crear registros monetarios incompletos.

El cambio fue de copy, no de contrato funcional.

### P0-6 — Edición de CxP/CxC no permite resolver moneda

El modal muestra `Monto (elige país)`, pero no incluye selector de país ni moneda. Puede modificar el saldo sin solucionar la causa de revisión.

### P0-7 — Abonos permanecen habilitados sin moneda

La tarjeta de CxP siempre muestra `Abonar` y el handler permite registrar el egreso incluso cuando `currencyOf(r)==='pending_currency'`.

### P0-8 — Financiamiento activo sin moneda se marca “saldado”

Si tiene saldo pero no una moneda resoluble, no se muestra `Devolver`; el ternario cae en badge verde `saldado`. Es un estado financiero falso.

### P0-9 — Pago por lote no queda bloqueado por revisión de moneda

El botón `Pagar lote` se ofrece sin comprobar `pendingCurrencyRows`. La bandeja afirma bloqueo, pero la acción sigue disponible.

### P0-10 — Lote `pending_currency` todavía se presenta como lote pagado/monetario

La agrupación puede devolver `cur:'pending_currency'`, pero el estado permanece `Pagado` o `Pagado (preview)` y la tarjeta renderiza `_m(r.cur,r.monto)`.

### P0-11 — Exportación usa un contrato no demostrado

El reporte excluye filas pendientes de `rows`, pero usa `reviewSection`, contrato no demostrado en `CX.reportKit`. El botón no falla cerrado cuando existen revisiones.

Además, el resumen dice `Movimientos: movs.length`, aunque exporta `exportMovs.length`; el conteo del archivo puede ser falso.

### P0-12 — Copy/markup visible mal formado

El bloque de presupuesto contiene `</div>y queda editable.</div>`, texto residual y cierre incoherente visible.

## 5. Evidencia entregada

- Una captura: `01-movimientos-revision-moneda.png`.
- SHA-256: `9256a016641164e2b225e56fa4c124f5b43eb100aa18fa58e3ba47e6b3796400`.
- La captura demuestra una bandeja en demo, pero no prueba:
  - dos revisiones GT en mayo;
  - 42 exactas / 32 GT / 10 HN / 209 vínculos / 207 montos;
  - mayo ↔ julio;
  - formularios bloqueados;
  - abono, devolución y lote fail-closed;
  - PDF real abierto;
  - Excel real abierto;
  - viewport móvil;
  - host DEV autorizado y host no autorizado.

## 6. Gates

- R26: PASS.
- R27: PASS.
- R28: PASS.
- R29: PASS.
- R30: PASS.
- R31 operacional: HOLD — 4/27 PASS, 23 fallos.

Gate agregado:

`tools/qa/tya-corte3-v179-operational-currency-r31-gate.mjs`.

La causa metodológica quedó localizada: R30 verificó los patrones exactos pedidos a V179, pero no cerró las acciones vecinas, formularios, conteos de exportación ni la identidad única del presupuesto. El PASS source-only no sustituye la auditoría semántica ni la validación visual.

## 7. Decisión

- V179: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V180 incremental sobre V179, preservando V174 y todos los fixes válidos.

## 8. Clasificación

- **Reusable CXOrbia:** periodo financiero único, moneda obligatoria antes de acciones, formularios reactivos, export fail-closed y lotes en revisión.
- **Exclusivo cliente:** dos revisiones GT y conteos canónicos de mayo TyA.
- **Claude/prototipo:** corrección V180 concentrada en `app/modules/finanzas.js`.
- **Academia:** moneda pendiente, acciones bloqueadas, presupuesto, exportación y estados financieros honestos.
- **Sin impacto Claude:** auditoría, R31 y continuidad documental.

## 9. Siguiente bloque exacto

`CLAUDE CORRIGE V179 Y ENTREGA V180 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 + R30 + R31 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

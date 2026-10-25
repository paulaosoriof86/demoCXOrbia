# AUDITORÍA V176 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V176_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline viva preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP recibido: `Prototype development request CXOrbia V176.zip`.
- Candidata extraída: `CANDIDATA_V176_CORTE3_20260724`.
- SHA-256 del ZIP: `6b13adc994fa4fb64f69666c949144c8e93056741de9e090a9995f0802964edf`.
- Manifest y cinco hashes SHA-256: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- CSS: llaves balanceadas y UTF-8 sin BOM PASS.
- Tres screenshots diferentes por SHA-256: PASS.
- GitHub autenticado, rama viva y PR #7 verificados en `56ee58af1cf66ae35bb9defbc50a6c18aa7081f7` antes de escribir documentación/gates.
- No se aplicó ningún archivo funcional de V176.

## 2. Delta declarado

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

No se detectaron secretos ni archivos funcionales fuera del alcance declarado.

## 3. Correcciones válidas de V176

- `_isDevAccess()` elimina coincidencias genéricas `web.app`/`firebaseapp` y usa controles explícitos;
- la bandeja incorpora `reviewRequired`, `financialSourceStatus`, `liquidationState` y `paymentState`;
- se elimina la lectura directa de `CX.finStore.curPeriod()` desde `finanzas.js`;
- la tabla principal de Movimientos usa moneda por fila;
- los KPIs principales de Beneficios se renderizan por moneda real;
- el Dashboard bloquea exportación cuando no encuentra filas financieras derivadas;
- las capturas entregadas son distintas;
- pagado continúa en cero y no se introducen pagos/lotes reales.

Estas mejoras deben preservarse en la siguiente candidata.

## 4. P0 funcionales comprobados

### P0-1 — “Mes siguiente” conserva el periodo paralelo local

`app/modules/finanzas.js` todavía ejecuta:

`CX.finStore.crearMesSiguiente(pid())`

Ese método usa `CX.finStore.curPeriod()` y crea únicamente un mes local de presupuesto. No crea ni selecciona un periodo canónico de `CX.data`.

Consecuencia: el selector puede mostrar un periodo central, mientras la acción “Mes siguiente” muta un calendario paralelo.

**Corrección obligatoria:** crear/seleccionar un periodo canónico mediante la API autorizada de `CX.data` o mantener la acción deshabilitada con estado honesto. No usar `crearMesSiguiente()` desde Finanzas.

### P0-2 — Persisten superficies multimoneda rotuladas con una moneda única

Aunque los bloques principales se separan por moneda, permanecen fugas visibles:

- drill de Ingresos/Egresos: `ui.money(cur, Math.abs(m.monto))`;
- “Ingresos por tipo”: agrega movimientos de todas las monedas en `porTipoIng` y muestra `ui.money(cur,val)`;
- listado CxP: muestra `ui.money(cur,r.saldo)` aun cuando la fila tiene país;
- fallback `defCur0()`/`cur` sigue eligiendo una moneda única para conceptos sin alcance definido.

**Corrección obligatoria:** cada fila usa su país/moneda; todo resumen se agrupa por moneda; las filas sin moneda quedan `Pendiente de moneda`, nunca reciben la primera moneda disponible.

### P0-3 — Beneficios todavía mantiene un panel basado en la primera moneda del proyecto

`app/modules/beneficios.js` conserva:

- `const cur = _benCurSet[0]`;
- acumulados `hon`, `reemb`, `porCobrar`, `pagado`, `combo` y `boleto` filtrados por ese `cur`;
- las barras “Honorarios vs reembolsos” usan `ui.money(cur,hon)` y `ui.money(cur,reemb)`.

Un shopper únicamente HNL puede ver los KPIs superiores en L, pero el panel inferior queda calculado en la primera moneda del proyecto, normalmente Q 0.

**Corrección obligatoria:** eliminar completamente el agregado primario `cur`; barras, conceptos, modales y beneficio total deben renderizarse por cada moneda real del shopper.

### P0-4 — Presupuesto continúa con llaves proyecto/periodo incompatibles

En `CX.fin.porPais()`:

- `p=data.project()`;
- se consulta `CX.finStore.pres(p.id)` sin periodo canónico explícito.

En Movimientos:

- `p=data.period()`;
- se consulta y escribe `CX.finStore.pres(p.id, per)`.

Los dos `p.id` no representan la misma entidad y el primer acceso cae al periodo local de `finStore`.

Consecuencia: el Dashboard puede ignorar el presupuesto editado en Movimientos o leer otro mes.

**Corrección obligatoria:** una sola llave canónica derivada de `tenantId + projectId + periodId`, con periodo explícito en todas las lecturas/escrituras.

### P0-5 — El presupuesto no se descuenta, pero sigue repetido visualmente por país

`fijosPendienteAsignacion:fijosPresupuestoTotal` se adjunta dentro de cada registro `out[c]` y el tile de cada país vuelve a mostrar el mismo total, usando una moneda elegida por `defCur0()`.

El valor no infla el margen, pero continúa duplicado en la representación y puede aparecer con moneda incorrecta.

**Corrección obligatoria:** el presupuesto sin distribución debe existir una sola vez fuera de `out[c]`, con moneda/alcance pendiente explícito. Solo una asignación confirmada puede llevarlo a un país y margen.

### P0-6 — La evidencia requerida sigue incompleta

Las tres capturas son diferentes, pero:

- son superficies de escritorio de `909×540`, no recorridos móviles;
- ninguna muestra la bandeja con las dos revisiones canónicas GT;
- no hay evidencia mayo ↔ julio;
- no hay host autorizado/no autorizado;
- no hay PDF y Excel reales abiertos.

La propia candidata reconoce que ejecutó el demo y no validó los conteos TyA.

**Corrección obligatoria:** la candidata siguiente debe demostrar en el checkout canónico las dos revisiones, periodos, exportaciones y recorrido Shopper DEV antes de GO.

## 5. Gates ejecutados realmente

### R26 vigente

Resultado: `HOLD` — 23/28 PASS.

Fallos:

- `finance_declares_currency_grouping_contract`;
- `benefits_declares_currency_grouping_contract`;
- `reimbursement_requires_confirmed_source_contract`;
- `finance_tables_expose_mobile_scroll_hint`;
- `benefits_table_mobile_wrapper`.

V176 declaró “R26 12/12”, pero no ejecutó el gate vigente completo.

### R27 vigente

Resultado: `HOLD` — 7/13 PASS.

Fallos:

- `review_queue_filters_review_required`;
- `review_queue_recognizes_canonical_pending_contract`;
- `exports_do_not_label_with_parallel_period`;
- `financial_ui_does_not_create_parallel_local_month`;
- `movement_rows_use_each_row_currency`;
- `fixed_budget_not_duplicated_across_countries`.

Algunos checks de R26/R27 son contractuales/estáticos, pero los fallos de periodo local, moneda y presupuesto tienen evidencia funcional directa.

### R28 semántico nuevo

Gate agregado:

`tools/qa/tya-corte3-v176-semantic-residual-p0-r28-gate.mjs`.

Resultado sobre V176: `HOLD` — 9/18 fallos funcionales:

- creación de periodo local;
- drill de movimientos con moneda única;
- ingresos por tipo multimoneda agregados;
- CxP con moneda única;
- fallback de primera moneda en Beneficios;
- comparativo de Beneficios con primera moneda;
- presupuesto sin periodo canónico;
- presupuesto pendiente repetido por país;
- re-agregación de placeholders de presupuesto.

## 6. Decisión

- V176: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- No hubo aplicación parcial.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V177 incremental sobre V176, preservando las correcciones válidas de V175/V176 y la baseline V174.

## 7. Clasificación

- **Reusable CXOrbia:** periodo financiero único, moneda por fila/superficie, presupuesto canónico, distribución de costos fail-closed, evidencia automatizada.
- **Exclusivo cliente:** dos revisiones GT y conteos mayo TyA.
- **Claude/prototipo:** cinco archivos funcionales de V176.
- **Academia:** periodo vs mes local, multimoneda, presupuesto no asignado, revisión y evidencia.
- **Sin impacto Claude:** auditoría, R28 y continuidad documental.

## 8. Siguiente bloque exacto

`CLAUDE CORRIGE V176 Y ENTREGA V177 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

## 9. Estado seguro

Sin producción, merge, nuevo deploy, Cloud Run, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.

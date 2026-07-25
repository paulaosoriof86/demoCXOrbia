# AUDITORÍA V180 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V180_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline viva:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP: `Prototype development request CXOrbia V180.zip`.
- Candidata: `CANDIDATA_V180_CORTE3_20260725`.
- SHA-256 ZIP: `64e5acce1242f83fdc0f9fd3221320989985f420a10e588676dc7fe4b809f90f`.
- Rama viva y PR #7 verificados en HEAD `a1a82e2533d110e230dabe33cbe3351245bd0084` antes de auditar.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Secretos detectados: 0.
- V180 no fue aplicada parcial ni totalmente.

## 2. Delta real V179 → V180

Cambia únicamente:

- `app/modules/finanzas.js`.

Idénticos a V179:

- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

## 3. Gates previos

- El paquete declara R26–R31: 111/111 PASS.
- R30 reejecutado: PASS.
- R31 reejecutado: PASS.
- R32 consolidado: HOLD — 4/22 PASS, 18 FAIL.

## 4. Correcciones válidas preservables

V180 cierra los bordes literales de R31:

- formularios con selección de país y rótulos reactivos;
- botones principales bloqueados ante `pendingCurrencyRows`;
- export de Movimientos bloqueado con revisiones;
- markup residual corregido;
- R26–R31 PASS;
- 0 pagos y 0 lotes preservados.

## 5. P0 comprobados por R32

### P0-1 — Filas canónicas de revisión contaminan métricas

`finanzas-core.js` filtra liquidaciones solo por país. Las filas con `reviewRequired`, `pending_or_review`, `pending_financial_source` o `pending_source_confirmation` entran en ingreso, honorario, reembolso, CxP, CxC, margen y export del Dashboard.

El harness semántico R32 usa una fila exacta y una fila review. V180 cuenta ambas, por lo que falla la separación fail-closed.

### P0-2 — Presupuesto fabricado al leer

`finStore.pres()` copia automáticamente el presupuesto del periodo anterior al abrir un periodo vacío. Un periodo sin fuente debe permanecer vacío o `Pendiente de fuente`; una lectura no puede crear presupuesto.

### P0-3 — CxP duplicada

`aggByCur.cxp` ya recibe CxP manual, financiamientos y liquidaciones. Luego los KPIs vuelven a sumar `cxpLiq` y `financiamiento`, inflando el total en vista de una y varias monedas.

### P0-4 — Liquidaciones y CxP histórica no fallan cerrado

- existen rutas directas `ui.money(l.moneda, ...)`;
- export de liquidaciones no incluye columna moneda;
- edición de liquidación no permite resolver país/moneda;
- CxP histórica conserva `p.currency[r.pais] || defCur`;
- el handler `Pagar seleccionadas` no vuelve a validar la moneda.

### P0-5 — Lotes con revisión conservan acciones

Un lote `pending_currency` o `Revisión requerida` puede conservar:

- monto monetario en el modal;
- acción `Marcar pagado`;
- handler sin validación fail-closed;
- export sin validación.

### P0-6 — Beneficios omite silenciosamente moneda faltante

Las filas sin moneda se agrupan bajo `—` y luego se omiten de `curList`, sin una superficie visible de revisión. Otras rutas todavía llaman `ui.money(l.moneda, ...)`.

## 6. Límite del ciclo de gates

R32 es el barrido consolidado final de fuente para Corte 3.

La ausencia de estas pruebas no debe crear R33 ni otra candidata cuando R26–R32 estén PASS:

- conteos canónicos TyA de mayo;
- viewport móvil;
- host DEV autorizado/no autorizado;
- PDF y Excel descargados y abiertos.

Son pruebas post-apply sobre el mismo build. Solo un P0 nuevo, reproducible y de fuente permitiría otro HOLD.

## 7. Evidencia entregada

La captura V180 demuestra el bloque superior de Movimientos en demo, pero no prueba la fuente TyA, acciones completas, móvil, host ni archivos abiertos. Esa ausencia no causó este HOLD; los P0 anteriores sí son de fuente y reproducibles.

## 8. Decisión

- V180: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata: V181 incremental sobre V180.

## 9. Clasificación

- **Reusable CXOrbia:** revisión fuera de métricas, presupuesto no fabricado, CxP sin duplicación, liquidaciones/lotes/Beneficios fail-closed.
- **Exclusivo cliente:** 2 revisiones GT y conteos canónicos de mayo TyA.
- **Claude/prototipo:** V181 en `finanzas-core.js`, `finanzas.js` y `beneficios.js`.
- **Academia:** separación exacta/revisión, moneda, presupuesto, CxP, lotes y export.
- **Sin impacto Claude:** R32 y continuidad documental.

## 10. Incidencia de herramienta sin cambio de estado

Una llamada accidental de creación de PR fue rechazada por GitHub con 422 porque el PR #7 ya existe. No creó nueva rama, PR ni cambió el estado del repositorio.

## 11. Siguiente bloque exacto

`CLAUDE ENTREGA V181 → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26–R32 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → FUENTE TYA + MÓVIL + HOST + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

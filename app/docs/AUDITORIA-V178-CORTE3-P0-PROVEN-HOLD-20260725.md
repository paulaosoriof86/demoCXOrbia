# AUDITORÍA V178 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V178_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline viva preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP recibido: `Prototype development request CXOrbia V178.zip`.
- Candidata extraída: `CANDIDATA_V178_CORTE3_20260725`.
- SHA-256 ZIP: `ff77d4c6adda699327b4620207eb0be83689dbd3da55651c9a31d091b8217268`.
- GitHub autenticado, rama viva y PR #7 verificados en HEAD `7c50bf79ff8105f7d00d82eac13a020000a44f7b` antes de la auditoría.
- Manifest y cinco hashes SHA-256: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Sin secretos detectados.
- V178 no fue aplicada parcial ni totalmente.

## 2. Delta real V177 → V178

Cambios funcionales:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

Byte a byte idénticos a V177:

- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

La candidata declara cinco archivos, pero el delta real funcional es de dos.

## 3. Correcciones válidas de V178

- presupuesto del Dashboard con periodo explícito;
- eliminación de los defaults ficticios 4000/1200/800;
- presupuesto pendiente presentado como planeado y no como gasto ejecutado en el Dashboard;
- `currencyOf()` fail-closed como base de moneda;
- financiamientos del análisis agrupados por moneda;
- `CX.fin.porPais(data)` resuelve el periodo desde el contexto `data` recibido;
- R26, R27, R28 y R29 pasan sobre la candidata;
- cero pagos confirmados y cero lotes preservados.

Estas mejoras son preservables, pero no bastan para GO.

## 4. P0 comprobados

### P0-1 — Movimiento sin moneda todavía entra a agregación

`currencyOf()` devuelve `pending_currency`, pero `movs.forEach()` llama `bump()` sin detener primero la fila. El registro se convierte en un bloque monetario `pending_currency` en lugar de entrar a revisión antes de cualquier suma.

### P0-2 — `pendingCurrencyRows` no tiene superficie visible

La colección se llena para CxP, CxC y liquidaciones, pero no se renderiza, cuenta ni incorpora a una bandeja humana. Las filas quedan omitidas silenciosamente.

### P0-3 — Exportación incluye moneda no resuelta

El export de Movimientos usa todas las filas `movs`, incluida una fila cuya moneda sea `pending_currency`. No bloquea el archivo ni separa una hoja/cola de revisión.

### P0-4 — Gráfica de exportación vuelve a sumar monedas

`byCat` suma `Math.abs(m.monto)` en una sola serie Ingreso/Egreso sin agrupar por moneda. PDF/Excel/PPT pueden mezclar GTQ y HNL aunque las tablas visibles estén separadas.

### P0-5 — Presupuesto mensual todavía usa la primera moneda

En Movimientos, los rubros y el total de presupuesto se muestran con `${cur}` y el formulario usa `Monto mensual (${cur})`. Ese presupuesto sigue sin asignación por país/moneda; rotularlo con la primera moneda es falso.

### P0-6 — Copy conserva una acción eliminada

El texto sigue indicando que `＋ Mes siguiente` replica el presupuesto, aunque esa acción fue retirada para evitar el periodo financiero paralelo.

### P0-7 — Financiamientos conservan fallback a la primera moneda

Listado, saldo y devolución usan `p.currency[f.pais] || cur`. Un registro incompleto puede rotularse con la moneda del primer país.

### P0-8 — Alta de financiamiento captura monto antes de resolver moneda

El formulario muestra `Monto (${cur})` y luego el selector de país. La moneda visible no se actualiza según el país elegido.

### P0-9 — CxP/CxC manuales y edición usan primera moneda

Los formularios muestran `Saldo (${cur})` y `Monto (${cur})`; país/moneda no se exige antes de registrar o modificar el saldo.

### P0-10 — Lote con moneda faltante hereda primera moneda

`cur: ls[0].moneda || cur` vuelve a rotular con la moneda primaria un lote cuya moneda no está confirmada, aunque el agrupador lo haya marcado para revisión.

### P0-11 — Dashboard usa periodo global en una lectura

`CX.finStore.pres(p.id, CX.data.currentPeriodId)` usa el global `CX.data` dentro del módulo, en lugar del contexto `data` recibido y su periodo canónico.

## 5. Evidencia entregada

- Solo se entregó `01-dashboard-presupuesto-pendiente.png`.
- La captura muestra la parte superior del Dashboard, pero no la tarjeta de presupuesto pendiente indicada por el nombre.
- No demuestra:
  - dos revisiones GT en mayo;
  - mayo ↔ julio;
  - fila `pending_currency` en revisión;
  - presupuesto mensual sin moneda inventada;
  - financiamientos y CxP/CxC por moneda;
  - PDF real abierto;
  - Excel real abierto;
  - viewport móvil;
  - host DEV autorizado y host no autorizado.

## 6. Gates

- R26: PASS.
- R27: PASS.
- R28: PASS.
- R29: PASS.
- R30 residual: HOLD — 1/12 PASS, 11 fallos.

Gate agregado:

`tools/qa/tya-corte3-v178-residual-finance-truth-r30-gate.mjs`.

La causa metodológica es localizada: R29 verificó patrones concretos de V177, pero no hizo inventario de todas las superficies monetarias vecinas ni de la exportación. V178 corrigió el patrón anterior, mientras otras rutas siguieron usando la primera moneda o no hicieron visible la revisión.

## 7. Decisión

- V178: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V179 incremental sobre V178, preservando V174 y todos los fixes válidos.

## 8. Clasificación

- **Reusable CXOrbia:** moneda fail-closed en todas las superficies, review queue visible, export por moneda, presupuesto sin moneda inventada, financiamientos/CxP/CxC/lotes.
- **Exclusivo cliente:** dos revisiones GT y conteos canónicos de mayo TyA.
- **Claude/prototipo:** corrección V179 principalmente en `app/modules/finanzas.js`; `finanzas-core.js` solo si requiere contexto adicional.
- **Academia:** moneda faltante, presupuesto no asignado, exportación multimoneda y revisión financiera.
- **Sin impacto Claude:** auditoría, R30 y continuidad documental.

## 9. Siguiente bloque exacto

`CLAUDE CORRIGE V178 Y ENTREGA V179 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 + R30 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

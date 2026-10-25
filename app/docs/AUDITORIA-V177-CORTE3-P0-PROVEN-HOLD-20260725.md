# AUDITORÍA V177 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V177_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline funcional preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP recibido: `Prototype development request CXOrbia V177.zip`.
- Candidata extraída: `CANDIDATA_V177_CORTE3_20260725`.
- SHA-256 ZIP: `cb755c9d7ce02d11944cb9926d1362ef37062a6edb8a46f28544ed3c7b849aea`.
- Manifest y cinco hashes de archivo: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Dos capturas diferentes: PASS.
- GitHub autenticado, rama viva y PR #7 verificados en HEAD `e169032e7033aa0c991feb7cfac7e457a29ec445` antes de documentar.
- No se aplicó ningún archivo funcional.

## 2. Delta real

La candidata declaró cinco archivos, pero el delta V176→V177 real es de tres:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

Estos dos archivos son byte a byte idénticos a V176 y no deben reescribirse:

- `app/app.js`;
- `app/styles/layout.css`.

## 3. Correcciones válidas de V177

- elimina la acción UI `CX.finStore.crearMesSiguiente()`;
- R26, R27 y R28 pasan sobre la fuente de V177;
- completa agrupación visible por moneda en varias superficies;
- elimina la moneda primaria del panel inferior de Beneficios;
- mueve el presupuesto no asignado a `__unassignedBudget`, fuera del mapa enumerable por país;
- conserva la allowlist DEV fail-closed de V176;
- conserva cero pagos y cero lotes.

## 4. P0 comprobados

### P0-1 — El presupuesto del Dashboard continúa usando el periodo local implícito

`app/modules/finanzas.js` conserva llamadas `CX.finStore.pres(p.id)` sin periodo explícito. `finStore.pres()` cae en `curPeriod()`, por lo que el Dashboard puede leer o crear un presupuesto distinto al periodo canónico visible.

**Corrección:** toda lectura/escritura debe recibir el periodo canónico explícito y la misma llave `tenantId + projectId + periodId`.

### P0-2 — Se crean montos ficticios de presupuesto cuando la fuente está vacía

El Dashboard conserva:

- `defaults={'Coordinación':4000,'Software/plataforma':1200,'Transporte':800}`;
- `Object.assign(store,defaults)` cuando no hay rubros.

Esto convierte ausencia de fuente en cifras financieras visibles.

**Corrección:** mostrar `Pendiente de fuente` o estado vacío; nunca sembrar montos.

### P0-3 — Filas sin país/moneda heredan la primera moneda

Los resolutores `curOf` y `curOfRow` terminan en `|| cur`. Además, CxP/CxC y liquidaciones sin moneda se agrupan mediante `|| cur`.

En un proyecto GT/HN, una fila incompleta puede quedar clasificada como Q en vez de fail-closed.

**Corrección:** usar `pending_currency`, excluir la fila de agregados monetarios y enviarla a revisión.

### P0-4 — Financiamientos multipaís todavía se suman y se rotulan con una moneda única

El análisis suma `CX.finStore.cxp(p.id)` y lo presenta con `defCur0(p)`. Mezcla saldos de distintas monedas bajo la primera moneda del proyecto.

**Corrección:** agrupar financiamientos por moneda o bloquear el total si falta moneda.

### P0-5 — Presupuesto sin asignación se presenta como gasto real ejecutado

V177 obtiene `fp.__unassignedBudget.total`, lo guarda en `fijReal` y lo usa en:

- semáforos `real vs presupuestado`;
- `Total ejecutado`;
- análisis de gasto fijo.

Ese valor es presupuesto planeado sin asignación, no gasto real.

**Corrección:** mantenerlo como `presupuesto pendiente de asignación`, fuera de margen y fuera de ejecución real.

### P0-6 — Se referencia un campo eliminado y se rotula presupuesto sin moneda con la primera moneda

El Dashboard todavía consulta `d.fijosPendienteAsignacion`, aunque V177 eliminó ese campo de cada país. La tarjeta de presupuesto usa `defCur0(p)` para mostrar un presupuesto cuya moneda no está asignada.

**Corrección:** una sola superficie de presupuesto pendiente, sin moneda inventada y sin referencia a campos eliminados.

### P0-7 — El core rompe el contexto suministrado en llamadas reutilizables

`CX.fin.porPais(data)` usa `CX.data.currentPeriodId` global en lugar del contexto `data` recibido. Esto es incorrecto para adapters como `serieMensual()` que pasan otro periodo/proyecto.

**Corrección:** resolver el periodo desde `data.period()` o un accessor explícito del contexto recibido.

### P0-8 — Evidencia de aceptación sigue incompleta

Las dos capturas no prueban:

- las 2 revisiones GT de mayo;
- cambio mayo↔julio;
- fila sin moneda fail-closed;
- presupuesto vacío sin cifras ficticias;
- PDF real abierto;
- Excel real abierto;
- viewport móvil;
- host DEV autorizado y host no autorizado.

## 5. Gates

- R26 real: PASS.
- R27 real: PASS.
- R28 real: PASS.
- R29 financiero semántico: HOLD, 11/12 checks fallidos.

Gate agregado:

`tools/qa/tya-corte3-v177-finance-truth-r29-gate.mjs`.

R26/R27/R28 no detectaban los fallos porque validaban patrones anteriores, no la semántica completa de presupuesto, moneda faltante y contexto suministrado.

## 6. Decisión

- V177: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- No hubo aplicación parcial.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V178 incremental sobre V177.

## 7. Clasificación

- **Reusable CXOrbia:** presupuesto canónico sin fixtures, moneda faltante fail-closed, contexto financiero inyectado y financiamientos por moneda.
- **Exclusivo cliente:** conteos TyA y dos revisiones GT de mayo.
- **Claude/prototipo:** corrección de los tres archivos con delta real.
- **Academia:** presupuesto planeado vs ejecutado, moneda pendiente y contexto canónico.
- **Sin impacto Claude:** auditoría, R29 y continuidad documental.

## 8. Siguiente bloque exacto

`CLAUDE CORRIGE V177 Y ENTREGA V178 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 + R28 + R29 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN CANÓNICA/MÓVIL + PDF/EXCEL → APROBADO → FREEZE CORTE 3`.

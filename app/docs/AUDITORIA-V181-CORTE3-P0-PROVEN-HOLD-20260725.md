# AUDITORÍA V181 — Corte 3 P0 PROVEN HOLD

**Fecha:** 2026-07-25  
**Estado:** `V181_P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`  
**Baseline funcional preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. EXECUTION_LANE_READY

- ZIP recibido: `Prototype development request (17).zip`.
- Candidata extraída: `CANDIDATA_V181_CORTE3_20260725`.
- SHA-256 ZIP: `318f6eb5e3ba0fd1a0d8b1f47890fcb83de243e625193a9dac9a4e01bef5b33d`.
- PR #7 y rama viva verificados en HEAD `4834d99a819557149c76c1c62ab98f59ee56f964` antes de la auditoría.
- Manifest y cinco hashes: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 JavaScript PASS.
- Secretos detectados: 0.
- V181 no fue aplicada parcial ni totalmente.

## 2. Delta real V180 → V181

Cambios funcionales reales:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

Byte a byte idénticos a V180:

- `app/app.js`;
- `app/styles/layout.css`.

La candidata declara cinco archivos, pero el delta funcional real es de tres.

## 3. Avances válidos preservables

- filas de revisión excluidas de las métricas del core;
- presupuesto vacío ya no copia el periodo anterior;
- CxP deja de sumarse dos veces en los KPIs conocidos;
- liquidaciones y CxP histórica incorporan controles de moneda;
- lotes y Beneficios incorporan estados de revisión;
- R26, R28, R29, R30 y R31 pasan sobre la candidata;
- R27 vigente también pasa, aunque su conteo real en el repo es 13 checks y no 14;
- el R32 anterior pasa sus 22 condiciones;
- 0 pagos confirmados y 0 lotes reales preservados.

## 4. P0 reproducible — helpers fuera de alcance de módulo

`PENDING_CURRENCY` y `currencyOf` se declaran dentro del callback de:

`CX.module('movimientos', ...)`

pero se usan dentro de callbacks independientes:

- `CX.module('liquidaciones', ...)`;
- `CX.module('lotes', ...)`.

Los callbacks de `CX.module` no comparten scope léxico. `node --check` no detecta este error porque los identificadores se resuelven únicamente en ejecución.

### P0-1 — Lotes no inicia

Reproducción con el módulo registrado y fixtures de lote habilitados:

```text
ReferenceError: PENDING_CURRENCY is not defined
at app/modules/finanzas.js:828:117
at Array.map
at Object.lotes
```

Impacto:

- la vista Lotes falla al renderizar;
- el flujo de Corte 3 no puede considerarse operativo;
- pago/export fail-closed no puede validarse porque el módulo se rompe antes.

### P0-2 — CxP histórica falla al abrir

Reproducción al ejecutar `Incluir CxP de meses anteriores` con una fila histórica:

```text
ReferenceError: currencyOf is not defined
at app/modules/finanzas.js:710:63
at Array.filter
```

Impacto:

- no se puede listar ni revisar CxP histórica;
- el control de moneda agregado por V181 no llega a ejecutarse;
- bloquea el flujo operativo de liquidaciones/CxP.

## 5. R32 final ampliado, no R33

No se creó R33.

El gate final existente:

`tools/qa/tya-corte3-v180-source-closure-r32-gate.mjs`

fue ampliado con un harness runtime de módulos para detectar errores de scope que la sintaxis y los regex no cubren.

Resultado V181 con R32 vigente:

- 23/25 PASS;
- 2 FAIL;
- `lotes_has_no_cross_module_scope_reference`;
- `historical_cxp_has_no_cross_module_scope_reference`.

El límite metodológico se conserva: datos TyA, móvil, host y PDF/XLSX continúan siendo pruebas post-apply y no originan otro gate por sí solas.

## 6. Corrección mínima comprobada localmente

Una prueba controlada, sin aplicar al repo, confirmó que el defecto se corrige localmente al dar scope propio a los helpers:

- Liquidaciones: `PENDING_CURRENCY` y resolver de moneda local;
- Lotes: `PENDING_CURRENCY` local;
- o un helper top-level explícito que reciba `row` y `project`, sin depender del closure de Movimientos.

Con la corrección mínima sobre una copia local:

- `node --check`: PASS;
- R30: PASS;
- R31: PASS;
- R32 ampliado: PASS.

Esta prueba no sustituye la candidata V182 ni autoriza aplicación manual.

## 7. Decisión

- V181: `P0_PROVEN_HOLD`.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze Corte 3: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V182 incremental sobre V181.

## 8. Alcance V182

Archivo funcional principal:

- `app/modules/finanzas.js`.

No reescribir core, Beneficios, app.js o estilos si no existe un delta funcional real.

V182 debe:

1. eliminar todas las referencias cruzadas a helpers locales de otro `CX.module`;
2. ejecutar R26–R32 vigentes;
3. demostrar que Lotes inicia;
4. demostrar que `Incluir CxP de meses anteriores` abre con una fila;
5. conservar todas las correcciones válidas de V181;
6. mantener 0 pagos y 0 lotes reales.

## 9. Clasificación

- **Reusable CXOrbia:** aislamiento de scope entre módulos y harness runtime reusable.
- **Exclusivo cliente:** conteos TyA y pruebas canónicas post-apply.
- **Claude/prototipo:** V182 localizada en Finanzas.
- **Academia:** diferencia entre validación sintáctica y validación runtime de módulos.
- **Sin impacto Claude:** actualización documental y del gate R32.

## 10. Estado seguro

Sin producción, merge, Hosting DEV, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.

## 11. Siguiente bloque exacto

`CLAUDE ENTREGA V182 → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26–R32 VIGENTES → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → TYA/MÓVIL/HOST/PDF/XLSX → APROBADO → FREEZE CORTE 3`.

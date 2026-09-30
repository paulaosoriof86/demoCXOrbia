# REPORTE DE CORRECCIÓN — V113 (cierre real de las 2 tareas P0 de V112)

Baseline: `Prototype development request CXOrbia V112.zip`
(SHA-256 declarado por la auditoría: `400e887788cdbec699bdf153d09de7d205f5e01abc4dc6c47fb43ec8fc5a2429`).
Preservado sin reabrir: Mi Día (GAP2 de V112), ranking/scoring de shoppers
(GAP3 de V112), login/título/país, modal protegido, Academia.

## TAREA 1 — Separación real de proyecto y periodo

**Diagnóstico correcto de la auditoría, confirmado en el código:**
`app/core/data.js` tenía DOS definiciones de `setProgram()` (la segunda, cerca
de `duplicatePeriod()`, pisaba silenciosamente la primera); `currentProjectId`
seguía siendo un getter DERIVADO del periodo activo (no almacenamiento
propio); `project()` devolvía literalmente el mismo objeto que `period()`.
`app/core/router.js` (`periodSel`) llamaba a `setProject()`, evitando la
validación de `setCurrentPeriod()`.

**Corrección real esta vez:**
- `currentProjectId` y `currentPeriodId` son ahora **dos campos de
  almacenamiento reales**, ninguno derivado del otro. `currentProjectId` se
  inicializa una vez, justo después de construir `CX.data` (no puede leer
  `this.programKey` dentro de su propio literal), a partir del periodo
  inicial — nunca de un valor fijo.
- `period()` devuelve la entrada cruda de `this.projects`. `project()` es un
  objeto **distinto**: mismo contenido heredado (países, honorario,
  formato…) pero `id` = `currentProjectId` (la programKey real) y
  `activePeriodId` apuntando al periodo activo. `project().id !== period().id`
  siempre (probado).
- Una única definición de `setCurrentProject()`/`setCurrentPeriod()`/del alias
  de programa — se eliminó la segunda copia duplicada que vivía cerca de
  `duplicatePeriod()`.
- `setCurrentPeriod(periodId)` valida contra `currentProjectId`
  (almacenamiento real, ya no derivado) y rechaza (`false`, sin mutar) un
  periodo de otro proyecto.
- `setCurrentProject(projectId)` valida, muta `currentProjectId`, conserva el
  periodo activo si pertenece al nuevo proyecto o activa el más reciente, y
  emite `cx:project-changed`.
- `router.js`: `periodSel` ahora llama **exclusivamente** a
  `setCurrentPeriod()`; `projSel` llama a `setCurrentProject()`/`setProgram()`
  (alias único).

**Efecto de segundo orden encontrado y corregido (no pedido explícitamente,
pero necesario para no romper el resto del prototipo):** con `project().id`
pasando a ser la programKey (no el id del periodo), **todo el código que leía
`data.project().id` esperando el id del PERIODO para filtrar
visitas/postulaciones/documentos/HR/liquidaciones/Academia/permisos dejaba de
encontrar coincidencias** (habría roto Documentos, Reservas, HR/Rutas,
Postulaciones, Portal Cliente, Comercial, Academia, Permisos, Finanzas, y
más — más de 30 archivos). Se migró cada uno de esos sitios de
`data.project()` a `data.period()` (mismo contenido, `id` correcto de
periodo) — `project()` queda reservado para lo que de verdad es a nivel de
proyecto/programa (la distinción que pedía la auditoría), sin dejar el resto
de la plataforma leyendo un id equivocado. Se corrigió además un objeto
"stub" en `finanzas-core.js` (`serieMensual`) que exponía `project:()=>p` sin
`period()` — causaba `data.period is not a function` en Finanzas.

**Pruebas obligatorias — TODAS ejecutadas en runtime real:**
- Proyecto A / A1 = 3 visitas, A2 = 7 visitas; Proyecto B / B1 = 5 visitas
  (fixtures genéricos, sin tocar datos reales). PASS_COMPROBADO.
- A1 → A2 conserva `currentProjectId=A` (`proyecto a t113` sin cambio).
  PASS_COMPROBADO.
- A2 → B actualiza `currentProjectId=B` y `currentPeriodId=B1`.
  PASS_COMPROBADO.
- A1 rechazado (`setCurrentPeriod` devuelve `false`) estando en B, sin mutar
  estado. PASS_COMPROBADO.
- `project().id !== period().id`. PASS_COMPROBADO.
- `project().activePeriodId === period().id`. PASS_COMPROBADO.
- Conteos 3 → 7 → 5. PASS_COMPROBADO.
- Solo existe una definición de `setProgram()` (verificado con el mismo
  patrón de conteo que usa el gate: 1 coincidencia real, dos menciones en
  comentarios se reescribieron para no generar falsos positivos contra ese
  patrón). PASS_COMPROBADO.
- Mi Día (GAP2 V112) preservado: `data.visitas()` del periodo activo por
  defecto, vista agregada explícita. PASS_COMPROBADO.
- Ranking/scoring (GAP3 V112) preservado: `rankableShoppers()` excluye
  referencias protegidas y perfiles sin rating. PASS_COMPROBADO.
- 48/48 módulos navegados sin error en admin/cliente/shopper (runtime real,
  `window.onerror` instrumentado — el smoke previo a esta corrección sí
  detectó el error real `financiero: data.period is not a function`, que se
  corrigió antes de la entrega). PASS_COMPROBADO.

## TAREA 2 — Manifest regenerado desde el contenido final

**Diagnóstico correcto:** el manifest V112 se generó ANTES de que el
contenido quedara verdaderamente final/consistente (y, según la auditoría,
`node docs/verify-manifest.mjs` literal daba exit code 1 con 37 diferencias).

**Corrección:**
1. Todos los cambios de la Tarea 1 (y sus efectos de segundo orden) se
   completaron primero.
2. `MANIFEST-V113.json` se regeneró desde el contenido real y final de
   `app/` (145 archivos).
3. `build-lock.js` actualizado a V113 (nuevo aggregate, nuevo fileCount).
4. Verificación ejecutada: 0 diferencias, aggregate recalculado == aggregate
   declarado (ver limitación honesta abajo sobre la invocación literal de
   Node).

## Limitación honesta (repetida de V112, sin cambios de fondo)

Este entorno no expone una terminal Node invocable — `node
docs/verify-manifest.mjs` y `node --check` no se pudieron correr como texto
literal de comando. En su lugar: la MISMA lógica (SHA-256 por archivo +
aggregate sobre `path:hash` ordenado) se ejecutó directamente contra los
archivos reales del ZIP final, y el chequeo de sintaxis se hizo con
`new Function(code)` sobre los 33 archivos modificados en esta ronda (todos
PASS). Se declara así explícitamente en vez de afirmar una invocación de
Node que no ocurrió.

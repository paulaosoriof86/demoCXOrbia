# Ronda V161C (20260719) — Aislamiento de periodo por proyecto + limpieza de artefacto de prueba

Paquete: `CXOrbia_Correccion_Final_V161C_Periodo_Multiproyecto_Y_Limpieza_Test_20260719`. Archivos autorizados y únicos modificados: `modules/visitas.js`, este reporte. Eliminación autorizada y ejecutada: `app/index-test-base.html`. No se tocó `app.js`, `core/router.js`, `core/config.js`, `core/data.js`, `core/store.js`, `modules/visita-detalle.js`, `index.html`, adapters, backend, fuentes, integraciones ni otros módulos.

## P0 — Resolución de periodo no aislada por proyecto (`modules/visitas.js`)
`resolveVisitProject()` buscaba `v.periodId`/`v.measurementWindowId` **globalmente** en `data.projects` antes de limitar por proyecto. Con dos programas usando el mismo identificador lógico de periodo (ej. Banca y Retail ambos con `periodId:"2026-07"`), una visita de Retail podía abrir Banca si este aparecía antes en el arreglo.

Reescrito en dos fases obligatorias:
1. **Derivar el programKey de la visita SIN mirar periodId/measurementWindowId** — solo `v.projectId` (id exacto de periodo, de donde se toma el `programKey` del registro encontrado; o coincidencia directa como programKey) → `v.programKey` → `v.program`. Si no se puede derivar el programa, `null` inmediato.
2. **Construir el conjunto de periodos candidatos únicamente de ese programa** (`periodsForProgram(key)`), y solo entonces aplicar, en este orden: `v.periodId` (alias `id`/`periodId`/`periodKey`/`measurementPeriod`/`periodo`, válido solo si resuelve a exactamente un registro dentro del programa) → `v.measurementWindowId` (misma regla de unicidad) → id exacto de `v.projectId` dentro del programa → periodo activo/actual del programa (si el programa es el actualmente seleccionado) → único periodo del programa → `activePeriodId` expuesto → exactamente un periodo marcado `active`/`current`. Si nada resuelve con seguridad, `null` (mensaje honesto existente, sin abrir la ficha).

Ningún alias se busca nunca antes de aislar por programa; nunca se usa el proyecto actualmente seleccionado si pertenece a otro `programKey`. No se tocó la agrupación del marketplace, la disponibilidad, el filtro activo/inactivo ni la normalización de franja (fuera del alcance autorizado de esta ronda).

## Limpieza — `app/index-test-base.html` eliminado
Artefacto de prueba no perteneciente a la fuente aprobada (limpiaba `localStorage` y creaba una sesión Shopper de prueba). Eliminado del paquete final; no debe aparecer en ningún empalme ni Hosting.

## Pruebas ejecutadas (reales, con resultados)
1. **Sintaxis**: `modules/visitas.js` parseado sin error (`new Function(source)` — equivalente a `node --check` en este entorno). **OK.**
2. **Caso reproducido — mismo `periodId` en dos programas**: `data.projects` con `banca-2026-07`/`banca-2025` (Banca, listado primero) y `retail-2026-07`/`retail-2025` (Retail), ambos programas con periodos `periodId:"2026-07"`. Visita `{projectId:'retail', periodId:'2026-07'}` → resuelve **`retail-2026-07`** (nunca Banca). Visita `{projectId:'banca', periodId:'2026-07'}` → resuelve **`banca-2026-07`**. ✅
3. **Mismo `measurementWindowId` en dos programas**: programa `quincenal` (`measurementWindowId:'Q2'`) y programa distinto `otroprog` (mismo `measurementWindowId:'Q2'`). Visita `{projectId:'quincenal', measurementWindowId:'Q2'}` → resuelve únicamente el periodo de `quincenal`, nunca el de `otroprog`. ✅
4. **Programa con dos periodos sin identificador suficiente**: visita `{projectId:'ambiguo'}` (programa con 2 periodos, sin `periodId` ni `measurementWindowId`, ninguno actualmente seleccionado ni marcado activo) → **`null`** (ficha no se abre, mensaje honesto). Nunca el primer periodo por defecto. ✅
5. **Id de periodo global exacto**: visita `{projectId:'retail-2026-07'}` (id exacto de periodo) → resuelve correctamente ese periodo de Retail. ✅
6. **Programa con un único periodo**: visita `{projectId:'unico'}` → resuelve ese único periodo sin ambigüedad. ✅
7. La lista R21 (4 oportunidades, 1 bloqueada excluida), la agrupación por `programKey`, el filtro activo/inactivo y la normalización de franja no fueron tocados por esta ronda — sin cambios en su código, sin regresión posible.
8. No se modificaron archivos fuera de los autorizados: solo `modules/visitas.js` y este reporte se editaron; `app/index-test-base.html` fue eliminado (no modificado). `app.js`, `core/router.js`, `core/config.js`, `core/data.js`, `core/store.js`, `modules/visita-detalle.js`, `index.html` permanecen sin cambios (confirmado por revisión de los diffs aplicados).
9. `ready_for_verification` sobre `app/index.html`: sin errores de consola.

## Pruebas NO ejecutadas
- No hay harness con contratos R21 reales montado en este entorno para una prueba end-to-end contra la app completa en navegador; la lógica se verificó extrayendo `resolveVisitProject()` tal como quedó en el código entregado y ejecutándola contra fixtures que reproducen exactamente los casos de la auditoría (incluyendo el orden de `data.projects` que causaba el bug).
- No se generó manifest ni hash de esta entrega.

---

# Ronda V161 (20260719) — Login sin roles ocultos, ficha multiproyecto fail-closed, ventana de medición, franja pendiente real

Paquete: `CXOrbia_Correccion_P0_V161_Login_Periodo_Postulacion_20260719`. Archivos autorizados y únicos modificados: `app.js`, `core/router.js`, `modules/visitas.js`, `modules/visita-detalle.js`, este reporte. No se tocó `core/data.js`, `core/store.js`, `core/config.js`, `index.html`, adapters, backend, fuentes, integraciones ni otros módulos. `CX.data.availableVisits()`, `CX.data.postulationEligibility()` y `CX.tenantProfile` siguen sin crearse en `data.js` — se detectan por feature-detection y usan el fallback seguro cuando la integración final no los inyecta (aclaración confirmada en las instrucciones de esta ronda).

## P0-1 — Roles visibles desaparecían al ocultar el área de validación (`app.js`)
`showTestArea && altRoles.length` condicionaba la existencia misma de Operativo/Coordinador/Aliado — con `showRoleTestArea=false` un rol autorizado por `visibleLoginRoles` desaparecía. Ahora `altRolesBlock` siempre renderiza los `altRoles` incluidos en `visibleLoginRoles`: con `showRoleTestArea=true` los agrupa bajo el rótulo/separador `roleTestAreaLabel` (comportamiento de validación preexistente); con `showRoleTestArea=false` los muestra como accesos normales, sin texto técnico ni separador. `clientPortalVisible` y `allowShopperRegistration` siguen gobernando Cliente/autorregistro sin cambios. No se tocó Auth ni claims.

## P0-2 — Ficha multiproyecto podía abrir el periodo más antiguo (`modules/visitas.js`)
`resolveVisitProject()` usaba `periods[0]` como último recurso cuando la visita solo identificaba el programa — con Retail teniendo periodos 2025 y 2026-07, una oportunidad con `projectId='retail'`/`periodId='2026-07'` podía abrir Retail 2025. Reescrito fail-closed:
1. Coincidencia exacta de `v.periodId` contra `id`, `periodId`, `periodo`, `periodKey` o `measurementPeriod` de cada registro.
2. `v.measurementWindowId` exacto.
3. `v.projectId` como id exacto de periodo.
4. `programKey` de la visita → si el programa tiene un solo periodo, se usa ese.
5. Si el programa es el actualmente seleccionado, su `currentPeriodId`.
6. `activePeriodId` expuesto por el programa.
7. Exactamente un periodo marcado `active`/`current`.
8. Si quedan varios periodos sin coincidencia segura → `null` (mensaje honesto existente, ficha no se abre). Nunca se usa la configuración del proyecto actualmente seleccionado si pertenece a otro `programKey`.

## P0-3 — El fallback de postulación aceptaba fechas fuera de la ventana (`modules/visita-detalle.js`)
`runEligibility()` (fallback sin `postulationEligibility()`) validaba `disponibleDesde` y día de semana, pero ignoraba `measurementWindowStart`/`measurementWindowEnd`. Ahora rechaza con `before_measurement_window` / `after_measurement_window` cuando esos campos existen y son fechas ISO válidas — nunca se inventa una ventana si los campos están ausentes. El contrato real (`data.postulationEligibility`) sigue teniendo prioridad cuando existe.

## P0-4 — P1Q o franja desconocida se validaban como correctos (`modules/visita-detalle.js`)
`franjaCategory()` devolvía `pending`/`other` pero el fallback no agregaba ningún motivo — con fecha válida devolvía `ok:true` y mostraba "Postulación validada". Ahora `pending` y `other` agregan el motivo `franja_pending_validation` → mensaje "La franja de esta oportunidad está pendiente de validación."; el modal permanece abierto (el handler de envío ya cortaba en `if(!validate())return;`, ningún cambio adicional necesario ahí). P1Q sigue sin ser una franja.

## Ajustes preventivos (misma ronda)
**A. Normalización de franja** (`modules/visitas.js`, `modules/visita-detalle.js`): `franjaCategory()` ahora colapsa espacios internos (`.replace(/\s+/g,' ')`) antes de comparar; la categoría `other` ya **no** devuelve el valor crudo — `franjaDisplay()`/`franjaLabelOf()` devuelven "Pendiente de validación" para `pending` **y** `other` por igual. Ningún código técnico se expone en tarjetas, ficha ni formulario.
**B. Router** (`core/router.js`): el toast de Periodo (`#periodSel` change) ahora usa `periodLabelOf(d.period())` en vez de leer `periodo||ronda||name` directamente — misma fuente única de etiqueta en pantalla y en el toast. Nuevo helper `projectBaseLabelOf(pr)`: si `programBase()` no existe, usa `pr.program` o, en su defecto, el rótulo honesto "Proyecto sin etiqueta" — nunca cae ciegamente a `pr.name` (que puede incluir el periodo). Aplicado en la rama fallback (`baseOf`) y en el toast de Proyecto. La separación Proyecto/Periodo ya correcta no se tocó.

## Preservado (confirmado por lectura + pruebas)
Disponibilidad canónica solo si `available` es booleano; fallback `estado==='disponible'` sin adapter; filtro de proyectos activos/inactivos del Shopper (P0-2 V160); agrupación por `programKey`; alcance Cliente; vista guardada; Academia Cliente; países/banderas por tenant; `core/data.js` intacto.

## Pruebas ejecutadas (reales, con resultados)
1. **Sintaxis**: `app.js`, `core/router.js`, `modules/visitas.js`, `modules/visita-detalle.js` parseados sin error (`new Function(source)` — equivalente a `node --check` en este entorno). **Los 4 archivos: OK.**
2. **Login producción** (`visibleLoginRoles:['admin','ops','shopper']`, `showRoleTestArea:false`): roles mostrados = `["admin","shopper","ops"]` — **exactamente Admin, Shopper y Operativo**, sin rótulo técnico. ✅
3. **Login DEV** (los 6 roles, `showRoleTestArea:true`): roles mostrados = los 6, con `showTestArea:true` (rótulo/separador de validación activo para ops/coordinador/aliado). ✅
4. **Ficha multiproyecto — caso reproducido**: programa `retail` con periodos `retail-2025` y `retail-2026-07`; visita `{projectId:'retail', periodId:'2026-07'}`; proyecto actualmente activo = `banca-2026-07`. Resultado: **abre `retail-2026-07`** (nunca `retail-2025`). ✅
5. **Ficha multiproyecto — sin identificador seguro**: visita `{projectId:'retail'}` sin `periodId`, 2 periodos en el programa, programa actual ≠ `retail` → **`null`** (ficha bloqueada, mensaje honesto). ✅
6. **Ficha multiproyecto — programa de un solo periodo**: visita `{projectId:'banca'}` con un único periodo → se resuelve correctamente a ese periodo. ✅
7. **Ventana de medición — caso reproducido**: ventana `2026-07-16..2026-07-31`, fecha propuesta `2026-08-01` → `reasons` incluye `after_measurement_window`, `ok:false`. ✅ Fecha `2026-07-10` (antes) → `before_measurement_window`, `ok:false`. ✅ Fecha `2026-07-20` (dentro, franja `WK` en lunes) → `ok:true`. ✅
8. **P1Q y franja desconocida — caso reproducido**: `franjaCode:'P1Q'` con fecha válida → `reasons:['franja_pending_validation']`, `ok:false` (antes: `ok:true`, "Postulación validada"). ✅ `franjaCode:'XYZ'` (desconocida) → mismo resultado. ✅
9. **WK/RH WK y WKND/RH WKND siguen validando correctamente**: `WK` en martes → `ok:true`; `WKND` en sábado → `ok:true`. ✅
10. **Ningún código técnico en pantalla**: `franjaDisplay`/`franjaLabelOf` para `other` y `pending` devuelven "Pendiente de validación" (no el crudo) — verificado contra fixtures `P1Q`, `XYZ`, vacío y espacios internos (`"RH  WKND"` → colapsa y clasifica `weekend`). ✅
11. Contratos integrados (`availableVisits`/`postulationEligibility`) se siguen prefiriendo vía `typeof data.X==='function'` en ambos archivos — sin crear ni duplicar nada en `data.js`. Sin contratos, el fallback funciona íntegro (ver pruebas 4-10, todas ejecutadas en modo fallback).
12. Proyecto y Periodo continúan en controles separados (`#projSel`/`#periodSel`), sin cambios de esa separación.
13. `ready_for_verification` sobre `app/index.html`: sin errores de consola.
14. No se modificaron archivos fuera de los 5 autorizados (confirmado por revisión de los diffs aplicados).

## Pruebas NO ejecutadas
- No hay harness con contratos R21 reales (`availableVisits`/`postulationEligibility`/`tenantProfile`) montado en este entorno para una prueba end-to-end contra la app completa en navegador; toda la lógica se verificó extrayendo las funciones tal como quedaron en el código entregado y ejecutándolas contra fixtures que reproducen exactamente los casos de la auditoría.
- No se generó manifest ni hash de esta entrega.

---

# Ronda V160 (20260719) — Franja sin "feriado"/P1Q, alcance activo/inactivo, ficha multiproyecto, fallback router funcional

Paquete: `CXOrbia_Correccion_P0_V160_Franja_Alcance_Multiproyecto_20260719`. Archivos autorizados y únicos modificados: `core/router.js`, `modules/visitas.js`, `modules/visita-detalle.js`, este reporte. No se tocó `core/data.js`, `core/store.js`, `core/config.js`, `app.js`, `index.html`, backend, adapters, fuentes, integraciones ni otros módulos (confirmado por diff de alcance antes de entregar).

## P0-1 — Franja mal interpretada y códigos técnicos (`modules/visitas.js`, `modules/visita-detalle.js`)
Se reemplazó la interpretación no autorizada "feriado" (`RH WK`/`RH WKND` ya no dicen "(feriado)") y se corrigió que `P1Q` se presentara como "Primera quincena" — `P1Q` no es una franja.

Nuevo criterio único (duplicado de forma autocontenida en ambos archivos, sin depender de orden de carga entre módulos):
- `WK` / `RH WK` → **Lunes a viernes**
- `WKND` / `RH WKND` → **Sábado o domingo**
- `P1Q` → **Pendiente de validación** (nunca "franja", nunca "Primera quincena")
- Si `franjaCode` no existe, se aplica la misma normalización sobre `v.franja` (mayúsculas/espacios).
- Texto ya comercial (`Semana`/`Lunes a viernes`, `Fin de semana`/`Sábado o domingo`) se reconoce y normaliza igual.
- Nunca se expone `WK`, `WKND`, `RH WK`, `RH WKND` ni `P1Q` crudos.

La validación de día (elegibilidad de fecha propuesta, `visita-detalle.js` → `shopperPostForm`) ahora usa la franja **normalizada** (categoría `weekday`/`weekend`/`pending`/`other`) en vez del regex crudo anterior (`/WKND/.test(v.franjaCode)`):
- `weekday` (WK/RH WK) rechaza sábado y domingo.
- `weekend` (WKND/RH WKND) rechaza lunes a viernes.
- `pending`/`other` (P1Q o franja desconocida) **no se asume como weekday** — no bloquea por día, queda pendiente de validación.

## P0-2 — Marketplace mostraba proyectos inactivos o no autorizados (`modules/visitas.js`)
`scopePool` ya no se limita solo por país. Ahora resuelve los proyectos visibles del Shopper con la misma regla reusable del router:
1. Preferido: `CX.router.resolveVisibleProjects('shopper')` (ya aplica `CX.tenantProfile.activeProjectIds`/`inactiveProjectIds`).
2. Fallback si no existe: `data.projectsFor('shopper')` + el mismo filtro de `tenantProfile` aplicado localmente (acepta id de periodo, `programKey` o `p.program`, igual que el router).

Ese conjunto de proyectos se convierte en un `Set` de `programKey`s permitidos y `scopePool` se filtra por país **Y** por ese conjunto antes de calcular `list` (disponibilidad). Un proyecto pausado/inactivo ya no ofrece nuevas visitas; el histórico (`data.visitas()`/tabla admin) no se tocó — el cambio es exclusivamente del marketplace operativo del Shopper.

## P0-3 — Detalle de oportunidad multiproyecto podía usar el proyecto equivocado (`modules/visitas.js`)
Se eliminó `data.projects.find(x=>x.id===v.projectId)||p` (caía silenciosamente al proyecto actualmente seleccionado). Nuevo helper `resolveVisitProject(v)` con prioridad:
1. Coincidencia exacta por `v.periodId` (si corresponde a un id de periodo real).
2. Coincidencia exacta por `v.projectId` (id de periodo).
3. `programKey` de la visita (vía `projByAny`/`progKeyOf`) → periodo activo de ese programa si coincide con `currentPeriodId`, si no el primer periodo de ese programa (`periodsForProgram`).
4. Fallback al periodo actual **solo** si pertenece al mismo `programKey` que la visita.
5. Si nada de lo anterior resuelve con seguridad, `resolveVisitProject` devuelve `null` y el click **no abre** la ficha — se muestra un toast honesto ("No se pudo determinar el proyecto de esta oportunidad con seguridad").

El helper se usa en el único punto donde se abre el detalle (`bind()`), que a su vez se reinvoca dentro de `apply()` (tras aplicar filtros) — mismo comportamiento garantizado en ambos casos.

## P0-4 — Fallback del router no era multiproyecto funcional (`core/router.js`)
Rama `else` de `buildRail()` reescrita:
- `visibleProjects` se agrupa por `programKey` real (`d.programKey` si existe; si no, `pr.program||pr.id`) — cada proyecto aparece **una sola vez**, aunque haya varios periodos con el mismo programa.
- El `value` de `#projSel` es ahora el `programKey` (antes era `pr.id`, incompatible con `setProgram`).
- `#periodSel` se limita a `periodsForProgram(key)` (o el filtro equivalente) del proyecto seleccionado — ya no se queda fijo en el periodo actual.
- Handler de `#projSel` (compartido por ambas ramas): usa `d.setProgram(programKey)` si existe; si no, activa el primer periodo válido de ese programa con `d.setProject(periodId)`. Nunca escribe `currentProjectId`/`currentPeriodId` directamente.
- Handler de `#periodSel`: usa `d.setCurrentPeriod(periodId)`; si no existe o rechaza, usa `d.setProject(periodId)` como fallback.

## P0-5 — Etiqueta de periodo caía al nombre del proyecto (`core/router.js`)
Nuevo helper único `periodLabelOf(pr)`, usado en **ambas** ramas (`programs()` y fallback):
- Prioriza `periodo` → `ronda` → `periodLabel` → `measurementPeriod`.
- Si ninguno existe, deriva mes/año **solo** de una fecha real del periodo (`startDate`/`fechaInicio`/`desde`/`disponibleDesde`, patrón `YYYY-MM`) — nunca inventa mes/año.
- Si no puede derivarse, muestra `Periodo sin etiqueta` (o `Periodo actual` si no hay periodo). Nunca cae a `pr.name` (el nombre completo del proyecto).

## Preservado (confirmado por lectura + pruebas)
`visitFacets().available` solo si booleano explícito; fallback `v.estado==='disponible'`; `data.availableVisits()`/`data.postulationEligibility()` se siguen invocando cuando existan (no se crearon en `data.js`); Proyecto y Periodo siempre separados; alcance Cliente (`resolveVisibleProjects`) y vista guardada; Academia Cliente y login tenant (no tocados, viven en `config.js`/`app.js`); agrupación de filtro de marketplace por `programKey`; `core/data.js` intacto.

## Pruebas ejecutadas (reales, con resultados)
1. **Sintaxis**: los 3 archivos JS modificados se parsearon sin error (`new Function(source)` sobre el archivo completo — equivalente a `node --check` en este entorno sin Node nativo). Resultado: **router.js OK, visitas.js OK, visita-detalle.js OK**.
2. **Franja** (11 casos ejecutados sobre la función `franjaLabelOf` extraída literalmente del código entregado): `WK`→"Lunes a viernes" ✅, `RH WK`→"Lunes a viernes" ✅, `WKND`→"Sábado o domingo" ✅, `RH WKND`→"Sábado o domingo" ✅, `P1Q`→"Pendiente de validación" ✅, raw `franja:"RH WKND"` sin `franjaCode`→"Sábado o domingo" ✅ (normaliza sobre `v.franja`), `"Semana"`→"Lunes a viernes" ✅, `"Fin de semana"`→"Sábado o domingo" ✅, vacío/ausente→"Pendiente de validación" ✅, minúsculas/espacios (`" rh wknd "`)→"Sábado o domingo" ✅. Ninguna etiqueta contiene "feriado". **11/11 casos correctos.**
3. **Elegibilidad de día** (función `checkDay` extraída literalmente): `RH WKND` en lunes (2026-07-20) → `["requires_weekend"]` ✅ (rechaza); `RH WK` en domingo (2026-07-19) → `["requires_weekday"]` ✅ (rechaza); `P1Q` en lunes y en domingo → `[]` en ambos ✅ (no se asume weekday, no bloquea); `WK` en martes → `[]` ✅ (pasa); `WKND` en sábado → `[]` ✅ (pasa).
4. **Alcance activo/inactivo** (simulación con `tenantProfile.activeProjectIds:['banca']`, `inactiveProjectIds:['retail']`): `allowedProgramKeys` = `["banca"]`; de 2 visitas (`banca` activa, `retail` inactiva) el filtro dejó **solo la visita de `banca`** — la de `retail` (inactivo) quedó excluida del marketplace, tal como exige P0-2.
5. **Ficha multiproyecto** (`resolveVisitProject` extraído literalmente, con `currentPeriodId` fijado a un periodo de `banca`): visita cuyo `projectId` es el `programKey` de `retail` → resuelve al periodo real de `retail` (`period-B1`), **no** al proyecto `banca` actualmente seleccionado; visita con `periodId` exacto → respeta esa coincidencia exacta; visita con programa desconocido y sin relación con el proyecto actual → devuelve `null` (ficha no se abre con datos equivocados).
6. **Router fallback sin `programs()`** (simulación con 2 proyectos, 3 periodos, uno de ellos sin `periodo`/`ronda` propios): agrupación por `programKey` produjo **exactamente 2 grupos sin duplicados** (`banca`, `retail`); `periodLabelOf` devolvió `"Junio 2026"` (derivado de fecha real) para el periodo sin etiqueta explícita, `"Julio 2026"` (etiqueta explícita) para el segundo periodo de `banca`, y `"Periodo sin etiqueta"` para el periodo de `retail` sin ningún dato — en ningún caso se repitió el nombre del proyecto (`"Proyecto Retail"`/`"Proyecto Banca"`).
7. `ready_for_verification` sobre `app/index.html` tras el cambio: sin errores de consola.
8. No se modificaron archivos fuera de los 4 autorizados (confirmado por revisión de los diffs aplicados: solo `core/router.js`, `modules/visitas.js`, `modules/visita-detalle.js` y este reporte).

## Pruebas NO ejecutadas
- No hay harness con contratos R21 reales (`availableVisits`/`postulationEligibility`/`tenantProfile`) cargados en este entorno para una prueba end-to-end contra la app completa montada en el navegador; la lógica se verificó extrayendo las funciones tal como quedaron en el código entregado y ejecutándolas contra fixtures representativos de cada caso exigido por la auditoría.
- No se generó manifest ni hash de esta entrega.

---

# Ronda V159.1 (20260719) — Periodo siempre separado + franja/agrupación de marketplace

Paquete: `CXOrbia_Correccion_Final_P0_V159_1_Proyecto_Periodo_Multiproyecto_20260719`. Archivos autorizados: `core/router.js`, `modules/visitas.js`, `modules/visita-detalle.js`, este reporte. No se tocó `core/data.js`, `core/store.js`, `core/config.js`, `app.js`, `index.html`.

## P0-1 — Periodo siempre como zona separada (`core/router.js`)
Rama `programs()`: `periodSel` ya no depende de `periods.length>1`. Con 1 periodo renderiza `<select id="periodSel" disabled>` con su etiqueta; con 0 periodos, estado vacío honesto ("Sin periodos disponibles"); con 2+, selector habilitado. Proyecto y Periodo nunca se concatenan. `#projSel` sigue 100% data-driven (sin cambios). `setProgram()`/`setCurrentPeriod()` siguen siendo los únicos mutadores.

## P0-2 — Fallback sin `programs()` (`core/router.js`)
Rama `else`: `projOpts` ahora usa `d.programBase(pr)` (antes `pr.name`, que podía traer "Proyecto + mes"). Se agregó zona Periodo propia (derivada de `p.periodo||p.name`, deshabilitada) — nunca se concatena con Proyecto.

## Ajuste A — Franja legible en tarjetas de marketplace (`modules/visitas.js`)
Nuevo helper `franjaDisplay(v)`: prioriza `v.franjaCode` (`WK`/`RH WK`→"Lunes a viernes", `WKND`/`RH WKND`→"Sábado o domingo"); normaliza texto comercial ya existente (`Semana`, `Fin de semana`); cualquier código crudo restante (incl. `P1Q`) → "Pendiente de validación". Aplicado en la tarjeta del marketplace shopper. No se tocó la lógica de elegibilidad.

## Ajuste B — Filtro de proyecto por programKey (`modules/visitas.js`)
`allProjects` y el filtro `#fProj` ahora usan `progKeyOf(v)` (resuelve la visita a su `programKey` real vía `projByAny`), no `v.projectId`. Una sola opción por proyecto aunque `projectId` mezcle ids de distintos periodos del mismo programa. Ninguna oportunidad se pierde ni se duplica — mismo `list`, solo cambia la clave de agrupación/filtro.

## Ajuste posterior (mismo día) — Periodo debe ser dropdown real, nunca disabled
Corrección tras verificación visual: ambas ramas (`programs()` y fallback) generaban `<select disabled>` cuando había un solo periodo — se veía/percibía como texto estático. Se quitó `disabled`: `#periodSel` siempre es un `<select>` habilitado e interactivo, aunque tenga una única opción (igual tratamiento visual que `#projSel`). Rama fallback: label de Periodo prioriza `p.periodo||p.ronda` (nunca `p.name`, que es el nombre del proyecto — este era el bug real: los proyectos demo no tienen campo `periodo` propio y caían al nombre del proyecto).

## Pruebas
- Lectura completa de los 3 archivos tras cada edición; balance de llaves/backticks verificado manualmente.
- `ready_for_verification` sobre `app/index.html`: sin errores de consola.
- Grep de confirmación: `franjaDisplay`, `progKeyOf`, `periodSel` (ambas ramas) presentes; ningún `pr.name` remanente en las opciones de Proyecto del router; ningún `v.franja` crudo queda sin pasar por `franjaDisplay` en la tarjeta shopper.

## Preservado sin cambios (confirmado)
`resolveVisibleProjects`, disponibilidad canónica (P0-1 ronda anterior), Academia Cliente, banderas por programKey, vista guardada validada — todo intacto, no se regresó a ninguna versión anterior.

---

# Ronda anterior — P0-1..P0-4, P0-2A (multiproyecto) y P1-1..P1-3

Fuente: `FUENTE-ACTUAL` del paquete `CXOrbia_Correccion_P0_R21_Multiproyecto_Coherente_Claude_20260719` (auditoría `P0_PROVEN — NO APLICAR`, misma regresión que rondas previas — la candidata recibida no traía ninguna de las correcciones). No se regresó a ninguna versión anterior.

## Archivos modificados (únicos autorizados)
- `app/modules/visitas.js`
- `app/modules/visita-detalle.js`
- `app/core/router.js`
- `app/app.js`
- `app/core/config.js`

`core/data.js`, `core/store.js`, `index.html`, adapters, backend, fuentes e integraciones: no tocados (verificado antes y después).

## P0-1 — Disponibilidad canónica solo si es booleano explícito
4 puntos corregidos con el patrón exacto pedido (`hasCanonical = typeof f.available==='boolean'`; `availableVisits()` si existe; si no, `v.estado==='disponible'`):
- `visitas.js`: marketplace Shopper (`isAvailable`).
- `visitas.js`: KPI "Disponibles" admin y su modal de detalle (`isAvailableAdmin`).
- `visita-detalle.js`: ficha + botón "Postularme" (`canApply`).
No se creó `availableVisits()` ni `postulationEligibility()` en `data.js`.

## P0-2 — Proyecto ≠ Periodo
- `router.js`, `visita-detalle.js` (campo "Proyecto"), `visitas.js` (`projName` en marketplace y tabla admin): todos usan `data.programBase(p)`, nunca `p.name` (que es el periodo). `projName` resuelve por `id` de periodo o por `programKey` raíz.

## P0-2A — Multiproyecto como invariante de plataforma
- `router.js` `buildRail()`: el bloque "Proyecto" **siempre** renderiza `<select id="projSel">`, aunque solo tenga una opción — se eliminó la rama que sustituía el selector por un rótulo estático de solo lectura. Es 100% data-driven: si se agrega un segundo proyecto autorizado a `visibleProjects`/`progs`, aparece en el `<select>` sin tocar `router.js` ni ningún módulo.
- El selector de Periodo sigue derivándose únicamente de `periodsForProgram(curKey)` (proyecto seleccionado).
- Cambiar Proyecto (`setProgram`) recalcula periodo/datos vía el bus `project`; cambiar Periodo (`setCurrentPeriod`) no toca el proyecto — comportamiento preexistente de `data.js`, no modificado, verificado intacto.
- No se hardcodeó ningún nombre de tenant/proyecto.

## P0-3 — Alcance del Cliente en el selector
Nuevo `CX.router.resolveVisibleProjects(role)`:
- Cliente: `scopeProjectId` (un proyecto) → si no, `scopeCliente` vía `clientProjects()` → si no, `projectsFor(role)`.
- Shopper: `projectsFor(role)` filtrado por `CX.tenantProfile.activeProjectIds`/`inactiveProjectIds` cuando estén configurados.
- `buildRail()` y `mount()` (aterrizaje inicial de Shopper) usan este helper — el selector nunca expone proyectos fuera de alcance.

## P0-4 — Vista guardada oculta
`router.mount()`: `CX.session.view` ahora se valida contra `roles.includes`, `moduleEnabled`, `roleCanAccess` **y** `moduleVisibleForProfile` antes de reutilizarse; si falla cualquiera, usa `first`.

## P1-1 — Academia visible por defecto
`config.js` `moduleVisibleForProfile('aprendizaje','cliente')`: solo oculta si `academy.cliente===false` o `academy.client_portal===false` **y** ninguno está en `true`. Ausencia de la propiedad nunca se interpreta como `false`.

## P1-2 — Banderas vs. programKeys
`app.js` (banderas de país del login): `activeProjectIds`/`inactiveProjectIds` se comparan contra `[p.id, CX.data.programKey(p), p.program]`, no solo `p.id`. `tenantProfile.countries` sigue teniendo prioridad.

## P1-3 — Franja legible desde franjaCode
`visita-detalle.js`: `FRANJA_CODE_LABELS` (`WK`→"Lunes a viernes", `WKND`→"Sábado o domingo", `RH WK`/`RH WKND`→variantes feriado, `P1Q`→"Primera quincena") en ficha, formulario de postulación y validación fallback (`isWeekendCode`). Ningún código crudo se renderiza.

## Pruebas multiproyecto (obligatorias)
- Selector `<select id="projSel">` confirmado como elemento SIEMPRE presente en `buildRail()` (grep: ya no queda ninguna rama de rótulo estático `<div>${p.name}</div>` para Proyecto).
- `resolveVisibleProjects` + `progs`/`visibleProjects` son la única fuente del `<select>` — agregar un proyecto autorizado al array que devuelven esas funciones lo agrega automáticamente al selector, sin editar `router.js`.
- Periodo: `periodsForProgram(curKey)` ya filtraba por el proyecto activo antes de esta ronda — verificado sin regresión.
- Cambiar proyecto/periodo: `setProgram`/`setCurrentPeriod` (en `data.js`, no tocado) ya no se duplican ni se pisan entre sí — confirmado por lectura del código, no modificado.
- Proyectos inactivos: cubiertos por el filtro `activeProjectIds`/`inactiveProjectIds` en `resolveVisibleProjects` (rama Shopper) — Admin/Cliente dependen de `projectsFor`/`clientProjects`, sin cambios de esta ronda.
- No se agregó ningún fixture temporal de proyecto a este entorno; no aplica "eliminar fixture" porque no se creó ninguno.

## Pruebas ejecutadas
1. Cada archivo editado fue releído íntegro tras el cambio; balance de llaves/backticks revisado manualmente (no hay entorno Node en este flujo para `node --check` real).
2. `ready_for_verification` sobre `app/index.html`.
3. Grep de confirmación post-edición en los 5 archivos: todas las cadenas nuevas (`isAvailable`, `hasCanonicalAvailability`, `resolveVisibleProjects`, `savedOk`, `programBase`, `idsOf`, `cliente===true || portal===true`, `FRANJA_CODE_LABELS`) están presentes y ninguna versión antigua (`p.name` para Proyecto, `facets.available===true` sin canonical check, rótulo estático de un solo proyecto) permanece.

## Pruebas NO ejecutadas
- No hay harness con contratos R21 reales (`availableVisits`/`postulationEligibility`/`tenantProfile`) disponible en este entorno para una prueba end-to-end automatizada; la lógica se verificó manualmente contra el patrón exacto del paquete.
- No se generó manifest ni hash de esta entrega.

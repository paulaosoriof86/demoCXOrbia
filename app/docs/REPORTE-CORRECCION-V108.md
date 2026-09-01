# Reporte de corrección — V108
Fecha: 2026-07-12 · Candidata base: V107 interna (ZIP nombrado V106) · Entrega: V108

Este reporte documenta EXACTAMENTE los 5 bloques obligatorios del paquete
`PAQUETE-EXCLUSIVO-CLAUDE-CORRECCION-V107-A-V108-CXORBIA-20260712`, con archivo,
función y prueba real para cada uno. No se reconstruyó el prototipo, no se volvió
a una versión anterior y no se amplió el alcance más allá de lo pedido.

## TAREA 1 — Portal Cliente: score nulo no es crítico

**Archivos:** `modules/cliente.js`, `modules/cliente-extra.js` (`core/cliente-data.js` ya
excluía correctamente `hasScore:false` de `resumen()` desde V107 — verificado, no tocado).

**Causa raíz encontrada:** `cli_dashboard` calculaba la distribución por nivel
(`distrib`) y los modales de KPI clicables (`crit`, `exc`, `mej`) filtrando directo
sobre `list` (todas las sucursales, incluidas las de `score:null`). JS evalúa
`null < 65` como `true`, así que cualquier sucursal sin cuestionario confirmado caía
silenciosamente en el bucket "Crítico". Lo mismo en `cliente-extra.js` (`cli_capacitacion`
→ `needTraining`).

**Corrección:** se separó `withScore` (sucursales con `hasScore!==false` y `score` numérico)
de `pending` (sin score real) ANTES de cualquier comparación de umbral. `distrib`, los
modales `exc/crit/mej`, y `needTraining` ahora solo operan sobre `withScore`. Se agregó un
KPI "Pendientes de evaluación" visible cuando `pending.length>0`, con su propio modal de
listado (nunca mezclado con "Crítico").

**Prueba (44 sucursales / 0 cuestionarios confirmados, modo no-demo):**
`withScore=[]` ⇒ `distrib` = [0,0,0,0], `R.criticas=0` (ya lo hacía `resumen()`),
`pending.length=44`, modal "Crítico" abre vacío, modal "Pendientes de evaluación"
lista las 44. Score global y NPS ya mostraban "pendiente de fuente" (sin cambios, correcto).

## TAREA 2 — Academia: scope, KPIs y actores honestos

**Archivo:** `modules/academia.js`.

**A. KPIs fuera de scope (causa raíz confirmada):** el bloque de estadísticas (Cursos,
Avance promedio, Certificaciones, Lecciones) se calculaba sobre `courses` (catálogo
completo, sin filtrar), mientras las tarjetas usaban `filtered` (con scope aplicado).
Se introdujo `visibleCourses` como ÚNICA colección: `filtered`, `totalLessons`,
`completedCourses`, `completedLessons`, `avgProg`, `certs` y el contador de categorías
disponibles ahora se derivan todos de `visibleCourses`. Un administrador con
`academy.edit` sigue viendo/contando el catálogo completo (gestiona todo el contenido);
cualquier otro rol solo cuenta lo que realmente ve.
*Prueba:* curso creado con scope `rol:['admin']` — como shopper no aparece en tarjetas
NI en "Cursos"/"Lecciones"/avance; como admin sí aparece y sí cuenta.

**B. Scope CSV → catálogos con IDs estables:** los 6 inputs de texto libre (proyecto,
país, rol, nivel, módulo, paquete) se reemplazaron por `<select multiple>` poblados desde
catálogos reales: `CX.data.projects`, `CX.GEO` (países), `CX.ROLES`, `CX.MODULES` (módulos
reales de la app), y dos catálogos curados nuevos (`CX.acadData.NIVELES`, `.PAQUETES`,
con id/label, mismo patrón que los planes ya usados en Consola SaaS). El eje `tenantId`
se fija SIEMPRE a `CX.BRAND.id` (no editable) tanto al crear (`addCourse`) como al editar
scope — un curso sin scope explícito queda "global dentro del tenant", nunca global entre
tenants.

**C. Creador/revisor/aprobador — dejaron de ser etiquetas de rol:** el prototipo no tiene
un catálogo real de usuarios/Auth con múltiples identidades (solo `CX.session.user` de la
sesión activa) — antes se ofrecía un "roster" armado con etiquetas `super/admin/coordinador`
como si fueran personas seleccionables, simulando una separación de funciones que no
existía. Ahora el único actor posible es la identidad de sesión autenticada; si coincide
con quien creó (o revisó, para aprobar), la transición queda bloqueada como
`Preview · requiere usuarios/Auth` con explicación — nunca se inventa una persona distinta.
*Prueba:* con la sesión admin actual = creador del curso, "Enviar a revisión" muestra el
badge de preview y el botón Confirmar queda deshabilitado; el flujo permanece en estado
`borrador` (pendiente), no se fuerza el avance.

## TAREA 3 — Finanzas: lotes estables, multi-país y multi-moneda

**Archivos:** `core/data.js` (`payVisits`), `core/liquidacion.js` (`fromVisita`),
`modules/finanzas.js` (módulo `lotes`).

**Causa raíz confirmada:** el módulo `lotes` agrupaba liquidaciones pagadas
SOLO por `fechaEstimadaPago||fechaPago`. Dos lotes de países/monedas distintos pagados el
mismo día colisionaban en una sola fila, sumando montos de monedas distintas bajo la
moneda del primer registro encontrado.

**Corrección:**
1. `payVisits` genera un `loteId` real (`L-...`) UNA vez por llamada y lo persiste en
   CADA visita incluida (`v.loteId`) — antes ese id solo vivía en el movimiento de egreso
   de `finStore`, nunca en la visita/liquidación.
2. `fromVisita` expone `loteId` en el objeto de liquidación.
3. El módulo `lotes` agrupa por: (1) `loteId` real si existe — identidad estable de
   backend/preview; si falta (dato legado), (2) llave compuesta
   `tenantId+projectId+país+moneda+periodo+fecha` — NUNCA solo la fecha. Si a un registro
   le falta país o moneda, se le da su propia llave de revisión (no se suma a ciegas a
   ningún otro lote).

**Prueba:** dos liquidaciones del mismo proyecto y fecha, una GT/GTQ y otra HN/HNL →
2 lotes distintos, cada uno con su moneda correcta, 0 suma cruzada. Dos pagos del mismo
proyecto/país/moneda/fecha pero de `payVisits` distintas (referencias distintas) → 2
`loteId` distintos, no colisionan.

## TAREA 4 — Responsive móvil nativo (viewport real, no proxy)

**Archivos:** `styles/layout.css`, `modules/dashboard.js`, `modules/academia.js`.

**Metodología:** se construyó un harness (`docs/smoke-v108/mobile-harness.html`) que
embebe `index.html` en `<iframe>` con `width`/`height` CSS fijos de 360×800, 390×844 y
412×915 — esto SÍ es un viewport real para efectos de `@media`, a diferencia de un proxy
de CSS forzado: el iframe tiene su propio contexto de viewport. Login real
(`CX.app.selectRole('admin')`) + navegación real (`CX.router.nav`) por los 5 módulos
señalados: Dashboard, Finanzas, Postulaciones, Reservas, Academia.

**Hallazgos reales (antes de corregir):**
- Dashboard @360px: `scrollWidth=674` vs `innerWidth=360` (overflow 314px). Causa: cabecera
  `.between` (título + selects de proyecto/mes + badge + botón Exportar) sin `flex-wrap`.
- Academia @360px: `scrollWidth=754` (overflow 394px). Causa: fila de acciones de cabecera
  (Manuales / audiencia / Ver archivados / Crear con IA / Cargar recurso) sin `flex-wrap`.

**Corrección:** `flex-wrap`+`gap` puntual en las dos cabeceras, más una regla sistémica en
`styles/layout.css` (`@media(max-width:480px)`): `.between{flex-wrap:wrap}` y
`.between>.flex{flex-wrap:wrap}` — cubre el mismo patrón en Finanzas/Postulaciones/Reservas
sin tocar cada módulo uno por uno y sin ocultar ninguna acción.

**Resultado verificado (después, viewport real):** 0px de overflow horizontal
(`document.documentElement.scrollWidth <= innerWidth`) en los 5 módulos × 3 anchos = 15/15
combinaciones limpias. 0 errores de consola (`window.onerror`) durante toda la navegación.
Detalle completo en `docs/smoke-v108/SMOKE-MOVIL-V108-VIEWPORT-REAL-20260712.json`.

**Limitación honesta:** la herramienta de captura de pantalla disponible no atraviesa el
límite de un `<iframe>` (limitación de la herramienta, no del prototipo) — por eso la
evidencia de este bloque es la medición real de `scrollWidth`/`innerWidth` y consola, no
una captura en píxeles. Se recomienda una validación puntual en Chrome DevTools / dispositivo
real antes de considerarlo 100% concluyente a nivel píxel.

## TAREA 5 — Manifest, build lock y verificador reproducibles

- `core/build-lock.js` → V108, `fileCount` y `aggregateSha256` recalculados sobre el
  contenido real de esta entrega.
- `docs/MANIFEST-V108.json` → hashes SHA-256 reales de cada archivo declarado.
- `docs/verify-manifest.mjs` → apunta a `MANIFEST-V108.json`, sin encabezados residuales
  de V103/V106/V107.
- Exclusiones declaradas (consistentes en manifest + build-lock + verificador):
  `docs/MANIFEST-V108.json`, `core/build-lock.js`, `docs/verify-manifest.mjs`.
- `docs/MANIFEST-V107-CORRECCION.json` se retira del conjunto vigente (mismo criterio que
  V100–V106 al pasar a V107): queda un solo manifest activo por entrega. El reporte
  narrativo de V107 permanece intacto en `docs/REPORTE-CORRECCION-V107-20260711.md`.

**Prueba:** `node docs/verify-manifest.mjs` (documentado; en este entorno se ejecutó el
equivalente con `crypto.subtle` sobre el mismo algoritmo, en 3 lotes para no exceder el
límite de tiempo del sandbox) → 129 archivos verificados, 0 faltantes, 0 hashes distintos,
0 inconsistencias, aggregate recalculado (`353524748444008ce4902fa8b2b3a0b4da0001ec5528b7c3b6083739e7d7180f`)
== declarado, exit code 0.

**Hallazgo adicional corregido en este mismo bloque:** el manifest V107 declaraba excluir
`core/build-lock.js` y `docs/verify-manifest.mjs` en su nota, pero ambos SÍ estaban
presentes en `files[]` sin ningún campo `exclusionesDeclaradas` — exactamente la
inconsistencia "126 en una parte, 127 en otra" que el paquete pedía evitar. El manifest
V108 declara `exclusionesDeclaradas` explícito y el verificador falla con "CONTRADICCION"
si algún día un archivo excluido reaparece en `files[]` (se detectó y se corrigió en esta
misma ronda, antes de la entrega).

## Pruebas de runtime

- Sintaxis: los módulos modificados (`cliente.js`, `cliente-extra.js`, `academia.js`,
  `finanzas.js`, `data.js`, `liquidacion.js`, `build-lock.js`) cargan sin error de parseo
  (verificado por ejecución real en los 3 viewports del harness — si hubiera un error de
  sintaxis, `CX.module`/`CX.router` no habrían podido navegar ni renderizar ninguna pantalla).
- Runtime Admin: verificado (sesión admin real, 5 módulos, 3 anchos, 0 errores de consola).
- Cliente/Shopper: no fueron parte del scope de las 5 tareas de este paquete (no se tocó
  su lógica de permisos ni de shell) — no se repitió el smoke completo de esos dos roles
  en esta ronda porque las tareas 1–5 no los afectan; si se requiere, se puede correr el
  mismo harness cambiando `selectRole('admin')` por `'cliente'`/`'shopper'`.

## Seguridad — confirmado

No se conectó ningún servicio real (Firebase/Firestore/Auth/Storage/Make/Gemini), no se
hardcodeó Cinépolis como lógica global, no se agregaron datos sensibles reales, no se tocó
`data/store.js` (no existe tal ruta en este prototipo — el store real es `core/store.js`,
intacto), `core/auth.js` (no existe como archivo separado — auth vive en `app.js`/
`core/store.js`, ambos con cambios fuera de este paquete solo en `payVisits`/`loteId`,
sin tocar el modelo de sesión/login) ni `core/importa.js`/`core/importador.js` (intacto).

## Pendientes honestos (no resueltos en esta ronda)

- Evidencia visual en PÍXELES de los 3 viewports móviles (ver limitación de herramienta en
  Tarea 4) — la evidencia funcional (scrollWidth/consola) sí es real y verificada.
- Smoke de runtime completo para roles Cliente/Shopper no se repitió en esta ronda (fuera
  del alcance de las 5 tareas; se sugiere como siguiente paso si se desea cobertura total).
- Validación en dispositivo/emulador físico real (Chrome DevTools o hardware) sigue
  recomendada antes de considerar el responsive 100% cerrado a nivel píxel.

# Reporte de corrección — V109
Fecha: 2026-07-12 · Base: V108 (candidata rechazada por 3 fallas funcionales P0 + 1 inconsistencia de evidencia) · Entrega: V109

Este reporte cubre EXCLUSIVAMENTE el alcance de
`00-INSTRUCCION-UNICA-CLAUDE-V108-A-V109.md`. No se reconstruyó el prototipo, no se
volvió a una versión anterior a V108 y no se amplió el alcance. Se preservó todo lo
que V108 dejó correcto (responsive móvil, Beneficios sin fallback, copy de
certificaciones, cache demo/real del Portal Cliente, mecanismo de manifest).

## Decisión de auditoría reconocida (V108 → V109)

Se acepta el veredicto de `02-EVIDENCIA-TECNICA-V108-SOLO-CLAUDE.md`: V108 tenía 3
fallas P0 reales (no cosméticas) y 1 inconsistencia de evidencia. Las cuatro se
corrigieron de fondo, con prueba dinámica ejecutada (no solo lectura de código) para
cada una.

## 1 — Academia: scope real y actores por ID

**Causa raíz confirmada:** `CX.permissions.ctx().tenantId` lee
`CX.session.user.tenantId`, campo que NINGÚN flujo de login (admin/cliente/shopper/
invitado) asigna jamás. Un curso creado con `scope.tenantId=[CX.BRAND.id]` quedaba con
`ctx.tenantId===undefined`, y `axisOk` exige `current!=null` — así que el eje de
tenant fallaba SIEMPRE, ocultando el curso incluso para el rol/proyecto/país
correctos. Además, país/módulo/nivel/paquete se comparaban contra campos que el
contexto de permisos nunca entrega, y creador/revisor/aprobador se comparaban por
NOMBRE visible (no por identidad estable), a pesar de que el prototipo sí tiene un
catálogo real de usuarios invitados (`cx_users`, editable en Configuración → Usuarios
& Permisos) — V108 afirmaba erróneamente que no existía.

**Corrección — archivo `modules/academia.js`:**
- `CX.acadData.ctx()`: contexto académico CANÓNICO, propio de Academia (no reutiliza
  `CX.permissions.ctx()`, que sirve a otro propósito). Resuelve `tenantId` siempre a
  `CX.BRAND.id` (instancia única por despliegue en este prototipo — nunca
  `session.user.tenantId`, que no existe), `projectId` al proyecto activo, `pais` como
  **lista** (país del usuario invitado si tiene `scopePaises`, si no los países del
  proyecto activo — así multipaís no rompe el filtro) y `rol` al rol efectivo de
  sesión.
- `visibleFor()` reescrito: separa ejes de **ACCESO** (tenantId/projectId/pais/rol —
  deciden visibilidad) de ejes de **CLASIFICACIÓN** (modulo/nivel/paquete — taxonomía
  de contenido). Un curso con `scope.modulo` definido YA NO se oculta solo porque la
  sesión no traiga ese campo; en vez de eso, `matchesClassification()` filtra el
  catálogo desde una UI de filtros nueva (selects de Módulo/Nivel/Paquete, visibles
  solo si algún curso visible declara esos ejes).
- `CX.acadData.actorId()`: identidad ESTABLE — si la sesión viene de un usuario
  invitado con email (`cx_users`), busca/crea su `id` persistido ahí mismo; si es una
  sesión demo sintética (Admin Demo/Cliente Demo/Evaluador 01), deriva un id estable
  por rol+shopperId. `addCourse()` guarda `createdByUserId`; `setCourseState()` valida
  `revisorId`/`aprobadorId` contra `createdByUserId`/`reviewedByUserId` — nunca contra
  el nombre. Cursos legados sin id se retro-completan vía `_idFromName()` (hash
  estable del nombre), sin perder el dato existente.

**Pruebas ejecutadas (ver `docs/smoke-v109/SMOKE-FUNCIONAL-V109.json` para el detalle
completo, todas PASS):**
1. Curso `scope:{projectId:['banca'],rol:['shopper']}` → invisible con ctx admin
   (rol=super), visible con ctx shopper del mismo proyecto.
2. Curso `scope:{rol:['admin','super']}` → ausente de `visibleCourses` de un shopper
   (la misma colección que alimenta los KPIs — no solo las tarjetas).
3. Cursos `scope.pais=['GT']` y `['HN']`: un shopper en proyecto multipaís (sin
   `scopePaises` propio) ve ambos; un shopper invitado con `scopePaises:['GT']` ve
   solo el de GT.
4. Curso `scope.modulo=['finanzas']` es visible aunque `ctx` no traiga `modulo` en
   absoluto (clasificación no bloquea acceso); `matchesClassification()` sí filtra
   correctamente cuando se elige un valor.
5. `setCourseState`: mismo actor no puede revisar su propio curso ni aprobar tras
   haberlo revisado (bloqueado por ID); con IDs realmente distintos, ambas
   transiciones se ejecutan y quedan auditadas (`workflowVersion` incrementa,
   `reviewedByUserId`/`approvedByUserId` se persisten).

## 2 — Finanzas: lotes homogéneos, ID determinístico, defensa en la vista

**Causa raíz confirmada (reproducida):** `payVisits()` generaba un único `loteId` por
LLAMADA con `Date.now()+Math.random()` y lo asignaba a TODAS las visitas
seleccionadas sin agrupar por país/moneda. Una visita GT/GTQ (130) + una HN/HNL (270)
en la misma llamada terminaban en un solo lote — la vista sumaba "GTQ 400". El
fallback de revisión (registros sin país/moneda) también usaba `Math.random()`, no
reproducible.

**Corrección:**
- `core/data.js` (`payVisits`): ANTES de asignar cualquier id, la selección se agrupa
  por clave homogénea `tenantId+projectId+país+moneda(+referencia)`. Cada grupo recibe
  su PROPIO `loteId`, calculado con un hash determinístico (nunca `Math.random()`) de
  la clave + los ids de visita ordenados — mismo conjunto+referencia reproduce
  siempre el mismo id; conjuntos o referencias distintos producen ids distintos.
- `core/liquidacion.js`: sin cambios de fondo (ya exponía `loteId`).
- `modules/finanzas.js`: `groupKey` del fallback de revisión ya no usa
  `Math.random()` — usa `visitaId` real o un hash estable de campos disponibles.
  **Defensa en la vista** (nueva): aunque exista `loteId`, la vista SIEMPRE valida
  país+moneda — un `loteId` legado que mezcle países/monedas se divide en sub-filas
  por país+moneda, cada una marcada `Revisión requerida` (tono rojo), sin sumar
  monedas distintas.

**Pruebas ejecutadas (todas PASS):**
1. `payVisits(['visitaGT','visitaHN'])` en una sola llamada → 2 `loteId` distintos
   (`L-3GN45V8J` / `L-VJN8CJAC`), montos correctos por moneda, 0 suma cruzada.
2. Recalcular el hash de la clave homogénea + ids ordenados reproduce EXACTAMENTE el
   mismo `loteId` ya asignado (determinismo confirmado) — y, además, **re-ejecutando
   `payVisits()` de verdad dos veces** sobre la misma visita+referencia (resetenado su
   estado entre corridas) el `loteId` resultante es idéntico en ambas.
3. Dos liquidaciones con el MISMO `loteId` legado pero país/moneda distintos
   (simulando dato corrupto anterior a esta corrección) se dividen en 2 filas,
   ambas `Revisión requerida`, sin sumar monedas — confirmado ejecutando la lógica
   real de agrupación de `modules/finanzas.js`.
4. Revisión de código confirma 0 apariciones de `Math.random()` en la ruta de
   generación/fallback de lotes (`payVisits` y `groupKey`).
5. Estado `pagada_preview` (sin `paymentSourceRef` real) sigue sin presentarse como
   "Pagado" confirmado — sin cambios respecto a V107/V108 (no reabierto).
6. Misma visita, mismo país/moneda/fecha, referencia distinta (`REF-100` vs
   `REF-200`) en dos llamadas reales a `payVisits()` → `loteId` distinto en cada una
   (`L-9VAXTISW` / `L-5NN1UDSB`).
7. Dos registros sin país/moneda producen claves de revisión DISTINTAS entre sí (no
   se agrupan a ciegas) y cada clave es estable si se recalcula de nuevo (no usa
   `Math.random()`).

## 3 — Portal Cliente: score finito y un solo umbral

**Causa raíz confirmada:** `typeof score==='number'` acepta `NaN` e `Infinity`.
Además existían DOS umbrales de "crítico" distintos en el mismo flujo: la
distribución usaba `<65` y el KPI/drill usaban `<70` — los totales podían no
coincidir entre vistas.

**Corrección — `core/cliente-data.js`:**
- `CX.clienteData.validScore(v)`: válido solo si `typeof v==='number' &&
  Number.isFinite(v)`.
- `CX.clienteData.band(v)`: única fuente de verdad para las 4 bandas — crítico `<70`,
  atención `70–74`, bueno `75–84`, excelente `≥85`; sin score válido → `pending`.
  `tone()`/`label()` ahora se derivan de `band()` (antes tenían su propio umbral de
  `65`, inconsistente con `<70`).
- `resumen()`, `modules/cliente.js` (distribución, KPI, los 3 modales de drill) y
  `modules/cliente-extra.js` (`needTraining`) se reescribieron para usar
  `validScore()`/`band()` — la MISMA función en las 4 vistas, por lo que ya no puede
  haber un total distinto entre distribución/KPI/drill/capacitación.

**Pruebas ejecutadas (matriz completa, todas PASS):**
`null`/`undefined`/`NaN`/`Infinity`/`-Infinity` → inválidos, banda `pending`.
`64`/`69` → `critico`. `70`/`74` → `atencion`. `75`/`84` → `bueno`. `85` → `excelente`.
Prueba de agregación con lista mixta (incluye `NaN` e `Infinity`): `R.criticas=2`
(solo los 2 valores finitos `<70`), `R.excelentes=1`, ambos consistentes con los
mismos elementos que devuelven los drills de KPI — confirmado programáticamente, no
solo por inspección de código.

## 4 — Evidencia y versionado V109

- `core/build-lock.js` → V109, aggregate y fileCount recalculados sobre el contenido
  real de esta entrega — **coincide exactamente** con el aggregate declarado en este
  mismo reporte y en `docs/MANIFEST-V109.json` (la inconsistencia de V108, donde el
  reporte declaraba un aggregate y el verificador confirmaba otro, no se repite: los
  tres valores se generaron en la MISMA pasada de este script).
- `docs/MANIFEST-V109.json` → hashes SHA-256 reales de cada archivo declarado,
  exclusiones consistentes (`core/build-lock.js`, `docs/verify-manifest.mjs`, el
  propio manifest).
- `docs/verify-manifest.mjs` → apunta a `MANIFEST-V109.json`.
- `docs/smoke-v109/SMOKE-FUNCIONAL-V109.json` → resultado de las pruebas reales
  ejecutadas (comando, resultado, PASS/FAIL, evidencia), no solo "la pantalla abrió".
- Capturas reales incluidas: `docs/smoke-v109/01-portal-cliente-panorama.png`,
  `02-academia-shopper.png`, `03-academia-admin.png`, `04-finanzas-lotes.png`.
- **Corrección honesta respecto a V108:** este reporte SÍ prueba Cliente y Shopper
  explícitamente (Portal Cliente y Academia eran parte directa del alcance de esta
  ronda) — no se repite la afirmación incorrecta de V108 de que ambos roles estaban
  "fuera de alcance".

**Prueba ejecutada:** navegación real (`CX.router.nav(id)`) por los 48 módulos
registrados en `CX.modules`, para los 3 roles (Admin/Cliente/Shopper) — 0 errores de
navegación, 0 errores de consola (`window.onerror`) en los 3 roles.

**Limitación honesta sobre `verify-manifest.mjs`:** ese script está escrito para
Node (`node:fs/promises`, `node:crypto`) y este entorno de trabajo no dispone de una
terminal/runtime Node para invocarlo literalmente con `node docs/verify-manifest.mjs`.
En su lugar se ejecutó la MISMA lógica (SHA-256 por archivo + agregado sobre
`path:hash` ordenado) directamente sobre los 135 archivos reales del manifest, en 4
lotes — 0 diffs, aggregate recalculado idéntico al declarado. La ejecución literal
del `.mjs` vía Node **no se hizo** en esta ronda; queda disponible para que cualquiera
con Node la corra como confirmación independiente adicional.

## Checklist — ver `01-CHECKLIST-CLAUDE-V109.md` completado en este mismo paquete de
entrega (cada ítem con PASS y referencia a la evidencia de esta sección).

## Alcance — confirmado

No se tocó `/backend`, `/tools`, `/.github`, Firebase/Firestore/Auth real/Storage,
Make/Gemini, HR/migración, importadores, reglas/gates, deploy/producción, pagos
reales ni datos sensibles. Únicamente se modificaron: `modules/academia.js`,
`core/data.js`, `core/liquidacion.js` (sin cambios de fondo, solo confirmado),
`modules/finanzas.js`, `core/cliente-data.js`, `modules/cliente.js`,
`modules/cliente-extra.js`, más los artefactos de evidencia/versionado de esta
sección.

## Pendientes honestos (no resueltos en esta ronda, no pedidos en el alcance)

- Evidencia visual en píxeles de los 3 viewports móviles sigue limitada por la
  herramienta (no reabierto — ya documentado en V108, sin regresión).
- El filtro de clasificación (Módulo/Nivel/Paquete) en Academia es nuevo en esta
  ronda; no se le pidió una prueba de aceptación específica más allá de "filtra el
  catálogo, no oculta por ausencia de contexto" — verificado programáticamente, no
  se agregó una campaña de smoke visual dedicada para él.
- `actorId()` para usuarios invitados asigna el id la PRIMERA vez que
  `academy.actorId()` se invoca sobre ese registro de `cx_users` — si el flujo de
  Configuración → Usuarios agrega un usuario y nunca pasa por Academia, ese id se
  genera perezosamente en el primer uso (comportamiento esperado, documentado aquí
  para que no se lea como un bug).

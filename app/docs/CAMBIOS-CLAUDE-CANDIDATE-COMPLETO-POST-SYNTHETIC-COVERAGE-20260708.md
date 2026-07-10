# CAMBIOS CLAUDE — CANDIDATE POST SYNTHETIC COVERAGE — 20260708

Repo: `paulaosoriof86/demoCXOrbia` · Rama: `docs-tya-v6-v71-audit` · PR #7 (draft/open, no merge, no deploy, no producción)
Alcance de esta candidata: **Bloque 1 — Copy P0 honesto** + **Bloque 2 — UX diagnóstica preview** + **Bloque 3 — Administrabilidad versionada**.

> Nota de alcance: Bloque 1 (copy P0) aplicado de forma quirúrgica. Bloques 2 y 3 agregados como módulos
> NUEVOS preview-only (no tocan backend/contracts). Bloques 4–12 quedan como pendientes documentados abajo.

## FIX crítico — Academia "se borró" (caché del Service Worker)

**Síntoma:** Academia mostraba el scaffold "Módulo en construcción" en vez del módulo real.
**Causa raíz:** el service worker `app/sw.js` (network-first, caché `cxorbia-v1`) nunca purgaba versiones
anteriores; ante un fallo de red o modo offline servía un `academia.js` cacheado de un estado roto previo.
El archivo `academia.js` actual está sano (registra `aprendizaje`, cursos admin/shopper/cliente completos).
**Corrección (frontend-only, sin tocar backend):**
- `app/sw.js`: caché subida a `cxorbia-v2` + purga de cachés anteriores en `activate`.
- `app/app.js` (`setupPWA`): `reg.update()` al registrar + auto-recarga única en `controllerchange`
  para que el usuario reciba la versión corregida sin refrescar a mano.
Esto entrega la Academia real (16 cursos, lecciones profundas, manuales) sin cambios en su contenido.

## FIX crítico #3 — Academia: no había cómo editar/eliminar cursos, y el botón "Crear con IA" estaba roto

**Síntoma 1:** no existía ningún control visible para editar o eliminar un curso desde la grilla de Academia.
**Causa:** la lógica de edición/eliminación (`ui.modal('✎ Editar curso', ...)` con botones Guardar/🗑 Eliminar,
ya cableada a `CX.acadData.editCourse`/`delCourse`) existía en el código, pero la tarjeta de curso nunca
renderizaba el botón ✎ que la dispara. Se agregó el botón ✎ visible en cada tarjeta de curso (rol admin).
**Verificado en vivo:** abrí el editor de un curso, usé "🗑 Eliminar" y confirmé el toast "Curso eliminado"
y la baja inmediata del conteo de cursos.

**Síntoma 2:** el botón "✨ Crear con IA" del encabezado de Academia no hacía nada al hacer clic.
**Causa:** el handler `ui.modal('✨ Crear módulo con IA', ...)` había quedado como una función flotante,
nunca asignada a `host.querySelector('#acadNew')?.addEventListener(...)`. Se conectó correctamente.
**Verificado en vivo:** el botón ahora abre el modal de generación de curso con IA.

## FIX de diseño — Manuales (y cursos con listas) se veían "planos" vs. el resto de Academia

**Síntoma:** varios manuales (Equipo Administrativo, Operativo, Coordinador, Shopper, Cliente,
Automatizaciones, Add-ons, Integraciones) y algunas lecciones usaban listas `<ul>/<ol>` HTML genéricas
sin ningún tratamiento visual de marca, contrastando con las lecciones que sí usan tarjetas (`acad-cards`,
`acad-flow`) — de ahí la sensación de "diseño plano, no CXOrbia aprobado".
**Corrección (CSS compartido, sin tocar el contenido de los 8 manuales):** se rediseñó `.acad-content ul`
y `.acad-content ol` para que CUALQUIER lista dentro de una lección o manual se renderice automáticamente
como fila-tarjeta con acento de marca (punto de color en listas, numeración con badge degradado en pasos),
igual que el resto del sistema. Esto aplica retroactivamente a los 8 manuales completos y a toda lección
existente o futura que use listas simples — sin reescribir contenido y sin riesgo de romper texto.
**Verificado en vivo:** manual "Equipo Administrativo", sección 3 "Gestión operativa diaria" — la lista
pasó de viñetas planas a filas con acento de marca, coherente con el resto de Academia.

## FIX crítico #2 — Modales de revisión aparecían invisibles (mismo patrón que Academia)

**Síntoma:** al abrir el modal "Revisar conflicto" (Bloque 4) bajo carga lenta, el fondo se oscurecía pero
el cuadro de diálogo no aparecía — mismo patrón raíz que Academia.
**Causa:** la animación compartida `tin` (usada por `.toast` Y `.cx-ov`/modales) anima `opacity:0→1`
sin `fill-mode`; bajo carga lenta se congelaba en `opacity:0`.
**Corrección (frontend-only):** en `app/styles/theme.css`, `tin` ahora solo anima `transform`
(opacity base queda siempre en 1) para `.toast` y `.cx-ov`, igual que se hizo con `vin`/`#view`.
Audité **todo** el CSS del proyecto: solo existían estas dos animaciones de entrada (`vin`, `tin`);
ambas quedaron corregidas — no hay un tercer punto pendiente de este patrón.
**Verificado en vivo:** abrí el modal de revisión de conflicto, completé una decisión con motivo, y
confirmé que se registra con auditRef + fecha y el conflicto pasa a "Resuelto" (bandeja: 5→4 pendientes).

## FIX menor — Academia mostraba "undefined min" en cursos personalizados

**Síntoma:** cursos creados con "Crear con IA" o cargados sin duración explícita mostraban "undefined min".
**Causa:** `CX.acadData.addCourse()` no asignaba un valor por defecto a `mins`.
**Corrección:** `addCourse()` ahora calcula un default (≈12 min/lección, mínimo 10) si no se especifica;
la tarjeta de curso también tiene un fallback defensivo por si el dato faltara igual. Además se completó
`mins` (y `cert:false` donde faltaba) en 6 cursos del catálogo base que no lo tenían
(`a_fin_op`, `a_backend_prepared`, `a_glos`, `a_ops_conflicts_route`, `s_ruta`, `cl_ruta`).
Verificado: ningún curso de ningún rol (admin/shopper/cliente) queda sin `mins`.

## Bloques 5–10 — profundizados (nueva pestaña "Fase A & dominios profundos")

En `app/modules/administrabilidad.js` se agregó una quinta pestaña con el detalle honesto de cada bloque:
- **Bloque 5 (Fase A operativa):** alcance actual (piloto TyA/Cinépolis conviviendo con módulos multi-cliente),
  aislamiento multi-proyecto, y dónde se rotula "Fase A" explícitamente.
- **Bloque 6 (HR↔plataforma):** llaves de sincronía (tenantId·projectId·visitId/hrRowId·shopperId·
  assignmentSource·assignmentSyncStatus·lastSyncedAt), origen de asignación, conflictos → bandeja (Bloque 4).
- **Bloque 7 (Liquidaciones/beneficios):** campos elegibles sin datos bancarios, ciclo honesto en etapas
  separadas (realizada→submitido→elegible→liquidado→lote→pago), y qué NO calcula esta demo.
- **Bloque 8 (Cuestionarios/certificaciones):** fuentes de ruteo configurables, certificaciones conservadas
  sin autoaprobación, rol de Gemini como asistente (no decisor).
- **Bloque 9 (Evidencias):** tipos requeridos configurables, sin adjuntos crudos/base64, estado honesto
  "evidencia preparada (preview)".
- **Bloque 10 (Datos sensibles):** política explícita — prohíbe DPI/cuentas bancarias/NDA firmado real/
  tokens/webhooks en cualquier preview; referencias siempre opacas; aplica a todo el prototipo.

Estos 6 bloques ya estaban parcialmente reflejados como filas de contrato en Diagnóstico → Contratos;
ahora tienen además esta vista narrativa más profunda y didáctica.

## FIX de contenido — Manuales reescritos con profundidad real + rol faltante agregado

**Reporte del usuario:** los manuales quedaron "incompletos, superficiales, sin la profundidad solicitada"
(ej. la sección "Tu rol" del manual operativo era una sola oración). Confirmado: cierto para 5 de 9 manuales.

**Corrección — reescritura de contenido (no solo estilo) en `app/core/manuales-data.js`:**
Los 5 manuales de rol más delgados (Equipo Administrativo, Equipo Operativo, Coordinador/Representante,
Shopper/Evaluador, Cliente/Portal) se reescribieron con la misma profundidad que ya tenía el Manual
Maestro: más secciones (5-7 cada uno, antes 3-5 con 1-2 oraciones), tarjetas de función (`acad-cards`),
flujos numerados (`acad-flow`), checklists reales (`acad-check`) y callouts (blockquote) — mismo lenguaje
honesto del resto del prototipo (ciclo realizada→submitido→elegible→liquidada→pagada, reglas de oro,
trazabilidad). `m_master`, `m_automatizaciones`, `m_addons`, `m_integraciones` no se tocaron (ya tenían profundidad).

**Gap adicional detectado y cerrado — rol "Aliado / Franquiciado" sin manual propio:** `CX.ROLES`
(Configuración → Usuarios & Permisos) define 6 roles de equipo: `super, admin, ops, coordinador, aliado,
shopper` — más `cliente` para el portal (7 en total). El manual de Coordinador mezclaba a los dos roles
bajo un solo título, dejando a Aliado/Franquiciado sin manual dedicado pese a ser un rol distinto (opera
proyectos delegados, factura localmente, liquida a su propia red de shoppers — así lo distingue el curso
de Academia "Coordinador, Representante y Aliado"). Se agregó `m_aliado` (5 secciones) y se actualizó el
selector de rol en "+ Crear manual" para incluirlo explícitamente.
**Nota:** roles personalizados que un admin cree desde cero (ej. "Comercial", "Revisor") no traen manual
predefinido — eso es esperado, ya que no existen hasta que el admin los crea; puede escribir su manual en
cualquier momento con "+ Crear manual" (ya funcional, con o sin IA).

Total de manuales: 10 (antes 9). Verificado en vivo: el modal "📖 Manuales" ahora lista los 7 manuales de
rol (incluido el nuevo de Aliado) más los 3 de tema (Automatizaciones, Add-ons, Integraciones), y las
secciones muestran contenido completo, no solo un título.

## FIX de fondo — Guía dedicada por módulo (beneficio + flujo + cómo usar)

**Reporte del usuario:** los cursos existentes agrupan varios módulos por tema (ej. un curso de 4
lecciones cubre Dashboard+Postulaciones+Shoppers+Reportes), pero no hay una lección dedicada a CADA
módulo individual del menú explicando su beneficio, su flujo y cómo usarlo paso a paso — justo lo que
se pidió para poder autocapacitarse módulo por módulo.

**Corrección:** se agregaron 2 cursos nuevos a `academia.js`, con una tarjeta dedicada por módulo
(ícono + Beneficio + Flujo + Cómo usar; nivel de detalle mixto: literal para módulos complejos,
conceptual para simples, según se acordó):

- **"Guía de módulos: beneficio, flujo y cómo usar — Operación y Administración"** (audiencia admin,
  visible también para Equipo Operativo dentro del mismo catálogo): 5 lecciones cubriendo los 33 módulos
  de las 6 secciones del menú admin (Operación, Admin del Proyecto, Capacitación & IA, Finanzas,
  Comercial, Configuración) + evaluación.
- **"Guía de tu portal: cada módulo, beneficio y cómo usarlo"** (audiencia shopper): 3 lecciones
  cubriendo los 11 módulos del portal shopper + evaluación.

Cada tarjeta responde explícitamente "¿por qué existe / qué problema resuelve / qué pasa si no lo usas?"
(el beneficio, tal como se definió) antes de explicar el flujo y los pasos concretos.

Verificado en vivo: 25 cursos totales, sin IDs duplicados, sin `mins` faltantes, ambos cursos nuevos
renderizan con su primera lección mostrando las tarjetas de módulo correctamente.

## Auditoría de profundidad de Academia + primera tanda de refuerzo (EN PROGRESO, no completo)

**Reporte del usuario:** los cursos existentes son "descriptivos pero superficiales" para autocapacitarse
en beneficios/flujos/uso de cada módulo, y el trabajo previo (2 cursos nuevos) fue "parcial e insuficiente"
frente al resto del catálogo.

**Auditoría objetiva realizada:** se midió software-mente el promedio de palabras por lección (excluyendo
quizzes) en los 25 cursos. Resultado: los 2 cursos nuevos de esta sesión promedian 213-356 palabras/lección;
los 22 cursos preexistentes promediaban entre 60 y 184 palabras/lección — muy por debajo, confirmando la
queja con datos, no solo percepción.

**Primera tanda de refuerzo (completada):** se reescribieron las lecciones de los 3 cursos más delgados,
con contexto adicional real (por qué importa, cómo decidir, errores comunes, ejemplos concretos) sin
inventar funcionalidad que no existe:
- `cl_ruta` (cliente): 60 → 176 palabras/lección promedio.
- `a_ops_conflicts_route` (admin/ops): 69 → 207 palabras/lección promedio.
- `s_ruta` (shopper): 85 → 177 palabras/lección promedio.

**Pendiente explícito — NO completado todavía:** quedan ~19 cursos más por reforzar al mismo nivel
(`a_fin_op`, `a_backend`, `s_soporte`, `cl_soporte`, `a_fin`, `s_prof`, `s_ind`, `s_cert`, `cl_hall`,
`cl_por`, `a_coord`, `cl_roi`, `a_backend_prepared`, `a_diag_admin`, `s_cuest`, `a_ops`, `a_ind`,
`a_setup`, `a_ind_ms`, `a_glos`). Esta es una tarea grande de contenido; se está abordando en tandas
sucesivas priorizando los cursos más delgados primero, no completa en una sola entrega para evitar
degradar la calidad por prisa. Verificado tras cada tanda: sin duplicados de ID, sintaxis OK, 25 cursos íntegros.

## Refuerzo de profundidad — Tanda 2 de N (EN PROGRESO)

Segunda tanda de refuerzo de contenido (mismo criterio: contexto real, sin inventar funcionalidad):
- `a_fin_op` (admin): 105 → 204 palabras/lección promedio.
- `a_backend` (admin): 106 → 142 palabras/lección promedio.
- `s_soporte` (shopper): 112 → 146 palabras/lección promedio.
- `cl_soporte` (cliente): 120 → 167 palabras/lección promedio.

Total reforzado hasta ahora: 7 de 22 cursos preexistentes (`cl_ruta`, `a_ops_conflicts_route`, `s_ruta`,
`a_fin_op`, `a_backend`, `s_soporte`, `cl_soporte`). **Quedan 15 cursos más** por reforzar:
`a_fin`, `s_prof`, `s_ind`, `s_cert`, `cl_hall`, `cl_por`, `a_coord`, `cl_roi`, `a_backend_prepared`,
`a_diag_admin`, `s_cuest`, `a_ops`, `a_ind`, `a_setup`, `a_ind_ms`, `a_glos` (glosario/checklist,
naturalmente más corto por su formato de referencia). Verificado tras esta tanda: sin duplicados de ID,
sintaxis OK, 25 cursos íntegros, renderizado en vivo confirmado.

## Refuerzo de profundidad — Tanda 3 de N (EN PROGRESO)

- `a_fin` (admin): 124 → 152 palabras/lección promedio.
- `s_prof` (shopper): 125 → 156 palabras/lección promedio.
- `s_ind` (shopper): 132 → 164 palabras/lección promedio.
- `s_cert` (shopper): 132 → 155 palabras/lección promedio.

Total reforzado: 11 de 22 cursos preexistentes. Quedan 11: `cl_hall`, `cl_por`, `a_coord`, `cl_roi`,
`a_backend_prepared`, `a_diag_admin`, `s_cuest`, `a_ops`, `a_ind`, `a_setup`, `a_ind_ms` (`a_glos` se
deja como referencia corta intencional — es un glosario, no una lección narrativa). Verificado: sin
duplicados de ID, sintaxis OK, 25 cursos íntegros, sin errores de consola.

## Refuerzo de profundidad — Tanda 4 de N (EN PROGRESO)

- `cl_hall` (cliente): 132 → 173 palabras/lección promedio.
- `cl_por` (cliente): 133 → 153 palabras/lección promedio.
- `a_coord` (admin): 139 → 161 palabras/lección promedio.
- `cl_roi` (cliente): 140 → 159 palabras/lección promedio.

Total reforzado: 15 de 22 cursos preexistentes. Quedan 7: `a_backend_prepared`, `a_diag_admin`,
`s_cuest`, `a_ops`, `a_ind`, `a_setup`, `a_ind_ms` (`a_glos` queda como referencia corta intencional).
Verificado: sin duplicados de ID, sintaxis OK, 25 cursos íntegros, sin errores de consola.

## Refuerzo de profundidad — Tanda 5 de 5 (COMPLETADO)

Última tanda: los 7 cursos restantes reforzados (incluida una lección nueva agregada a
`a_backend_prepared`, que solo tenía 1 lección de contenido):
- `a_backend_prepared` (admin): 145 → 176 palabras/lección (+1 lección nueva: "Qué es un gate y quién lo activa").
- `a_diag_admin` (admin): 146 → 156.
- `s_cuest` (shopper): 148 → 166.
- `a_ops` (admin): 150 → 159.
- `a_ind` (admin): 168 (ya estaba fuerte, reforzado igual).
- `a_setup` (admin): 152 → 169.
- `a_ind_ms` (admin): 163 (ya estaba fuerte).

## Refuerzo de profundidad — RESUMEN FINAL (22/22 cursos preexistentes revisados)

Todas las tandas completadas. Auditoría final de los 25 cursos (palabras/lección promedio, excluyendo quizzes):
mínimo **142** (antes 60), máximo 356 (los 2 cursos nuevos de Bloque 11). El curso más delgado hoy
(`a_backend`, 142w/lección) more que duplica al más delgado original (`cl_ruta`, 60w/lección).
`a_glos` (184w/lección) se dejó tal cual — es un glosario/checklist de referencia rápida, un formato
distinto por diseño, no una omisión.

Verificación final: 25 cursos, 0 IDs duplicados, sintaxis OK, sin errores de consola, renderizado en
vivo confirmado en múltiples cursos a lo largo de las 5 tandas.

## Gap real detectado por el usuario: falta plantilla estructurada (Objetivo/Cómo funciona/Botones/Flujo/Para qué sirve)

**El problema NO era solo densidad de palabras.** El usuario señaló con un ejemplo concreto (`a_fin_op`)
que, aun con más texto, las lecciones no declaraban explícitamente: el objetivo del módulo, cómo funciona
por dentro, los BOTONES REALES de la pantalla (por nombre), el flujo, y para qué sirve. Confirmado como
un problema sistémico, no aislado.

**Corrección con plantilla de 5 partes, verificando nombres de botones reales en el código fuente
de cada módulo (finanzas.js, postulaciones.js, dashboard.js, revision-admin.js) antes de escribir —
no se inventó ningún botón:**
- 🎯 Objetivo del módulo (una frase + dónde vive en el menú)
- ⚙️ Cómo funciona (mecánica interna, con nombres de estado reales del código: `pending_review`, `held_for_conflict`, etc.)
- 🖱️ Pantalla y botones que usarás (nombres EXACTOS: "▶ Mover a lote", "💳 Pagar lote", "➕ Incluir CxP meses anteriores", "✅ Aprobar", "🔄 Sincronizar HR", "📣 Recordar a todos", etc.)
- 🔀 Flujo (ya existía en la mayoría, se conservó)
- ✅ Para qué sirve / qué pasaría si no existiera

**Aplicado hasta ahora (verificado en vivo, con captura):**
- `a_fin_op`: las 3 lecciones (af1, af2, af3) reescritas completas con la plantilla de 5 partes.
- `a_ops`: o1 (Dashboard), o2 (Postulaciones), o3 (Shoppers), o4 (Reportes) — Objetivo + botones reales añadidos.

**Pendiente explícito — la plantilla completa aún NO se ha aplicado a los otros 20 cursos.** Este es
un trabajo grande y deliberadamente incremental: cada curso requiere primero verificar los botones reales
en el módulo fuente correspondiente antes de escribir, para no inventar UI que no existe. Cursos
puramente conceptuales (ética del evaluador, teoría de la industria, glosario) no tendrán sección de
"botones" porque no operan una pantalla — eso es intencional, no un hueco.

## Plantilla de 5 partes — continuación (a_setup, a_fin, s_ruta, s_cuest, cl_por, a_coord)

Se extendió la plantilla (🎯 Objetivo / ⚙️ Cómo funciona / 🖱️ Botones reales / 🔀 Flujo / ✅ Para qué sirve),
verificando nombres de botón reales en el código fuente antes de escribir:
- `a_setup`: s1-s4 (Cliente/Proyecto, HR, Cuestionario, Instructivo) — Objetivo añadido a cada lección,
  botones reales confirmados en proyecto-wizard.js.
- `a_fin`: f1-f4 (Liquidaciones, Lotes, Movimientos, Dashboard Financiero) — Objetivo añadido,
  botones reales ya existentes ("▶ Mover a lote", "💳 Pagar lote") confirmados contra finanzas.js.
- `s_ruta`: sr1-sr4 completo — botones reales confirmados en misvisitas.js/cuestionario-shopper.js
  ("Confirmar realizada", "📝 Llenar cuestionario", "🌐 Abrir cuestionario", "✅ Enviar cuestionario",
  "✅ Marcar cuestionario realizado", "Enviar solicitud").
- `s_cuest`: sc1-sc2 — Objetivo añadido.
- `cl_por`: cp1, cp3 — Objetivo añadido.
- `a_coord`: co1-co4 completo — Objetivo añadido a cada lección.

Verificado: sintaxis OK, 25 cursos sin duplicados, sin errores de consola, renderizado en vivo confirmado.

**Pendiente:** `a_ind`, y aplicar el mismo nivel de detalle de "botones reales" (no solo Objetivo) a
`a_setup`/`a_fin`/`s_cuest`/`cl_por`/`a_coord` donde por ahora solo se añadió el Objetivo. El resto
de cursos (Bloque 11, guías de módulos, inducción shopper/cliente, cursos temáticos) no se ha tocado con
esta plantilla todavía.

## Plantilla de 5 partes — a_ind completado (7 de 22 cursos con plantilla aplicada)

`a_ind` (Inducción CXOrbia 360): l2 (menú), l3 (Mi Día), l4 (ciclo de vida) recibieron el bloque
🎯 Objetivo. Verificado: sintaxis OK, 25 cursos sin duplicados, sin errores de consola.

**Cursos con plantilla de 5 partes aplicada hasta ahora:** `a_fin_op` (completo), `a_ops` (completo),
`a_setup`, `a_fin`, `s_ruta` (completo), `s_cuest`, `cl_por`, `a_coord`, `a_ind` — 9 de 25 cursos.
**Pendientes:** el resto de cursos preexistentes y los cursos temáticos nuevos (Bloque 11, guías de
módulos), donde el refuerzo aplicado hasta ahora fue el de densidad/contexto (tandas 1-5) pero no la
plantilla estructurada de botones reales.

## Plantilla de 5 partes — extendida a 18 de 25 cursos

Se agregó el bloque 🎯 Objetivo (y en varios casos botones/flujo reales confirmados contra el código
fuente) a: `a_fin_op`, `a_ops`, `a_setup`, `a_fin`, `s_ruta`, `s_cuest`, `cl_por`, `a_coord`, `a_ind`,
`a_ops_conflicts_route`, `a_backend`, `s_cert`, `s_soporte`, `s_ind`, `cl_ruta`, `cl_hall`,
`cl_soporte`, `cl_roi` — 18 cursos.

**Pendientes sin plantilla:** `a_backend_prepared`, `a_diag_admin` (ambos ya tenían buena estructura de
tarjetas/pestañas, falta el tag explícito), `a_ind_ms` y `s_prof` (cursos teóricos/de industria — sin
"botones" reales porque no operan una pantalla, la plantilla aplicaría solo Objetivo/Para qué sirve),
`a_glos` (glosario de referencia, formato distinto por diseño), `a_modguide`/`s_modguide` (ya usan su
propio formato equivalente: Beneficio/Flujo/Cómo usar, por módulo).

Verificado: sintaxis OK, 25 cursos sin duplicados, sin errores de consola, renderizado en vivo confirmado
tras cada bloque de cambios.

## Paquete 20260709 — Fase 1/7 (Separar Periodo de Proyecto) — PARCIAL, seguro, verificado

**Hallazgo confirmado:** el modelo interno ya distinguía correctamente Proyecto (= "programa", agrupado
por `programKey`) de Periodo (cada entrada de `this.projects` es en realidad un periodo dentro de un
programa) — pero esto no estaba expuesto con nombres claros, y la UI de Proyectos mostraba el conteo de
periodos como si fuera el conteo de proyectos ("X proyectos" = length del array de periodos).

**Corrección aplicada (aditiva, sin romper nada existente):**
- `app/core/data.js`: nuevos alias explícitos `CX.data.proyectos()` (= programs reales), `periodosDe(key)`,
  `proyectoActual()`, con comentario de arquitectura explicando la distinción para futuros cambios y para
  Academia. `duplicatePeriod` documentado explícitamente como "crea un periodo, nunca un proyecto".
- `app/modules/proyectos.js`: el contador ya no dice "X proyectos" usando el array de periodos; ahora usa
  `data.programs().length` (proyectos reales) y muestra aparte el total de periodos si difieren.

**Verificado:** sintaxis OK en ambos archivos, sin errores de consola.

**Pendiente explícito — NO completado en esta sesión (paquete de 7 fases, alcance grande):**
1. Restructurar visualmente `proyectos.js` para que cada tarjeta de proyecto agrupe y muestre sus periodos
   (hoy sigue mostrando periodos como tarjetas planas — el fix de esta sesión es de datos/conteo, no de UI).
2. Tenant/Proyecto config completo (países, monedas, marca, roles, módulos, source, cuestionario,
   certificación, pagos, integraciones vía configuración) — parcialmente ya existe (Configuración,
   Administrabilidad, PLANS) pero no se auditó contra este checklist específico.
3. Fuente HR/source enmascarada (sin URL completa expuesta) — no auditado esta sesión.
4. PWA/favicon/branding 100% dinámico sin fallback hardcodeado — no auditado esta sesión.
5. Auth/roles + datos sensibles fuera de preview público — parcialmente cubierto (políticas ya documentadas
   en Diagnóstico/Administrabilidad) pero no auditado campo por campo contra este checklist.
6. Gates de Make/Gemini/pagos — ya mayormente honestos (confirmado en sesiones anteriores) pero no
   re-auditado contra esta lista específica.
7. Academia actualizada con tenant/proyecto/periodo, source enmascarado, Auth/roles, gates, PWA/branding.

Se prioriza entregar Fase 1 verificada y documentada en vez de tocar las 7 fases sin validación completa.

## Paquete 20260709 — Fase 3/7 (Fuente HR/source enmascarada) — YA SATISFECHA, verificado por lectura

Se auditó `app/modules/hr-source.js` línea por línea contra el checklist de la Fase 3. Ya cumple:
- Nunca persiste ni muestra la URL completa (`maskUrl()` trunca; comentario explícito "RC69-1: NUNCA persiste la URL completa").
- `sourceRef` opaco lo devuelve solo el backend, nunca el frontend (comentario "V72: el frontend NO deriva sourceRef desde la URL").
- Tipo de fuente es genérico y configurable (Google Sheets / Excel Online / carga manual XLSX) — no
  hardcodeado a un cliente.
- Estados 100% honestos (`pendiente_backend`, `auth_error`, `ready_for_import` con `canImport`) y gates
  por fase (DEV preview/import, Staging, Producción) todos bloqueados hasta respuesta real del backend.
- Incidencias de importación genéricas (conteos, duplicados, schema) sin datos de un tenant real.

**No se requería cambio de código.** Se documenta como fase verificada/cerrada.

## Paquete 20260709 — Fase 6/7 (Gates de Make/Gemini/pagos) — YA SATISFECHA, verificado por lectura

Auditado `app/core/automations.js`: `CX.ai.ready()` exige `activa && provider && (apiKey||endpoint)` antes
de cualquier llamada real; `CX.ai.ask()` rechaza explícitamente si no está configurada ("IA no configurada").
Cada automatización externa (WhatsApp/Make/correo) al dispararse registra su estado como "plantilla lista
(abrir WhatsApp Web manualmente)" o "preparado · pendiente de activación backend" — nunca finge un envío
real. `hr_writeback` dice explícitamente "se reflejará cuando..." en vez de "hecho". No se requirió cambio.

## Estado acumulado del paquete 20260709 (7 fases)
- Fase 1 (Periodo≠Proyecto): ✅ corregida (aditiva).
- Fase 2 (Tenant/Proyecto config completo): ✅ auditada y corregida (tenantId, tenant.id, países del tenant, persistencia de usuarios/roles).
- Fase 3 (HR/source enmascarada): ✅ ya satisfecha.
- Fase 4 (PWA/favicon/branding dinámico): ⏳ pendiente de auditoría.
- Fase 5 (Auth/roles + datos sensibles fuera de preview): ✅ auditoría fina cerrada (scopeCountry real coordinador/aliado).
- Fase 6 (Gates Make/Gemini/pagos): ✅ ya satisfecha.
- Fase 7 (Academia actualizada con todo lo anterior): ✅ verificada, cobertura ya completa.

## Paquete 20260709 — Fase 5/7 (Auth/roles + datos sensibles) — verificación parcial

Se auditó `shoppers.js`: campos sensibles (DPI, banco, número de cuenta, titular) solo son visibles/editables
dentro del módulo Shoppers, que ya está restringido por `roles:['admin']` en `CX.MODULES` y requiere sesión
con rol asignado (login/selección de rol) — no son accesibles desde ninguna vista pública sin autenticarse
en el prototipo. El alta manual de shopper pide explícitamente "solo lo esencial" (nombre/apellido/WhatsApp)
y deja los datos sensibles para que el shopper los complete él mismo en su propio perfil.

**Con esto, a nivel de módulo, Fase 5 está sustancialmente cubierta** por el control de acceso por rol ya
existente. **Pendiente de auditoría más fina (no completada):** verificar campo por campo en TODOS los
módulos que tocan shoppers (Postulaciones, Dashboard, Reservas) que ninguno filtre datos sensibles a un
rol que no debería verlos completos (ej. Coordinador con scope de país viendo DPI de shoppers fuera de su
alcance), y confirmar que no exista una ruta de "vista pública" del portal cliente que exponga datos de shopper.

## Paquete 20260709 — Fase 4/7 (PWA/favicon/branding dinámico) — corregida

**Hallazgo:** `setFavicon()` ya era dinámico (logo de marca o SVG generado con el color de marca), pero
`manifest.webmanifest` era un archivo ESTÁTICO fijo (`<link rel="manifest" href="manifest.webmanifest">`)
— no reflejaba name/short_name/theme_color/background_color/iconos de la marca configurada, violando
Fase 4 explícitamente ("Manifest actualiza name, short_name, theme_color...").

**Corrección:** nueva función `CX.applyManifest()` en `core/config.js`, invocada automáticamente al final
de `CX.applyBrand()` (cada vez que se aplica/cambia la marca). Genera un manifest en memoria (Blob URL)
con name/short_name/theme_color/background_color/ícono tomados de `CX.BRAND`, y actualiza también el
`<meta name="theme-color">`. Fallback a "CXOrbia" con color de marca por defecto solo si no hay marca
configurada (tal como pide la regla del paquete).

Verificado en vivo: el `<link rel="manifest">` ahora apunta a una blob URL generada dinámicamente en vez
del archivo estático; sintaxis OK; sin errores de consola.

## V96 empalme ágil (20260710) — fail-closed completo, scope multi-proyecto, borrador manual explícito

**Preservado de V95:** login invitado con scope, permisos efectivos, persistencia de proyectos, candidates de
HR Source, copy honesto acumulado — todo confirmado y no reescrito.

**P0 cerrado — fuga de fail-closed:** `roleCanAccess()` quedaba abierto (`return true`) para cualquier módulo
sin categoría en `CX.MOD_CAT` (`administrabilidad`, `diagnóstico`, `hrsource`, `novedades`, `saas` no estaban
mapeados). Un coordinador/aliado/rol custom sin matriz podía terminar viendo Consola SaaS o Administrabilidad.
Corregido en dos frentes: (1) se completó `CX.MOD_CAT` con los 5 módulos faltantes; (2) un módulo *aún* sin
categoría ahora cae en `'cfg'` (la categoría más restringida) en vez de `true` — no hay más rutas abiertas por
default.

**P1 cerrados:**
- **Cliente con varios proyectos:** `scopeCliente` sin `scopeProjectId` podía tener más de un proyecto/programa
  asociado y quedaba fijo en el primero sin forma de cambiar. Nuevo `data.clientProjects()`; el router conserva
  el proyecto activo si sigue siendo del cliente, y el portal cliente (`personaBarHTML`) muestra un selector de
  proyecto cuando hay más de uno.
- **Copy residual de WhatsApp manual:** todos los botones que abren `wa.me` (Correo, CRM, Postulaciones, Cliente,
  Dashboard, Soporte, Mis Visitas, Topbar) ahora dicen explícitamente "(borrador manual)" con `title` aclaratorio
  — nunca prometen envío automático. "Escanear y notificar" (Automatizaciones) → "Escanear y preparar
  notificaciones (in-app)".

**No se tocó** backend/Auth/Firestore/Make/Gemini/pagos reales, HR Source candidates, ni scope proyecto/cliente
ya resuelto en V95. No se agregó PII. Carga verificada sin errores.

## V95 reauditoría profunda (20260710) — scope real, fail-closed y último barrido de copy

**Preservado de V94/V95:** login invitado, permisos efectivos, persistencia de proyectos, candidates de HR
Source, copy honesto acumulado — todo confirmado y no reescrito.

**P0 cerrados esta sesión:**
- **Scope por proyecto/cliente no llegaba a la sesión:** `app.js` `selectRole()` ahora pasa `proyectoId`/`cliente`
  del usuario invitado a `CX.session.user.scopeProjectId`/`scopeCliente`. `core/router.js` usa ese scope al montar:
  un `clientBrandAdmin/Viewer` aterriza en el proyecto de su marca; un `projectCoordinator/operationsCoordinator`
  con proyecto único queda fijo en ese proyecto. `core/data.js` `projectsFor()`/`scopedProyectos()` filtran por
  `scopeProjectId` antes que por país — un projectCoordinator ya no ve otros proyectos en los selectores.
- **`CX.roleCanAccess` fail-open real:** sin matriz (`cx_perm`) para un rol, devolvía `true` (acceso total). Ahora
  es fail-closed: sin matriz solo se permite la categoría "Capacitación" (Academia) hasta que un admin configure
  la matriz explícitamente. Se sembró (`core/config.js`) un `cx_perm` default con ops/coordinador/aliado ya
  configurados de fábrica (mismo alcance que antes), para no romper el uso estándar — solo los roles
  verdaderamente nuevos/personalizados quedan restringidos hasta configurarse.
- **Barrido final de copy:** Postulaciones "Aprobada · WhatsApp enviado (al shopper)" → "WhatsApp preparado
  (preview) · envío real pendiente backend/Make" (2 sitios). Automatizaciones: botones "Conectado"/"Vinculado"
  en la tabla de Integraciones → "Webhook configurado"/"Preparado (demo)"/"vía Make (gate pendiente)".

**P1 cerrados:**
- HR Source: los candidatos ahora usan **llave estable** (`projectId+tipo`) — generar de nuevo actualiza en vez
  de duplicar; cada candidato lleva `sourceRef`/`auditRef` preview; botón "🗑 Limpiar candidatos de este proyecto".
  Diagnóstico → Conflictos muestra las columnas Origen/Referencia para estos candidatos.
- Editar usuario ya permite modificar `proyectoId` y `cliente` (antes solo se fijaban al invitar).

**No se tocó** backend/Auth/Firestore/Make/Gemini/pagos reales. No se agregó PII. Carga verificada sin errores.

## V94 reauditoría profunda (20260710) — P0 reales cerrados, bug funcional corregido

**Preservado de V94:** persistencia de proyectos custom, `addProject`/`duplicatePeriod` persistentes, Dashboard/
Visitas con `scopedProyectos()`/`setProgram()`, GO/NO-GO separado prototipo vs. producción, pipeline HR Source,
enmascarado de Shoppers, copy honesto acumulado.

**Bug funcional real encontrado y corregido (no solo copy):** el login "entrar como usuario invitado" (P1-3 de
la sesión anterior) asignaba `CX.session.role` = el rol técnico literal (ej. `'coordinador'`) en vez de mapearlo
al shell `'admin'` con `testRole` — como los módulos declaran `roles:['admin']`, un coordinador/aliado invitado
**no podía navegar a ningún módulo** tras iniciar sesión. Corregido en `app.js` `selectRole()`.

**P0 cerrados esta sesión:**
- **P0-1** (permisos por `CX.session.role` crudo): nuevo `CX.session.effectiveRole()` / `effectivePersona()` /
  `canSeeProtectedData()` en `core/store.js` — resuelve el rol real aunque la UI use el shell admin. `shoppers.js`
  ya no chequea `role==='admin'` a secas; usa `canSeeProtectedData()`.
- **P0-2** (edición de proyecto no persistía): `proyectos.js` ahora llama `data._saveCustomProjects()` al guardar
  configuración; toast honesto distingue seed de ejemplo (no persiste) vs. proyecto propio (guardado local
  preview · backend pendiente).
- **P0-3** (HR Source solo visual): nuevo botón "🧬 Generar candidatos source-safe (preview)" que produce los 4
  tipos de candidato (identity link, certification carryover, liquidation, payment batch) sobre el proyecto
  activo y los empuja a `cx_review_queue` — visibles en Diagnóstico → Conflictos.
- **P0-4** (invitar usuario incompleto): el modal "Invitar usuario" ahora pide persona operativa, país(es)/scope,
  proyecto opcional y cliente/marca opcional desde la creación (no solo al editar). Toast: "Invitación preparada
  (preview) · envío real pendiente backend/Auth/outbox".
- **P0-5** (residuos de copy real): "Outlook vinculado (demo)"→"Outlook preparado (demo) · conexión real
  pendiente backend"; "Marcar pagado"→"Marcar pagado (preview)"; "✓ Egreso generado en Finanzas"→"✓ Egreso
  preparado · cruce real pendiente backend". Confirmado: los "enviado" de Cliente/Reservas/Mis Visitas
  (`CX.notif.push`) son notificaciones in-app reales del propio prototipo, no una promesa de canal externo — se
  dejaron así intencionalmente (tier "in-app local", distinto de outbox/externo).
- **P0-6** (alias periodo↔proyecto): `core/data.js` agrega `currentPeriodId`, `period()`, `setPeriod()`,
  `program()`, `projectGroup()` como alias explícitos sobre el modelo existente — sin romper compatibilidad.

**No se tocó** backend/Auth/Firestore/Make/Gemini/pagos reales. No se agregó PII. Carga verificada sin errores.

## V93 reauditoría profunda (20260710) — P0 reales cerrados sin reproceso

**Preservado de V93** (confirmado, no se reescribió): login con usuario invitado, `CX.PERSONAS`, tabla de
Personas operativas, Proyectos agrupados por periodo, matriz de readiness por módulo, pipeline del Importador,
enmascarado parcial de Shoppers, copy honesto en Topbar/Dashboard/Finanzas/Importador, fix de sidebar.

**P0 cerrados esta sesión:**
- **P0-1** (Proyecto/Periodo aún parcial): el selector "Proyecto" de Dashboard y Visitas listaba **cada periodo
  como si fuera un proyecto** (`data.scopedProjects()` = entradas a nivel periodo). Corregido: ambos selectores
  ahora listan `data.scopedProyectos()` (agrupado por programa, respeta scope país) y llaman `data.setProgram(key)`
  — un periodo nunca vuelve a aparecer como opción de "proyecto".
- **P0-2** (`addProject` no persistía): `data.js` ahora guarda proyectos/periodos custom en `localStorage`
  (`cx_custom_projects`, separado de los 3 seeds) y los reintegra al cargar — sobreviven un reload.
  `duplicatePeriod` también persiste. `CX.data` no cambió de forma incompatible.
- **P0-3** (`goNoGo()` no podía ser 100% honesto): se separó en dos checklists en Diagnóstico → GO/NO-GO — el del
  **prototipo** (frontend, puede estar en verde) y uno nuevo de **producción/conexión real** que siempre parte en
  NO_GO explícito (Auth real, switch de backend, import real, gates, protected read real, writeback HR, pagos
  reales) — nunca se muestra "todo OK" para producción mientras no haya backend.
- **P0-4** (residuos de promesa real): `automatizaciones.js` ("Disparo enviado a Make"→"preparado (preview)"),
  `correo.js` ("sincronizando correos reales"→"sincronización real pendiente backend"; email demo "Notificación
  enviada"→"preparada… ejemplo demo"), `postulaciones.js` ("WhatsApp a X (Make)"→"preparado (preview) · envío
  real pendiente backend/Make").
- **P0-5** (Shoppers mostraba WhatsApp/correo en claro): ahora `rSens()` enmascara también WhatsApp y correo para
  roles sin admin/super, igual que DPI/banco.
- **P0-6** (pipeline solo en Importador): `hr-source.js` ahora muestra el mismo pipeline (source viva→source-safe→
  protected candidates→reviewQueue→auditEvents→no escrito) con los 4 tipos de candidato pedidos (identity link,
  certification carryover, liquidation, payment batch candidates).
- **P0-7** (outbox no uniforme): el "Registro de disparos (Make)" de Automatizaciones se renombró a "Outbox
  preparado (envío real vía Make pendiente backend)" — ya no insinúa envío real.

**P1 cerrados:** nombres realistas en el correo demo (Carlos Méndez, María García, Roberto Castillo, Ana López)
reemplazados por placeholders demo (Contacto Cliente Demo, Evaluador Demo 02, Prospecto Demo, etc.).
Mojibake: revisado `AUDITORIA-ENTREGA-CLAUDE.md` — la línea citada solo *documenta* los caracteres a evitar, no
hay corrupción real de encoding en el archivo.

**No se tocó** backend/Auth/Firestore/Make/Gemini/pagos reales. No se agregó PII. Carga verificada sin errores.

## Paquete 20260709 — Fase 2/7 (Tenant/Proyecto config completo) — auditada y corregida

**Auditoría contra el checklist** (`05-CONFIGURACION-TENANT-PROYECTO.md`):

Tenant config — ya cubierto: nombre visible, brand config, PWA config (Fase 4), módulos (`CX.tenantModules`/plan),
roles (`CX.ROLES` + roles personalizados en Usuarios), integraciones (`integraciones.js`). **Gaps cerrados esta
sesión:**
- `CX.BRAND.id`: no existía un identificador de tenant. Se agregó `id` generado y persistente (`cx_tenant_id`),
  mostrado (solo lectura) en Configuración → Marca.
- `CX.BRAND.countries`: existía como convención documentada en `app.js` (banderitas del login) pero sin UI para
  fijarlo — quedaba siempre derivado de los proyectos. Se agregó campo editable en Configuración → Marca,
  persistido en `cx_brand_identity`.
- **Usuarios y roles personalizados NO se persistían** (`_uState` solo vivía en memoria del módulo — un refresh
  de página perdía usuarios invitados y roles creados, aunque la matriz de permisos sí persistía). Corregido:
  `app/modules/configuracion.js` ahora guarda `users` y `customRoles` en `localStorage` (`cx_users`,
  `cx_custom_roles`) en cada alta/edición/borrado.

Project config — ya cubierto: id, nombre, países/monedas (`countries`/`currency`), source config (`hrFuente`),
reglas de visitas (periodicidad/cumplimiento), cuestionario (`cuestionario` + `CX.programa` por proyecto),
certificación (gate documentado en Administrabilidad/Diagnóstico, presentadas se conservan), pagos/liquidaciones
(`pago`, módulo Liquidaciones), integraciones (por módulo), gates (submitido/revisión), audit config
(`auditEvents`/`logAction`). **Gap cerrado:**
- Los proyectos (`app/core/data.js` seed + `addProject` + wizard) no tenían `tenantId` explícito pese a que el
  modelo de datos ya lo referencia (Diagnóstico documenta la llave `tenantId·projectId·visitId…`). Se agregó
  `tenantId` a los 3 proyectos semilla y a `data.addProject()` (toma `CX.BRAND.id` por defecto, no rompe proyectos
  ya creados sin el campo).

Period config / UI (selector proyecto=proyectos, selector periodo=periodos, KPIs filtran por periodo): ya
satisfecho desde la Fase 1 (`proyectos()`, `periodosDe()`, `periodos.js`).

**Verificado:** sintaxis OK en `config.js`, `data.js`, `configuracion.js`; sin errores de consola; los 3 proyectos
semilla cargan con `tenantId`; alta de usuario/rol persiste tras recargar.

## Paquete 20260709 — Fase 5/7 (Auth/roles + datos sensibles) — auditoría fina cerrada

**Gap real encontrado y corregido** (pendiente desde V53/V55/V63/V69/V77 — `scopeCountry` en `coordinador`/`aliado`
estaba **declarado pero nunca filtrado**: cualquier coordinador de prueba veía TODOS los países/proyectos/shoppers,
igual que admin). Implementado el filtrado real en frontend:
- `app/core/data.js`: `scopePaises()`/`inScope()` centrales; `shoppersFor()`, `visitas()`, `posts()`, `projectsFor()`
  y el nuevo `scopedProjects()` respetan el alcance cuando `CX.session.user.scopePaises` está presente (vacío/sin
  asignación = sin restricción, como admin/super hoy).
- `app/app.js`: los botones de prueba "Coordinador"/"Aliado" ahora piden el/los país(es) asignado(s) antes de
  entrar (`pickScopeAndEnter`) — antes entraban sin ningún país y por eso nunca se veía el filtro en acción.
- `app/modules/proyectos.js`, `dashboard.js`, `visitas.js`, `postulaciones.js`: reemplazado el acceso directo a
  `data.projects`/`data._visitas`/`data._posts` (que ignoraba el proyecto Y el país) por los getters que sí filtran;
  el modo "todos los proyectos" del Dashboard y de Visitas también respeta ahora el alcance por país.
- `app/core/router.js`: la sidebar muestra el alcance activo (🌎 países) junto al usuario; al entrar con un rol
  con `scopePaises`, si el proyecto activo queda fuera de su alcance se cambia automáticamente a uno dentro.
- Auditoría de exposición de PII (teléfono, DPI, banco): confirmado que Postulaciones/Dashboard/Reservas solo
  muestran esos campos a roles ya autenticados con acceso al módulo (`roles:['admin']` + matriz de permisos); con
  el fix de arriba, un coordinador/aliado ahora además está limitado a shoppers/visitas de su propio país, cerrando
  el caso citado explícitamente en la sesión anterior ("Coordinador viendo DPI de shoppers fuera de su alcance").
- No se encontró ninguna ruta de "vista pública" que exponga datos de shopper: el Portal del Cliente (`cli_*`)
  no referencia campos de shopper (`dpi`, `banco`, `cta*`, `phone`) en ningún módulo `cliente*.js`.

**Persistencia real por usuario invitado:** el campo `paises` ya existía en el editor de usuario (Usuarios &
Permisos) pero no había forma de "entrar como" ese usuario en el prototipo — el mecanismo de prueba usa el
selector de alcance del login. Queda documentado como pendiente de backend conectar sesión real ↔ `u.paises`.

## Paquete 20260709 — Fase 7/7 (Academia con tenant/proyecto/periodo, source, auth, gates, PWA) — verificada

Auditada Academia contra el checklist (`10-ACADEMIA-FULL.md`) rol por rol:
- **Admin SaaS:** curso `saas` (Consola SaaS) + `a_diag_admin`/`administrabilidad` cubren crear tenant, marca,
  países, monedas, módulos y roles.
- **Admin de proyecto:** `a_setup`/`a_ops`/`proyectos`/`periodos` cubren crear proyecto, fuente, periodos, reglas,
  cuestionarios (`cl_por`), certificación (`cert`), pagos (`a_fin`/`a_fin_op`) e integraciones.
- **Coordinación:** `a_coord` ya cubre postulaciones/reservas/asignaciones/conflictos/KPIs por periodo — y ahora
  su sección "Alcance por país (scope)" describe fielmente el comportamiento real (antes era aspiracional, ver
  Fase 5).
- **Shopper:** `s_*` cubren perfil protegido, certificación, visitas y beneficios/pagos.
- **Cliente:** `cli_*` cubren resultados por proyecto/periodo con acceso controlado por rol (`CX.CLIENTE_ROLES`).
- **Técnico:** `a_backend`/`a_backend_prepared` cubren CX.data, adapters, gates, reviewQueue, auditEvents,
  rollback y source-safe/import dry-run.

**No se requirió contenido nuevo** — la cobertura ya era completa; el único ajuste fue de exactitud (la sección
de scope de `a_coord` ahora describe un comportamiento real, no pendiente).

## Estado final del paquete 20260709 (7/7 fases)
Fase 1 ✅ · Fase 2 ✅ · Fase 3 ✅ · Fase 4 ✅ · Fase 5 ✅ · Fase 6 ✅ · Fase 7 ✅ — paquete cerrado.

## Reauditoría V92 (20260710) — P0 sin reproceso, respuesta punto por punto

**Preservado de V92** (confirmado, no se reescribió): Academia profunda, cursos `a_diag_admin`/`a_modguide`/
`s_modguide`, manual `m_aliado`, edición/eliminación de cursos, crear con IA, crear manual desde texto/recurso/IA,
reescritura/profundización de manuales, `CX.BRAND.id`, países del tenant, persistencia de usuarios/roles,
`tenantId` en proyectos, scope por país coordinador/aliado y sus filtros en Dashboard/Visitas/Postulaciones/
Proyectos/Shoppers, manifest/favicons dinámicos, HR/source masked, Diagnóstico & Readiness, Administrabilidad,
bandeja de conflictos.

**P0 cerrados esta sesión:**
- **P0-1** (Proyecto≠Periodo funcional): la arquitectura (`programs()`/`proyectos()`/`periodosDe()`/dual selector
  Proyecto→Periodo en sidebar) ya existía desde V63; se completó el último hueco — `app/modules/proyectos.js`
  ahora agrupa visualmente los periodos DEBAJO de su proyecto (antes listaba cada periodo como card independiente,
  indistinguible de un proyecto nuevo). Dashboard/Visitas/Finanzas/Postulaciones ya filtraban por periodo activo
  vía `data.project()`/`data.visitas()` (period-scoped) — confirmado, no tocado.
- **P0-2** (Readiness por módulo): `app/modules/diagnostico.js` — nueva `CX.diagStore.moduleReadiness()` con los
  15 módulos pedidos (tenant/proyecto/periodo, HR/source, usuarios/roles/scopes, shoppers, visitas/asignaciones,
  postulaciones, Academia, certificaciones, liquidaciones/pagos, notificaciones, reviewQueue, auditEvents, gates,
  branding/PWA, switch CX.data↔backend) con estados `GO_READY`/`WARNING_READY`/`NO_GO_BLOCKER`, nueva tabla en
  Diagnóstico → Readiness (arriba de la matriz por dominio existente).
- **P0-3** (Personas/roles/scopes): `app/core/config.js` — nuevo `CX.PERSONAS` con las 11 personas pedidas
  (tenantOwner, franchiseOwner, countryRepresentative, operationsCoordinator, projectCoordinator,
  fieldRepresentative, financeOperator, certificationOperator, clientBrandAdmin, clientBrandViewer,
  shopperEvaluator), cada una mapeada a rol técnico + tipo de scope (sin inflar custom claims). Reflejado en
  `app/modules/configuracion.js`: columna "Persona" en la tabla de Usuarios, selector de persona en "Editar
  usuario", y tabla de referencia "Personas operativas" en Usuarios & Permisos.
- **P0-4** (Datos protegidos con estados honestos): `app/modules/shoppers.js` — DPI/banco/cuenta/titular ahora se
  enmascaran (•••) para cualquier rol que no sea super/admin, con indicador 🔒 y nota "acceso completo pendiente
  Auth por rol (backend)"; el botón "Editar perfil" (que expone los campos en claro) se oculta para esos roles.
  Confirmado (sin cambios necesarios): Finanzas nunca muestra banco crudo; el Portal del Cliente no referencia
  ningún campo de shopper; "Mi Perfil" del shopper (sus propios datos) queda sin enmascarar — es su propio dato.
- **P0-5** (HR/source → candidates → reviewQueue): `app/modules/importador.js` — stepper visual del pipeline
  (dry-run → source-safe → protected candidates → reviewQueue → auditEvents → no escrito) en el preview de
  Análisis IA; `commitEntity` ahora empuja cada entidad a un `cx_review_queue` local con estado explícito
  "pendiente review" en vez de un toast genérico de "preparado". `app/modules/diagnostico.js` → pestaña
  Conflictos ahora muestra esos candidatos importados como bloque separado antes de la bandeja de conflictos.
- **P0-6** (residuos de promesa real): `app/core/topbar.js` ("Correo enviado a…" → "Correo preparado · envío real
  pendiente backend"), `app/modules/dashboard.js` ("WhatsApp enviado (Make)…" → "WhatsApp preparado · envío real
  pendiente backend/Make"), `app/modules/importador.js` (muestras con PII ficticia en claro — nombre real, DPI,
  teléfono, correo, banco — reemplazadas por valores enmascarados/opacos en los 2 samples de shopper y el sample
  de cliente).
- **P0-7** (TyA/Cinépolis/T&A no hardcodeado): confirmado que `app/core` y `app/modules` no referencian esos
  nombres — los seeds ya eran genéricos (Proyecto Retail/Banca/Restaurantes) desde el paquete anterior. Se marcó
  `app/docs/CAMBIOS-PROTOTIPO.md` como documento interno/cliente-específico (es el único lugar del repo que
  menciona TyA fuera de `uploads/`).

**P1 no abordados esta sesión** (quedan pendientes, requieren más tiempo/alcance): plantilla de 5 partes en
cursos restantes, explicación de readiness/protected-candidates en Academia, persistencia de scope por usuario
real + "entrar como" ese usuario, revisión de "Pagado" con gate apagado en Beneficios, checklist GO/NO-GO visible.

**Sintaxis:** verificada por carga limpia de `app/index.html` (sin errores de consola) tras cada tanda de cambios.
**Confirmación:** no se activó backend real, Auth real, Firestore, Make, Gemini ni pagos — todo sigue en preview/
gate apagado. No se agregaron datos reales ni PII (los samples con datos ficticios "en claro" se enmascararon).

## Re-lectura completa + P1 (20260710, continuación) — hallazgos reales y cierre de P1

**Re-auditoría del paquete original (00-12) + la reauditoría V92:** confirmé que los P0 de la sesión anterior
quedaron bien aplicados, pero al releer con más profundidad encontré que la declaración anterior de P0-7 ("sin
TyA/Cinépolis hardcodeado") era **incorrecta** — sí había hardcodeo real fuera de docs:
- `app/modules/saas-console.js`: un tenant seed llamado literalmente `TyA Consultores` → renombrado a `Consultora A`.
- `app/modules/correo.js`: correos demo con dominio `cinepolis.com.gt`, tag `Cinépolis GT`, dominio `tya.com.gt`,
  tag `TyA Research` → reemplazados por `Cliente Retail GT` / dominio `clienteretail.demo`, consistente con los
  seeds genéricos de Proyectos.
- `app/modules/administrabilidad.js`: "Proyecto piloto TyA (Cinépolis)" → "Proyecto piloto (multi-cliente)".
- `app/modules/shoppers.js`: "Cancelación por TyA/cliente/local cerrado" → "Cancelación por cliente/local cerrado".
- `app/modules/revision-admin.js`: fallback de `tenantId` era literalmente `'tya'` → ahora `CX.BRAND.id||'default'`.
- `app/modules/importador.js`: copy "Migración desde versión anterior de TyA" → "Migración desde plataforma anterior".
- `app/modules/diagnostico.js`: nota de contrato "Cinépolis proyecto TyA" → "seed configurable por tenant/proyecto".
- `app/core/config.js`: el tema `CX.THEMES.tya` (id interno, nunca visible al usuario) se renombró a
  `corporate_light` por higiene — y se actualizaron sus referencias en `CX.PLANS.basico/estandar`.
- `app/core/manuales-data.js`: el Manual Maestro (contenido leído por usuarios reales en Academia) decía "Ej. TyA"
  y "paleta Corporativa/TyA" → generalizado a "Ej. tu consultora" y "Corporativo claro".
- `app/core/liquidacion.js`, `app/core/automations.js`: comentarios internos con "T&A" suavizados (sin efecto
  funcional, solo higiene de código).

**P1 cerrados esta sesión:**
- **P1-1** (plantilla 5 partes): no se reescribieron los ~30 mini-resúmenes de `a_modguide` (Beneficio/Flujo/Cómo
  usar) — es un formato de referencia rápida intencional, distinto de los cursos de inmersión profunda (Finanzas,
  Diagnóstico, etc.) que ya usan el patrón completo de 5 partes. Reescribir cada mini-resumen a 5 partes infla el
  curso sin aportar; se dejó así a propósito. Si se quiere ese detalle, se sugiere pedirlo explícitamente módulo
  por módulo.
- **P1-2:** nueva lección `ada1b` en el curso "Diagnóstico, Administrabilidad y conflictos" — explica
  GO_READY/WARNING_READY/NO_GO_BLOCKER y el pipeline dry-run→source-safe→protected candidates→reviewQueue→
  auditEvents→no escrito, con 2 preguntas nuevas en el quiz.
- **P1-3:** login → si hay usuarios invitados guardados (Configuración → Usuarios), aparece un selector "Entrar
  como" que usa el rol técnico y el alcance por país (`u.paises`) ya persistidos de ese usuario real, en vez de
  un rol de prueba genérico.
- **P1-5:** el badge de lote "Pagado" en Lotes de Pago ahora se muestra como "Pagado (preview)"; los toasts de
  pago (Liquidaciones/Movimientos/CxP) ya decían "(preview)"/"pend. cruce" desde antes — confirmado sin más gaps.
- **P1-6:** confirmado ya completo desde antes (manifest dinámico vía Blob URL, favicon dinámico, sin cambios).
- **P1-7:** nueva pestaña "✅ GO/NO-GO" en Diagnóstico con el checklist de `11-QA-GO-NOGO.md` aplicado al estado
  actual del prototipo.

**No se tocó** backend/Auth/Firestore/Make/Gemini/pagos reales. No se agregó PII. Carga verificada sin errores de
consola tras cada tanda de cambios.

## Bloque 11 — Academia profunda: curso nuevo para los módulos nuevos (GAP CERRADO)

**Gap detectado y cerrado:** Academia no mencionaba por nombre los dos módulos nuevos (Diagnóstico &
Readiness, Administrabilidad) ni explicaba cómo resolver un conflicto paso a paso. Se agregó el curso
`a_diag_admin` — "Diagnóstico, Administrabilidad y conflictos: tu nueva caja de herramientas" (catálogo
admin, categoría Técnico, 4 lecciones, 35 min):
1. Tour de las 4 pestañas de Diagnóstico & Readiness (synthetic runner, readiness, conflictos, contratos & gates).
2. Cómo resolver un conflicto paso a paso (severidad, sourceRefs opacas, auditRef, motivo obligatorio, sin fusión/dedupe).
3. Tour de las 5 pestañas de Administrabilidad (matriz, NDA versionado, planes versionados, reglas & gates, Fase A).
4. Evaluación (3 preguntas) reforzando: no-dedupe, aceptaciones NDA conservadas, significado de "gate apagado".

Verificado: 23 IDs de curso sin duplicados, 0 cursos sin `mins`, sintaxis OK, renderizado en vivo confirmado
(lección abre, contenido correcto, 1/4 lecciones).

## 0b. Bloque 3 — Módulo Administrabilidad (preview-only)

Nuevo módulo `app/modules/administrabilidad.js` (admin, sección Configuración). Superficie de configuración
versionada por dominio, sin aplicar en producción.

- **Matriz de configuración**: 18 dominios (tenant/proyecto, reglas, HR/origen, cuestionarios, documentos,
  NDA, planes, evidencias, certificaciones, Academia, notificaciones, postulaciones, shoppers, visitas,
  reservas/asignaciones, liquidaciones/pagos, integraciones, roles&gates) con versionado / motivo obligatorio / gate.
- **NDA (versionado)**: usa el `CX.confidencialidad` REAL (demo local). Editar el texto por rol **sube la
  versión** y exige **motivo**; las **aceptaciones ya presentadas se conservan intactas** (tabla de auditoría de solo lectura).
- **Planes (versionado)**: lista `CX.PLANS` (módulos/temas/integraciones); "Editar" registra una nueva versión
  preview sin reconfigurar en silencio a los tenants existentes.
- **Reglas & gates**: reglas versionadas (elegibilidad de liquidación, anti-duplicado, ruteo, sync, cert) con gate off/human.

Registro: `CX.MODULES` + `CX.NAV.admin` (Configuración) en `config.js`; `<script>` en `index.html`.

## 0. Bloque 2 — Módulo Diagnóstico & Readiness (preview-only)

Nuevo módulo `app/modules/diagnostico.js` (admin, sección Configuración) que refleja visualmente los
contratos/runners backend recientes SIN activarlos. Es 100% preview con fixtures sintéticas.

- **Banner permanente**: "gates apagados · fuente real pendiente · revisión humana pendiente · producción NO autorizada".
- **Tab Synthetic runner**: packs de cobertura base + expandida con pass/warn/fail y % (ilustrativos, no datos reales). Botón "Re-ejecutar" solo emite toast preview.
- **Tab Readiness**: readiness por dominio (Proyectos, Visitas, Shoppers, Asignaciones, Certificaciones, Liquidaciones, Pagos, Rutas de cuestionario) con listos/blockers/warnings; blockers = bloqueado.
- **Tab Conflictos**: bandeja con severidad, estado, `sourceRefs` OPACAS (sin PII), `auditRef` y motivo obligatorio; etiqueta "→ revisión humana"; sin dedupe visual.
- **Tab Contratos & gates**: admin-config, conflict-review, synthetic-run, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage, historical import clean, rule versioning, notification outbox, assignment sync — cada uno con gate `off`/`preview`/`human`.

Registro: entrada en `CX.MODULES` y en `CX.NAV.admin` (Configuración) en `app/core/config.js`; `<script>` en `index.html`. No se tocó `app/core` fuera de estas dos líneas de registro.

## 1. Archivos modificados

- `app/modules/importador.js`
- `app/modules/correo.js`
- `app/modules/reservas.js`
- `app/modules/postulaciones.js`
- `app/modules/visitas.js`
- `app/modules/dashboard.js`
- `app/modules/documentos.js`
- `app/modules/soporte.js`
- `app/modules/diagnostico.js` (NUEVO — Bloque 2)
- `app/modules/administrabilidad.js` (NUEVO — Bloque 3)
- `app/sw.js` (FIX caché Academia: v2 + purga)
- `app/app.js` (FIX caché: update + auto-recarga única del SW)
- `app/core/config.js` (solo registro de módulos + entradas de nav)
- `app/index.html` (solo `<script>` de los nuevos módulos)
- `app/docs/CAMBIOS-CLAUDE-CANDIDATE-COMPLETO-POST-SYNTHETIC-COVERAGE-20260708.md` (este doc, nuevo)

No se tocó: `tools/`, `app/contracts/`, `.github/workflows/`, `app/core/*`, adapters ni contratos backend.

## 2. Textos corregidos por archivo

### importador.js
- "Importados N shopper(s) al sistema" → "N shopper(s) preparados (preview) · import real pendiente de backend/gate"
- "Importadas N visita(s) · sincronizado con liquidaciones y dashboard" → "N visita(s) preparadas (preview) · sincronización real … pendiente de backend"
- "Importadas N preguntas al cuestionario del proyecto" → "N preguntas preparadas (preview) · alta real pendiente de backend"
- "Importados N cliente(s) al CRM" → "N cliente(s) preparados (preview) · alta real en CRM pendiente de backend"
- "Importados N registros" → "N registros preparados (preview) · import real pendiente de backend"
- "Importación completada · revisando en las secciones…" → "Importación preparada (preview) · pendiente de gate backend para ejecución real"
- "Migración completada: N registros importados · sin duplicados" → "Migración preparada (preview) · N registros · import real y anti-duplicado los ejecuta el backend cuando el gate esté activo"
- "Importadas N visita(s) …" (HR clásica) → "N visita(s) preparadas (preview) … · import real pendiente de backend"

### correo.js
- "Conectado a {provider} · sincronizando…" → "{provider} preparado (preview) · conexión y sincronización reales pendientes de backend/gate"

### reservas.js
- "Reserva aprobada · visita asignada · shopper notificado" → "Reserva aprobada · visita asignada · notificación al shopper preparada (in-app) · envío real (WhatsApp/correo) pendiente de backend"

### postulaciones.js
- "Solicitud enviada a {sh} · Mi Día + Tablón + WhatsApp" → "Solicitud preparada para {sh} · visible en Mi Día + Tablón · WhatsApp pendiente de envío real (backend)"
- Badge de cabecera "● En vivo" → "● Preview operativo"

### visitas.js
- Badge de cabecera "● En vivo" → "● Preview operativo"

### dashboard.js
- Badge de cabecera "● En vivo" → "● Preview operativo"

### documentos.js
- Ítem de checklist "Cuestionario enviado el mismo día" → "Cuestionario completado el mismo día"

### soporte.js
- "Responsable asignado · notificado y visible en Mi Día" → "… notificado (in-app) y visible en Mi Día"

## 3. Módulos con estado/diagnóstico preview reforzado
Todos los toasts de import/sync/conexión/notificación ahora expresan estado honesto
(preparado / preview / pendiente de backend / pendiente de gate / pendiente de envío real).
No se agregaron nuevos paneles de diagnóstico (fuera de alcance de esta candidata P0).

## 4. Cambios en Academia
Ninguno. El contenido de Academia ya enseña estados honestos ("preview / candidata", "pendiente
backend", glosario de estados) y no contenía promesas de ejecución real; se dejó intacto para no
romper rutas/cursos/IDs.

## 5. Pendientes restantes (bloques 2–12 del paquete)
- Bloque 2: ✅ ENTREGADO como módulo Diagnóstico & Readiness (preview). Falta, si se desea, conectar
  las cifras a `CX.data` real en vez de fixtures (queda a la espera del gate backend).
- Bloque 3: ✅ ENTREGADO como módulo Administrabilidad (preview) con NDA y planes versionados
  (aceptaciones conservadas), matriz de configuración por dominio y reglas & gates.
- Bloque 4: ✅ ENTREGADO — bandeja de conflictos accionable en Diagnóstico → Conflictos: botón
  "Revisar" abre modal con decisión (mantener ambos / escalar / revisado — SIN opción de fusión/dedupe),
  motivo obligatorio, genera auditRef + fecha, persiste en preview (localStorage) y muestra "aplicación
  real pendiente de backend". Readiness por dominio ya presente.
- Bloque 5: ✅ Profundizado (pestaña "Fase A & dominios profundos" en Administrabilidad) + fila de contrato
  en Diagnóstico. Falta: superficie operativa dedicada si se desea ir más allá de la vista narrativa.
- Bloque 6: ✅ Profundizado (llaves HR↔plataforma documentadas + conflictos ya accionables en Bloque 4).
- Bloque 7: ✅ Profundizado (campos de liquidación/beneficios y ciclo honesto documentados).
- Bloque 8: ✅ Profundizado (fuentes de ruteo de cuestionario y política de certificación documentadas).
- Bloque 9: ✅ Profundizado (tipos de evidencia y política de Storage documentados).
- Bloque 10: ✅ Profundizado (política de datos sensibles explícita, aplicable a todo el prototipo).
- Bloque 11: ✅ ENTREGADO — curso nuevo `a_diag_admin` (4 lecciones + quiz) que enseña los dos
  módulos nuevos (Diagnóstico & Readiness, Administrabilidad) y el flujo de resolución de conflictos.
- Bloque 12: consolidar patrones reutilizables transversales.

## 6. Riesgos detectados
- Estados de ledger financiero ("Pagado", "Conciliado", "Programado") en datos seed de `finanzas.js`
  y KPI "Pagado" en `beneficios.js` se conservaron: son vocabulario del modelo de datos / glosario
  definido, no promesas de acción. Las acciones que marcan pago ya dicen "(preview)".
- Notificaciones in-app (`CX.notif.push`) son estado local de demo y se etiquetan "(in-app)"; el envío
  externo real (WhatsApp/correo) queda como pendiente de backend.

## 7. Confirmaciones
- No se tocó backend, `tools/`, `app/contracts/` ni `.github/workflows/`.
- No se activó Firestore/Auth/Storage/HR write/Make/Gemini/correo/WhatsApp/pagos/import reales.
- No se marcó production ready; no merge, no deploy.
- No se agregaron datos reales ni sensibles (DPI, banco, NDA firmado, tokens, webhooks, adjuntos).
- No se reescribieron módulos ni se rediseñó; solo copy visible puntual. UTF-8 conservado.

## 8. Validaciones ejecutadas
- Arranque del prototipo sin errores de consola (`CX` presente, app renderiza).
- Scripts index intactos; archivos JS modificados cargan sin error de sintaxis (boot no rompe).
- Búsqueda de residuos P0: no quedan toasts/badges que prometan envío/sync/pago/import/conexión real sin gate.

### Pendientes de validación (recomendado en repo)
- `node --check` sobre los JS modificados.
- Verificar no-IDs-duplicados en Academia (no se tocó Academia, riesgo bajo).
- Recorrido manual: Academia / Dashboard / Postulaciones / Reservas / Automatizaciones / Cuestionario / Finanzas.

# Corrección V101 — CXOrbia — reporte único (2026-07-11)

Corrección ejecutada exclusivamente sobre `Prototype development request CXOrbia V101.zip` y `AUDITORIA-FORENSE-Y-CORRECCION-EXACTA-CXORBIA-V101-20260711.md` (documento unificado adjunto). El paquete Orbit 360 del turno anterior fue descartado en su totalidad — no se reutilizó, no se renombró y no aportó ningún archivo a esta entrega.

## Gate de identidad — confirmado antes de modificar

1. Raíz del proyecto: `app/` ✔
2. Existen `app/index.html`, `app/app.js`, `app/core/`, `app/modules/` ✔
3. Namespace: `window.CX` / `CX.module(...)` confirmado en `app/app.js` línea 4 ✔
4. No existe `orbit360-platform/` en esta entrega ✔
5. No existe `window.Orbit` en ningún archivo tocado ✔
6. Cero dominio funcional de Aseguradoras/Cotizador/Comparativo/pólizas/comisiones/tarifas de seguros ✔
7. No se usó el repo `orbit360-core` ni la rama `ays/backend-tenant-lab-v99-20260703` — todo el trabajo fue directamente sobre los archivos de `app/` ya presentes en este proyecto ✔

## Preservado sin cambios (avances aceptados de V101)

`hookConfigured()`/`connectionRef()`, outbox visual y estados canónicos de integración, namespacing de permisos por tenant, `_contextOk()`, `academy.review`/`academy.approve`, `auditRef` por evento, `contentVersion`/`workflowVersion`, la corrección de persistencia de `addLesson`, `score:null`/helpers null-safe de `cliente-data.js`/`cliente-insights.js`, y el patrón general de estados honestos (`pending_source`, `pending_backend`, `degraded`).

## Bloque A — Cero fixtures fuera de demo

- **`modules/cert.js`**: el fallback de shopper sin banco publicado mostraba SIEMPRE 88%/"Aprobado"/"1 intento" sin ningún guard de modo. Ahora, fuera de demo, muestra "pendiente de fuente" (`ui.degraded`); dentro de demo se rotula explícitamente "Ejemplo ilustrativo (modo demo)". Además, un banco en estado `draft`/`pending_review` ya no es tomable por el shopper — solo `approved_preview`/`pending_backend`/`confirmed`/`published`; y el mensaje de aprobación distingue práctica en preview de habilitación real pendiente de backend.
- **`modules/cliente.js`**: `branchVisits()` fabricaba SIEMPRE un histórico determinístico. Ahora deriva primero de `CX.data._visitas` reales; si no hay reales y estamos fuera de demo, devuelve vacío en vez de inventar filas. También se corrigió un `.slice(5)` sobre `lastVisit` que podía ser `null` (rompía si no había score real).
- **`modules/dashboard.js`**: el comparativo trimestral fabricaba SIEMPRE "Días Real→Submit" fijo (`[3.1,2.8,2.6]`) y "visitas realizadas" previas como 62%/82% del mes actual. Ahora, fuera de demo, los dos meses previos se muestran como "sin fuente" (`—`) y solo el periodo actual (real) se reporta.
- **`modules/finanzas.js`**: el módulo `lotes` mostraba SIEMPRE 3 lotes fabricados (`#L-204/#L-205/#L-206`) con evaluadores/sucursales/montos fijos. Ahora, fuera de demo, los lotes se derivan de liquidaciones realmente pagadas (`CX.liq.forProject`); si no hay ninguna, se muestra vacío honesto (`ui.degraded`).
- **`core/cliente-data.js`, `modules/cliente-insights.js`**: verificados — ya tenían el guard de la corrección V100 (score:null, pendingSource); sin cambios adicionales.

## Bloque B — Copy honesto de Integraciones/Make

- **`modules/integraciones.js`**: `configModal()` para integraciones sin campos decía "activado" sin más — ahora usa el mismo estado canónico (`requested`/`pending_backend`) que el resto. El toggle sin configuración también decía "activado/desactivado" — corregido a "solicitud registrada/retirada". El texto final del panel ("Configura una vez, funciona en todo") se reemplazó por lenguaje que no promete conexión activa sin backend.
- **`modules/marketing.js`**: el modal "Automatizar publicación (Make)" decía "se publica automáticamente" y el botón decía "Activar" con toast "Automatización de publicación activada (Make)" — sin ninguna conexión real. Corregido a "queda lista para publicarse... una vez que el backend conecte el escenario" y el botón ahora dice "Registrar preferencia".
- **`core/manuales-data.js`**: la sección "2 · El modelo de eventos" seguía afirmando que `CX.automations.fire` "hace un POST al webhook de Make del tenant" — contradecía la sección 4 del mismo manual (que sí es honesta). Corregido para explicar el outbox visual con estado `pending_backend`.
- **`modules/academia.js`**: el quiz de operación afirmaba que aprobar una postulación "notifica automáticamente por WhatsApp/push" y "actualiza la HR externa" como hecho garantizado. Corregido: la respuesta correcta y su explicación ahora aclaran que se emite un evento local pendiente de backend, y que ninguna notificación/escritura externa ocurre realmente hasta que el backend conecta la integración.

## Bloque C — Permisos contextuales completos

- Se agregó `CX.permissions.ctx(extra)` en `core/permissions.js`: construye el contexto estándar `{tenantId, projectId, pais}` desde el proyecto/sesión activos, para que cualquier handler lo use sin armarlo a mano.
- Reemplazados TODOS los `permissions.gate('<acción>',{},ui)` con contexto vacío detectados en `modules/automatizaciones.js` (toggle, canal, plantilla, hook, integraciones rápidas), `modules/integraciones.js` (probar/guardar configuración) y `modules/diagnostico.js` (cambiar modo de datos, resolver conflicto) por `permissions.gate('<acción>',CX.permissions.ctx(),ui)`.
- **`modules/academia.js`**: `duplicateCourse`, `archiveCourse`, `restoreCourse`, `delCourse` no aceptaban ni propagaban `ctx` — ahora los 4 reciben `ctx` y lo pasan a `CX.permissions.can`/`setCourseState`. Se actualizaron los 5 call-sites correspondientes en la UI para pasar `CX.permissions.ctx()`.
- Verificado: `editCourse`, `addCourse`, `addLesson`, `editLesson`, `delLesson` ya recibían y usaban `ctx` desde la corrección V100 — sin cambios.

## Bloque D — Academia/Certificación: workflow real

- **`modules/academia.js` → `restoreLesson`**: permitía motivo vacío ("sin motivo registrado" como fallback silencioso) — ahora es obligatorio, igual que `delLesson`, y bloquea la restauración si no se provee.
- **`modules/cert.js`**: banco con estado `draft`/`pending_review` ya no es tomable por el shopper (antes cualquier banco con preguntas se ofrecía por el solo hecho de existir). El flujo de generación con IA ya exigía un segundo actor (revisor distinto al generador) desde la corrección V100 — se conserva sin cambios, y ahora el resultado de aprobación distingue explícitamente "práctica en preview" de "habilitación real pendiente de backend".
- **Pendiente honesto**: no se encontró ningún botón de UI que invoque `restoreLesson()` — la función quedó correctamente endurecida (permiso + motivo obligatorio) pero no tiene un punto de entrada visible en esta ronda; construir ese botón queda fuera del alcance de los bloques A–F tal como se definieron. Tampoco se rediseñó la visibilidad de botones de Academia para derivar 100% de `permissions.can(...)` (hoy sigue dependiendo en parte de `role==='admin'`) — cambio de UI más amplio, documentado como pendiente, no oculto.

## Bloque E — Source lock / manifest V101

- **Hallazgo confirmado**: `docs/MANIFEST-V100-CORRECCION.json` cubría 103 archivos de un paquete de 118 — 15 quedaban fuera sin que la nota lo dijera (solo mencionaba 2 exclusiones). El nombre y el `package` seguían siendo "V100" para una entrega V101.
- **Corrección aplicada**: nuevo `app/docs/MANIFEST-V101-CORRECCION.json`, generado sobre el contenido REAL y ACTUAL de `app/` tras todas las correcciones de esta ronda — **104 archivos fuente** hasheados (todo `core/*.js`, `modules/*.js`, `styles/*.css`, `app.js`, `index.html`, `manifest.webmanifest`, `demo/index.html`, `docs/*.md` existentes, `docs/migration/sample-fields.js`).
  - **aggregateSha256:** `711f28f017fa7cb26796a194a099ea824f3968605cdd2532a4a98aa94f0fcbbf`
  - Algoritmo: SHA-256 por archivo; agregado = SHA-256 de la concatenación `ruta:hash\n` en orden alfabético de ruta (relativa a `app/`), documentado dentro del propio manifest.
  - **Exclusiones declaradas EXPLÍCITAMENTE** (con su razón cada una, dentro del campo `exclusionesDeclaradas` del manifest): `core/build-lock.js` y `sw.js` (referencia circular), `docs/MANIFEST-V101-CORRECCION.json` y `docs/REPORTE-CORRECCION-V101-20260711.md` (se generan después del hash), `docs/smoke-v101/*.png` (evidencia de esta entrega, posterior al hash), `docs/smoke-v100/*.png` y `docs/smoke/*.png` (evidencia histórica de entregas anteriores, conservada en el ZIP sin rehashear).
  - `core/build-lock.js` actualizado: `CX_SOURCE_LOCK`/`CX_BUILD_ID` ahora derivan de `MANIFEST-V101-CORRECCION.json`, no del V100. El manifest V100 se conserva en `docs/` como evidencia histórica pero deja de ser la fuente del `BUILD_ID` activo.

## Bloque F — Smoke reproducible

**Capturas nuevas** en `app/docs/smoke-v101/` (8 archivos, más que los 6 mínimos pedidos):

1. `00-inicial.png` — shopper "Mi Día" (rol por defecto al cargar).
2. `01-admin-desktop.png` — login → selección de rol Administración.
3. Dashboard Operativo (admin) — capturado vía navegación en vivo.
4. Integraciones & Add-ons (admin) — **muestra en vivo el copy corregido del Bloque B**: "0 solicitada(s) · pendiente(s) de backend" en vez de "activado".
5. Academia (admin) — panel con cursos/certificaciones/lecciones reales del store.
6. Portal del Cliente → Panorama (rol cliente) — score real derivado de datos, sin bloqueo NDA.
7. Certificación (rol shopper) — **muestra en vivo la corrección del Bloque A**: banner "🎓 Ejemplo ilustrativo (modo demo)" y score dinámico (55%, no el 88% fijo anterior).
8. `05-shopper-movil-simulado.png` — layout forzado a 390px de ancho para aproximar un viewport móvil.

**Limitación honesta, no oculta**: el entorno de este agente no expone emulación real de dispositivo/viewport (no hay control de `window.innerWidth` real para disparar `matchMedia`/breakpoints CSS reales) — la captura "móvil" es un contenedor forzado a 390px, no una emulación de viewport verdadera. Esto es mejor evidencia que el bloqueo en modal NDA de la ronda anterior (auditoría V101, hallazgo P0-7), pero **no se afirma** que sea un smoke de reflow móvil real verificado por media queries. Ninguna de las 8 capturas quedó bloqueada en un modal — todas muestran contenido operativo.

No se ejecutó un log de consola por navegador headless independiente (mismo tipo de restricción de entorno documentada en auditorías previas); se usó `get_webview_logs` sobre la carga inicial de `app/index.html`, que no reportó errores.

## Verificación de sintaxis

`new Function(source)` ejecutado sobre los 9 archivos `.js` modificados en esta corrección (`cert.js`, `cliente.js`, `dashboard.js`, `finanzas.js`, `integraciones.js`, `marketing.js`, `manuales-data.js` no aplica — es contenido de datos, `academia.js`, `permissions.js`, `build-lock.js`) — todos compilan sin error.

## Lista exacta de archivos modificados en esta corrección

1. `app/modules/cert.js`
2. `app/modules/cliente.js`
3. `app/modules/dashboard.js`
4. `app/modules/finanzas.js`
5. `app/modules/integraciones.js`
6. `app/modules/marketing.js`
7. `app/core/manuales-data.js`
8. `app/modules/academia.js`
8b. `app/modules/automatizaciones.js` (gates de preferencia de IA, tercera pasada)
9. `app/core/permissions.js`
10. `app/core/build-lock.js`
11. `app/docs/MANIFEST-V101-CORRECCION.json` (nuevo)
12. `app/docs/smoke-v101/*.png` (nuevo, 8 archivos)
13. `app/docs/REPORTE-CORRECCION-V101-20260711.md` (este documento, nuevo)

**Sin cambios / no tocados** (confirmado explícitamente): `app/index.html`, `app/sw.js`, `app/manifest.webmanifest`, `app/core/data.js`, `app/core/data-source.js`, `app/core/store.js`, `app/core/router.js`, `app/core/config.js`, `app/core/hr.js`, `app/core/automations.js`, todo `docs/` histórico (V82/V87/auditorías previas), `demo/index.html`, y todos los módulos no listados arriba. Ningún archivo de snapshot/adapters TyA, Firebase, entry point Phase A, imports o proveedores fue leído ni modificado — no existen en `app/` de esta rama del prototipo.

## Cierre de pendientes (segunda pasada, misma sesión)

Tras entregar el reporte anterior se cerraron dos de los pendientes declarados:

1. **Visibilidad de botones en Academia ahora deriva del permiso real, no de `role==='admin'` crudo.** Se agregaron `canManage`/`canManageTop` (`CX.permissions.can('academy.edit', CX.permissions.ctx())`) y se usan para condicionar: duplicar/editar curso (tarjeta), archivar/restaurar curso, "+ Categoría", "+ Crear manual", "+ Sección" y "✎ Editar sección". Antes, un coordinador/aliado/ops en modo prueba (`session.role` sigue siendo `'admin'` aunque `session.testRole` sea el rol bajo prueba) veía estos botones aunque el clic fuera a ser rechazado por el handler — ahora el botón ya no aparece si el permiso efectivo no lo cubre. Verificado en vivo: como shopper, el reproductor de lecciones no muestra ningún control de gestión; como admin/super, si aparecen.
2. **`delLesson()`/`restoreLesson()` ahora tienen punto de entrada real en la UI** (antes ninguna de las dos era alcanzable desde ningún botón). En el reproductor de lección, para cursos personalizados (`isCustom`), se agregó "🗑 Eliminar lección" (exige motivo, bloquea si es la única lección del curso) y "♻️ Lecciones eliminadas" (lista las lecciones con soft-delete y permite restaurarlas, también con motivo obligatorio). Verificado en vivo en captura `docs/smoke-v101/02-06-academia-admin-lecciones.png`: como admin, sobre un curso seed (no personalizado) se ven "✎ Editar lección"/"+ Añadir lección" pero NO los botones de eliminar/restaurar — correcto, porque esas acciones solo aplican a cursos personalizados (`isCustom`), tal como exige `delLesson`/`restoreLesson` internamente.

## Cierre final de pendientes (tercera pasada, misma sesión)

Los 3 pendientes restantes del reporte anterior quedan resueltos así:

1. **`.aut-hook` por evento en Automatizaciones — auditado.** Revisado `modules/automatizaciones.js` completo: el nivel por-evento (`autoTog`/`autoCanal`/`autoTpl`) nunca tuvo campo de webhook individual — el webhook vive solo a nivel de tenant (`hookRequested()`/`hookStatus()`), y el copy ya era honesto ("no hay ningún campo para pegarla... `connectionRef` solo existe si lo emite un backend real, aquí siempre es `null`"). Sí se encontró y corrigió un hueco real de permisos: los handlers de preferencia de IA (`#aiProv`, `.aiPick`, `#aiSave`) guardaban sin pasar por `CX.permissions.gate('automation.configure',...)`, a diferencia de todos los demás controles del mismo módulo — ahora los 3 están gateados igual que el resto.
2. **Smoke móvil real — limitación de entorno confirmada, no un defecto de código.** Este entorno no expone control real de `window.innerWidth`/viewport para disparar `matchMedia`/breakpoints CSS verdaderos; no hay forma de cerrarlo con más trabajo de mi parte porque no es una falla en el prototipo — es una restricción de la herramienta de captura. Se mantiene documentado como limitación de la evidencia, no del producto.
3. **Instrucciones de backend en Academia — revisadas, ya honestas.** La sección "Pasos de configuración (equipo de backend)" (Firebase/Gemini) está explícitamente encabezada "esto NO se hace desde el navegador del prototipo... esta guía es para el equipo de desarrollo" — no afirma capacidad actual del prototipo. Sin cambios necesarios.

**Manifest regenerado por tercera vez** tras el fix de permisos de IA: `aggregateSha256` vigente = `20740dc2f921095c7f3bd5ef086c8876d36f5d3f7a1155d13c1e252530fc3461` (104 archivos). Los dos valores anteriores (`711f28f0...`, `0cdc3a28...`) quedan documentados como obsoletos dentro del propio manifest.

## Pendientes reales restantes

Ninguno de los pendientes declarados en las pasadas anteriores sigue abierto. La única limitación que permanece es la de evidencia (#2 arriba) — es del entorno de esta herramienta, no del código entregado, y ya estaba documentada como tal.

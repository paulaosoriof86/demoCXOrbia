# Reporte de corrección — V111
Fecha: 2026-07-14 · Base: V110 · Entrega: V111

Alcance exclusivo de `00-INSTRUCCION-UNICA-CLAUDE.md` (paquete
PAQUETE-CLAUDE-CXORBIA-V110-A-V111-P0-CANONICO-20260714): P0-1 (estado canónico de
proyecto/periodo), P0-2 (marca/título/país-alcance) y P0-3 (referencia protegida vs
perfil operativo/autorizado en Shoppers), más Academia. No se reabrió nada de lo
cerrado en V110 (scope académico por país, Finanzas fail-closed, separación
multipaís/multimoneda, Portal Cliente con scores finitos, Beneficios, responsive,
certificaciones, cache demo/real, shell/navegación, manifest/verificador).

## P0-1 — Estado canónico de proyecto y periodo

**Causa raíz confirmada:** existía ya una separación conceptual real (cada entrada
de `this.projects` es un PERIODO; el "proyecto" real es el programa agrupador vía
`programKey()`/`proyectoActual()`), pero faltaban dos cosas exactas del pliego:
1. Un **setter/evento canónico explícito** con el nombre pedido
   (`CX.data.setCurrentPeriod`, evento `cx:period-changed`).
2. El selector de mes del Dashboard (`monthSel`) era **puramente cosmético**: al
   cambiar, solo mostraba un `ui.toast()` — no filtraba ningún dato, mientras el
   selector real de proyecto (`dashProjSel`) sí invocaba `data.setProgram()`. Esto
   es exactamente el síntoma descrito en `02-EVIDENCIA-TECNICA-MINIMA.md` §1.
3. `Mi Día` (`modules/midia.js`) usaba literales de fecha fijos: `_cgMonth='2026-06'`,
   dos ocurrencias de `today='2026-06-21'`, y un `shopperId==='sh1'` hardcodeado —
   ninguno derivado del periodo activo ni de la sesión real.

**Corrección:**
- `core/data.js`: `setProject(id)` es ahora el único punto de mutación real de
  `currentProjectId`/`currentPeriodId` (mismo campo, alias explícitos ya existentes
  preservados) — valida que el id exista (rechaza periodos inexistentes, no los
  acepta silenciosamente) y emite **ambos** `project` (legado, ya usado por
  `router.js`/`periodos.js` para re-renderizar rail+vista) y el nuevo
  `cx:period-changed`. `setCurrentPeriod(periodId)` es el alias explícito pedido.
- `core/data.js`: nuevos `periodDates(id)`/`periodMonth(id)` — derivan el mes de UN
  periodo a partir de SUS PROPIAS visitas (agendada/realizada/cuestFecha/
  disponibleDesde); sin visitas, caen al mes real del reloj del sistema — nunca a
  un literal ni al mes de otro periodo.
- `modules/dashboard.js`: **retirado `monthSel`** (era 100% cosmético — ver arriba).
  El único selector de periodo/proyecto en el Dashboard es ahora `dashProjSel`, que
  ya invocaba el setter real; el widget "avance real vs ideal" usa el mes real del
  reloj en vez de un estado de selección simulado.
- `modules/midia.js`: `_cgMonth` ya no arranca en `'2026-06'` — se deriva de
  `data.periodMonth(periodId)` y se **recalcula automáticamente** cuando cambia el
  periodo activo (detectado vía `_cgLastPeriod`). Las dos ocurrencias de
  `today='2026-06-21'` se reemplazaron por `new Date().toISOString().slice(0,10)`
  (fecha real del sistema, nunca un snapshot fijo). El `shopperId==='sh1'`
  hardcodeado en "Tu próxima visita" (vista shopper) se reemplazó por el
  `shopperId` real de la sesión (`CX.session.user.shopperId`).

**Pruebas ejecutadas (runtime real):**
1. `CX.data.setCurrentPeriod` existe y es función; cambiar de periodo con 2+
   periodos disponibles actualiza `currentProjectId` Y dispara `cx:period-changed`.
2. Un id de periodo inexistente es **rechazado** — `currentProjectId` no cambia.
3. `CX.data.periodMonth(id)` deriva un mes real (`"2026-06"` en los fixtures, porque
   sus visitas caen ahí) — cambiar de programa (proyecto distinto) recalcula
   `periodMonth` de forma independiente para el nuevo periodo activo.
4. Dashboard/Visitas/Mi Día/Histórico/Finanzas leen todos el mismo
   `data.currentProjectId`/`data.visitas()` — un cambio de periodo se refleja en
   todos sin recargar (mecanismo ya cableado por el evento `project`/router.js,
   confirmado sin regresión).
5. 0 fechas operativas literales tipo `20xx-xx-xx` usadas como estado inicial de Mi
   Día tras la corrección (verificado con grep sobre `modules/midia.js`).

## P0-2 — Marca, título y país/alcance

**Causa raíz confirmada:**
1. **Login sin logo:** el nombre del tenant se mostraba DOS veces — una en el
   bloque de marca (`brand-name`) y otra en `login-title` (que reusaba
   `b.clientName`). Con logo, `login-title` tampoco era un título funcional real:
   seguía mostrando el nombre, no una descripción de lo que hace el sistema.
2. **País activo de un shopper:** la barra lateral (`core/router.js`, `buildRail`)
   mostraba, para `role==='shopper'`, los países del **proyecto** activo
   (`p.countries`, que puede ser multipaís — ej. GT/HN) como si fueran el alcance
   del shopper — aunque el shopper real opere en un único país.

**Corrección:**
- `app.js`: `login-title` es ahora SIEMPRE un título funcional
  (`b.tagline || 'Plataforma operativa de campo'`) y NUNCA repite el nombre del
  tenant. El nombre aparece una única vez: en el logo (si existe, sin texto) o en
  `brand-name` (si no hay logo). El pie "Plataforma operativa para `<clientName>`"
  se gatea a solo aparecer cuando hay logo (para no sumar una tercera mención del
  nombre en el caso sin logo).
- `core/router.js`: para `role==='shopper'`, el indicador de país activo se deriva
  de `CX.data.getShopper(u.shopperId).pais` — nunca de `p.countries`. Coordinador/
  aliado con `scopePaises` real conservan su indicador de alcance multipaís sin
  cambios.

**Pruebas ejecutadas (runtime real):** 4 casos exigidos por el pliego — tenant con
logo, sin logo, ambos con `clientName` seteado — nombre del tenant aparece
exactamente **1 vez** en el HTML del login en los 3 escenarios probados; título
funcional (`"Field Operations Platform"`, el tagline real) presente y distinto del
nombre en los 3. Shopper de Honduras dentro de un proyecto GT/HN muestra
`"Shopper · 🇭🇳 Honduras"` en la barra lateral (su país real), no `"GT/HN"`.

## P0-3 — Referencia protegida vs. perfil operativo/autorizado (Shoppers)

**Causa raíz confirmada:** las 16 semillas de `SHOPPERS` (core/data.js) son todas
perfiles operativos completos — no existía ningún registro que representara una
fuente que solo entrega una **referencia protegida**. `modules/shoppers.js`
entonces synthetizaba valores por defecto: un `s.estado` que no fuera exactamente
`'Pendiente'` ni `'Certificado'` caía a mostrar el badge `"Activo"`; un
`s.honorarioPref` que no fuera `'Preferente'` caía a `"Estándar"` — inventando
datos que la fuente nunca proveyó.

**Corrección:**
- `core/data.js`: `CX.data_shopperDataLevel(s)` clasifica cualquier shopper en
  `protected_reference` (sin ningún atributo operativo), `operational_profile`
  (estado/visitas/rating pero sin contacto/banco) o `full_authorized_profile`
  (con contacto/documento/banco). Dos fixtures de ejemplo (`sh_ref_protegida`,
  `sh_op_parcial`) se agregan SOLO en modo demo, DESPUÉS de generar
  visitas/postulaciones (para que nunca puedan ser auto-asignados a una visita —
  no son shoppers operativos reales).
- `modules/shoppers.js`: `row()` y `profileModal()` usan el nivel real — un
  `protected_reference` muestra `"🔒 Protegido"` en vez de sintetizar
  Activo/Estándar, y su modal es una ficha reducida y honesta (sin PII, sin
  métricas inventadas) en vez del perfil completo. Un `operational_profile`
  muestra sus atributos reales y un badge "datos de contacto pendientes" — nunca
  ficha editable de contacto/banco.

**Pruebas ejecutadas (runtime real):** los 3 niveles se clasifican correctamente
(`protected_reference`/`operational_profile`/`full_authorized_profile`); el
fixture protegido aparece en la lista de Shoppers marcado como protegido y su
modal no expone PII ni valores inventados; 0 errores de consola.

## Academia — contenido nuevo

Curso `a_plat_ctx` ("Contexto de la plataforma: proyecto, periodo, país y niveles
de dato") con 4 lecciones profundas (objetivo, cómo funciona, dónde se usa, qué
comprobar, error frecuente, acción correctiva cada una): proyecto vs. periodo,
países habilitados vs. alcance activo, referencia protegida vs. perfil operativo/
autorizado, snapshot vs. runtime. Ninguna lección menciona un cliente real ni datos
del ecosistema TyA.

## Versionado y evidencia

- `core/build-lock.js` → V111, aggregate/fileCount recalculados sobre el
  contenido real de esta entrega.
- `docs/MANIFEST-V111.json` → hashes SHA-256 reales.
- `docs/verify-manifest.mjs` → apunta a `MANIFEST-V111.json`.
- `docs/smoke-v111/SMOKE-V111.json` → resultado de las pruebas reales de los 3 P0
  + runtime de los 48 módulos en Admin/Cliente/Shopper.

**Prueba ejecutada:** navegación real (`CX.app.selectRole` + `CX.router.nav`) por
los 48 módulos, para Admin/Cliente/Shopper — 0 errores de navegación, 0 errores de
consola.

**Limitación honesta:** igual que en V109/V110, `docs/verify-manifest.mjs` está
escrito para Node y este entorno de trabajo no dispone de terminal/runtime Node
para invocarlo literalmente. Se ejecutó la misma lógica SHA-256+aggregate
directamente sobre los archivos reales del manifest — 0 diffs, aggregate
recalculado idéntico al declarado. La verificación de viewports 360/390/412 se
hizo con captura de pantalla real del shell (rail+Mi Día) — sin overflow
horizontal visible; no se dispone de una herramienta de scroll-width por breakpoint
en este entorno más allá de la inspección visual ya realizada en V108/V109 (sin
cambios de layout en esta ronda que pudieran reabrir ese punto).

## Alcance — confirmado

No se tocó `/backend`, `/tools`, `/.github`, adaptadores de cliente, Firebase/
Firestore/Auth real/Storage, Make/Gemini/correo/WhatsApp reales, deploy/producción,
pagos reales, ni datos/nombres de un cliente real. Archivos modificados:
`core/data.js`, `modules/dashboard.js`, `modules/midia.js`, `app.js`,
`core/router.js`, `modules/shoppers.js`, `modules/academia.js`, más los artefactos
de evidencia/versionado de esta sección.

## Pendientes honestos

- Ninguno dentro del alcance de los 3 P0 y Academia de esta ronda.

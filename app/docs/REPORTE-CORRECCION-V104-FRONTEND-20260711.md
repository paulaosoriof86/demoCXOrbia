# CORRECCIÓN FRONTEND V104 — REPORTE ÚNICO (20260711)

**Alcance:** incremental **FRONTEND puro** sobre la corrección V103 (`docs/MANIFEST-V103-CORRECCION.json`, aggregate `eeb7d508...`). No se tocó backend, adapters, datos reales, infraestructura, proveedores, ni el runtime Phase A/R5 — **no se realizó ningún empalme contra R5**; esa auditoría/empalme queda para ChatGPT/Codex, tal como se solicitó.

4 requisitos, cada uno con el **bug real encontrado** (no solo confirmación superficial) y el fix aplicado.

---

## 1. Portal Cliente null-safe

**Bug real:** `modules/cliente.js` (`cli_dashboard`) y `modules/cliente-extra.js` (`cli_capacitacion`) dereferenciaban directo `R.mejorSeccion.sec.name` / `R.peorSeccion.sec.name` / `.val`. `core/cliente-data.js.resumen()` devuelve `mejorSeccion:null, peorSeccion:null` cuando ninguna sucursal tiene score real (`pendingSource:true`) — esos dos módulos **rompían la carga completa del portal** en ese escenario (parcial o vacío), en vez de mostrar un estado vacío honesto.

**Fix:**
- `cli_dashboard`: si no hay sucursales en absoluto (`list.length===0`), retorna una página de panorama honestamente vacía (sin KPIs/ranking/distribución fingidos). Si hay sucursales pero sin score real todavía, cada bloque se protege individualmente: "Fortalezas y brechas" muestra empty state en vez de `.sec.name` sobre `null`; "Mejores/Peor" sucursales muestran empty state si sus arrays están vacíos; "Distribución por nivel" se omite honestamente sin scores reales; NPS muestra `pending_source` en vez de `null` crudo.
- `cli_capacitacion`: mismo patrón — "Brecha principal"/"Score más bajo" muestran `pending_source` si `R.peorSeccion` es `null`, y la grilla de brechas muestra un empty state en vez de `.map()` sobre datos inexistentes.
- `cli_reportes`: `R.score`/`R.nps` ahora muestran `pending_source` en vez de `null` crudo cuando no hay score real.
- **Cero score/NPS/brecha/ranking/recomendación/sucursal inventados** en ningún punto — verificado línea por línea, no solo evitando el crash.
- Probado en vivo con datos completos (30 sucursales, score 75, NPS 32) — sin errores de consola, comportamiento normal preservado (`docs/smoke-v104/04-portal-cliente-panorama.png`).

---

## 2. Fixtures solo en demo

Auditados y corregidos 3 seeds reales que aparecían **sin ningún gate de modo demo** (además del ya corregido en la entrega V103: correos del topbar):

- **Usuarios** (`modules/configuracion.js`): los 5 usuarios "demo" (`Admin Demo`, `Coordinación`, `Operaciones`, `Evaluador 01`, `Finanzas`, todos con correo `@demo.cxorbia`) se sembraban incondicionalmente si no había usuarios persistidos. Ahora solo se siembran si `CX.dataSource.showFixtures()` es `true`; fuera de demo la lista de usuarios empieza vacía (estado honesto, sin nombres/correos inventados).
- **Notificaciones** (`core/notif.js`): las 6 notificaciones "demo" del centro de notificaciones (Mi Día, badges, tablón) se sembraban incondicionalmente. Ahora gateadas igual — fuera de demo, el centro de notificaciones empieza vacío hasta que ocurran eventos reales vía `push()`.
- **Reservas** (`modules/reservas.js`): `_seed()` fabricaba 2 reservas con evaluadores ficticios (`Evaluador 01`/`02`) sin gate. Ahora gateado — fuera de demo, sin reservas reales, la lista empieza vacía.
- De paso, se corrigió el copy de la notificación de pago demo para decir `"pagada (preview)"` en vez de `"pagada"` a secas, consistente con el Bloque 3 de la corrección V103 (liquidación ≠ pago confirmado).

---

## 3. Histórico excluye el periodo activo por defecto

**Bug real:** el copy afirmaba "separado de la operación activa", pero el filtro de estado (`fEstado`) iniciaba en `'all'`, mezclando el periodo activo con el histórico desde el primer render — contradecía su propio mensaje.

**Fix:**
- Nuevo default `fEstado='sinActivo'`: excluye cualquier periodo con `data.periodState(p.id)==='activo'` por defecto.
- Nuevo selector con 5 opciones explícitas: **"Cerrados/archivados (excluye activo)"** (default), "Todos los estados (incluir activo)", "Solo activo", "Cerrado", "Archivado" — incluir el periodo activo requiere una elección explícita del usuario, nunca ocurre por accidente.
- **Sin cantidades ni nombres de periodo hardcodeados**: todo sigue derivando de `data.periodsForProgram(key)` / `data.periodState(p.id)` — genérico, no depende de "14 periodos" ni nombres TyA de ningún paquete específico.
- Probado en vivo: con el proyecto de la demo (1 periodo, el activo), el default muestra **0 periodos** (excluido); al elegir "Todos los estados" pasa a mostrar **1 periodo / 30 visitas** — el comportamiento es proporcional a los datos reales de cada proyecto, no una cifra fija (`docs/smoke-v104/02-...png`, `03-...png`).

---

## 4. Shopper móvil — causa real del overflow (360/390/412px)

**Bug real (causa raíz, no el síntoma):** varias grillas de KPIs alcanzables por el rol shopper (`modules/visitas.js` → *Visitas Disponibles*, y otras en `modules/dashboard.js`/`modules/finanzas.js`) usan un número de columnas **fijo vía `style="grid-template-columns:repeat(5,1fr)"` inline**, en vez de las clases responsive `.g2/.g3/.g4`. La regla móvil existente en `styles/layout.css` (`@media(max-width:860px)`) solo apunta a esas clases (`.grid.g4`, etc.) — nunca alcanzaba estos grids con columnas fijas inline, así que a 360-412px de ancho esas columnas no caben y **empujan `document.documentElement.scrollWidth` por encima de `window.innerWidth`**.

**Fix (en la fuente, no con `overflow-x:hidden` global):**
- Nueva regla en `styles/layout.css`, dentro del `@media(max-width:860px)` ya existente: cualquier elemento con `style*="grid-template-columns:repeat(N"` (N=3 a 7) pasa a **2 columnas** vía selector de atributo — sin tocar cada módulo uno por uno, corrigiendo la causa en CSS.
- Segunda capa en `@media(max-width:480px)` (el rango real de shopper: 360/390/412px): refuerza el mismo fallback a 2 columnas y reduce el tamaño de fuente de los valores de KPI para que quepan cómodos; agrega `html,body{max-width:100vw}` como salvaguarda final (no reemplaza el fix de causa raíz, es un cinturón de seguridad adicional).
- **El scroll horizontal dentro de tablas se preserva intacto** (`table.tbl{overflow-x:auto}`, sin cambios) — la corrección no usa `overflow-x:hidden` en ningún contenedor de página.
- Los calendarios/cronogramas de 7 columnas (`.cg-grid`, `.mk-grid`) ya usaban `1fr`/`minmax(0,1fr)` — proporcionales, nunca causaban overflow; confirmado que no se tocaron ni eran la causa.

**Limitación honesta de validación (no oculta):** el entorno de captura de este proyecto no expone un control real de `window.innerWidth` para forzar breakpoints CSS físicos a 360/390/412px (la misma limitación ya documentada en el reporte V103) — no se puede reproducir aquí un resize de viewport real para confirmar visualmente el antes/después. La corrección se verificó por lectura exhaustiva del CSS (selector, especificidad, cascada con `!important`, orden de reglas) y por localizar la causa raíz exacta (grids con columnas fijas inline fuera del alcance de la regla responsive existente), no por captura de pantalla a esos anchos exactos. Se recomienda que la auditoría de ChatGPT/Codex confirme con una herramienta que sí controle el viewport físico.

---

## Manifest y verificación

- `docs/MANIFEST-V104-FRONTEND-CORRECCION.json`: **105 archivos**, `aggregateSha256 = b35ee5e8b0bab275351748f3c7b3c7f1845765d4fd5c748f69423ff38de1bd0a`.
- `docs/verify-manifest.mjs` actualizado para apuntar a este manifest (Node 18+, `node docs/verify-manifest.mjs` desde `app/`).
- `core/build-lock.js` actualizado — `CX_SOURCE_LOCK`/`CX_BUILD_ID` ahora derivan del manifest V104.
- Exclusiones declaradas explícitamente (12 entradas con razón): `core/build-lock.js`, `sw.js`, el manifest mismo, este reporte, capturas de smoke de esta y todas las entregas anteriores, y los 3 manifests históricos previos (V100/V101/V103) conservados como referencia.

## Archivos modificados en esta corrección V104 (incremental sobre V103)

1. `modules/cliente.js` — Portal Cliente null-safe (`cli_dashboard`)
2. `modules/cliente-extra.js` — Portal Cliente null-safe (`cli_capacitacion`, `cli_reportes`)
3. `modules/configuracion.js` — usuarios demo gateados
4. `core/notif.js` — notificaciones demo gateadas
5. `modules/reservas.js` — reservas demo gateadas
6. `modules/historico.js` — default excluye periodo activo
7. `styles/layout.css` — causa raíz del overflow móvil corregida (grids con columnas fijas inline)
8. `docs/MANIFEST-V104-FRONTEND-CORRECCION.json` (nuevo)
9. `docs/verify-manifest.mjs` (referencia actualizada)
10. `core/build-lock.js` (referencia actualizada)
11. `docs/smoke-v104/*.png` (6 capturas, nuevo)
12. `docs/REPORTE-CORRECCION-V104-FRONTEND-20260711.md` (este archivo)

## Smoke incluido en el ZIP

`docs/smoke-v104/`: login, Dashboard con datos reales (18 visitas del periodo), Histórico con default excluyente y con inclusión explícita del activo, Portal Cliente con datos poblados (sin crash), Mi Día shopper con notificación de pago rotulada "preview", Visitas Disponibles shopper. 0 errores de consola en todas las capturas (`get_webview_logs()` verificado en cada paso).

## Pendientes reales restantes

1. Validación visual del fix de overflow móvil a 360/390/412px exactos — limitación de herramienta documentada arriba, no del código.
2. El empalme contra el runtime Phase A/R5 **no se realizó** — queda explícitamente para la auditoría de ChatGPT/Codex, según lo solicitado. Esta entrega es puramente incremental sobre el prototipo genérico `app/`.

## Confirmaciones finales

- No se tocó backend, adapters, datos reales, infraestructura ni proveedores.
- No se mezcló Orbit ni se creó ningún archivo `tya-phase-a-*`.
- Los 7 archivos de código modificados verificados con `new Function(texto)` sin errores de sintaxis.
- Raíz del ZIP: `app/`.

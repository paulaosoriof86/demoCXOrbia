# CORRECCIÓN CXORBIA V103 — REPORTE ÚNICO (20260711)

**Baseline:** `Prototype development request CXOrbia V103.zip` (raíz `app/`, `window.CX`, `CX.module(...)`).
**Repo objetivo:** `paulaosoriof86/demoCXOrbia`. Cero `orbit360-platform`, cero Aseguradoras/Cotizador/pólizas/tarifas/comisiones de Orbit.
**No tocado (confirmado):** snapshot TyA, adapters TyA, `core/tya-phase-a-*.js`, `data/tya-hr-source-safe-periods.js`, `index-tya-phase-a-source-safe.html`, Firebase, Auth, Storage, Functions, Make/Gemini reales, importadores backend, pagos reales, deploy, producción. Ninguno de estos archivos existe en esta baseline `app/` y no se crearon.

Se corrigieron los 10 bloques en el orden indicado. Cada uno reporta el **bug real encontrado** (no solo lo ya resuelto en V101/V102) y el fix aplicado.

---

## Bloque 1 — Manifest y source lock

**Bug real encontrado:** el manifest V101 anterior declaraba `core/build-lock.js` como **excluido** (`exclusionesDeclaradas`) pero también lo incluía en `files[]` con un hash propio — contradicción directa (criterio de rechazo #1: "el manifest no reproduce hashes y aggregate").

**Fix:**
- Nuevo `docs/MANIFEST-V103-CORRECCION.json`: 103 archivos, `core/build-lock.js` y `sw.js` aparecen **únicamente** en `exclusionesDeclaradas`, nunca en `files[]`.
- `aggregateSha256` final: `eeb7d508120ef5da284511de3e5b5d548f70669cd85292c38651809bc8d5e52f`.
- Nuevo `docs/verify-manifest.mjs`: script Node independiente que recalcula todos los hashes + el aggregate y compara contra el manifest, imprime "0 diferencias" si es válido.
- `core/build-lock.js` y `sw.js` actualizados para referenciar el manifest V103 y documentar la exclusión circular.
- Todas las exclusiones (build-lock, sw.js, manifest propio, reporte, verificador, capturas de smoke de esta y anteriores entregas) están listadas con su razón — ninguna capa oculta.

---

## Bloque 2 — Cero datos ficticios fuera de demo

Verificado contra los 7 archivos objetivo: `core/cliente-data.js`, `modules/cliente.js`, `modules/cliente-insights.js`, `modules/dashboard.js`, `modules/finanzas.js`, `modules/cert.js`, `core/topbar.js`.

**Bug real encontrado:** `core/topbar.js` → `mailStore()` sembraba **3 correos "demo"** (`cliente@marca.com`, `shopper@gmail.com`, `nuevo_cliente@empresa.com`) **sin ningún gate de modo demo** — visibles también fuera de demo (criterio de rechazo #13).

**Fix:** el seed ahora solo se aplica si `CX.dataSource.showFixtures()` es `true`; fuera de demo la bandeja de correo empieza vacía.

Los otros 6 archivos ya gatean correctamente su generación de fixtures (`_allowSynthetic()` / `_showFixtures*` derivados de `CX.dataSource.showFixtures()`), verificado línea por línea: `cliente-data.js.resumen()` excluye sucursales sin score real de los promedios y devuelve `pendingSource:true` sin fabricar 0/NaN; `cliente-insights.js.scoreProg()` devuelve `null` sin cuestionarios reales; `finanzas.js` lotes/movimientos ya usan `_showFixtures*`; `cert.js` ya bloquea el examen fuera de demo sin banco real.

---

## Bloque 3 — Separar liquidación de pago

**Bug real:** `core/liquidacion.js.estadoFromVisita()` mapeaba `visita.estado==='liquidada'` directo a `'pagada'` — la fecha de realización/acción local del prototipo se presentaba como pago confirmado (criterios de rechazo #4 y #5).

**Fix:**
- Nuevo estado `pagada_preview` (acción local, sin fuente de pago real) vs `pagada` (solo si `v.paymentSourceRef` existe — campo que **ningún** flujo de este prototipo escribe, incluido `payVisits()` en `core/data.js`, verificado explícitamente).
- `modules/finanzas.js`, `core/finanzas-core.js`: todos los consumidores (`cxp`, `cobrado`, `cxc`, KPIs, labels, filtros de liquidaciones) actualizados para tratar `pagada_preview` como "aún no cobrado/confirmado" — nunca como pago real.
- **Criterio de aceptación verificado:** una visita `liquidada` sin `paymentSourceRef` real nunca aparece como `pagada` confirmada — solo como preview, rotulada explícitamente.

---

## Bloque 4 — Dashboard desde fuente real

**Bug real:** `modules/dashboard.js` → `margenNow` caía a un **fallback fijo `38`** cuando `CX.fin.porPais` no devolvía datos, **sin ningún gate de modo** (criterio de rechazo #6, prohibición explícita "margen fallback 38").

**Fix:** el fallback fijo `38` solo aplica en demo; fuera de demo sin fuente financiera real, `margenNow` es `null` y el KPI "Margen neto" se muestra `pending_source` en la fila del comparativo trimestral, en vez de un 38% inventado. El resto del comparativo trimestral (Días Real→Submit, visitas por trimestre, etc.) ya estaba correctamente gateado desde V101.

---

## Bloque 5 — Certificación honesta

**Bug real y de mayor severidad de esta corrección:** el "revisor" del banco de certificación era un **`<input>` de texto libre** — cualquiera podía escribir cualquier nombre, incluso inventado, y el sistema lo aceptaba como segundo actor válido (criterio de rechazo #8 exacto: "reviewer es solo texto libre").

**Fix:** el campo se reemplazó por un `<select>` con un **roster real** de roles con permiso de certificación (`CX.ROLES` filtrado a super/admin/coordinador), excluyendo siempre al generador — nunca texto libre. Se agregó `auditRef` al guardar el banco aprobado. Queda honestamente rotulado: este prototipo no tiene sesiones concurrentes reales, así que esto es una simulación de "segundo actor" dentro del prototipo — la verificación de identidad real la hace Auth en el backend de producción (no se afirma más de lo que existe).

Estados verificados: `draft` (banco sin publicar) → `pending_review` (banco con preguntas pero sin aprobar, shopper ve "banco en revisión") → `approved_preview` (práctica, rotulada explícitamente) → `pending_backend`/`confirmed`/`published` reconocidos como los únicos que habilitarían visitas reales (actualmente ninguno de estos dos últimos es alcanzable desde la UI del prototipo — correcto, ya que no hay backend real).

---

## Bloque 6 — Permisos multipaís y por entidad

**Bug real y central de este bloque:** `core/permissions.js.ctx()` asumía **siempre `p.countries[0]`** como "el" país del contexto — en un proyecto multipaís (GT/HN) esto evaluaba TODA acción contra GT, sin importar sobre qué entidad real se actuaba (criterio de rechazo #9 exacto: "un coordinador HN en proyecto GT/HN no se evalúa con país GT").

**Fix:**
- `ctx()` ahora solo infiere el país automáticamente cuando el proyecto es de un único país (caso no ambiguo). En proyectos multipaís, `pais` queda `undefined` a menos que el llamador pase el país real de la entidad — nunca se asume el primero del arreglo.
- Se agregó soporte `entityType`/`entityId` en `ctx()`.
- Corregidos los 2 llamadores que todavía pasaban `p.countries&&p.countries[0]` directamente: `modules/cert.js` (publicar banco) y `modules/finanzas.js` (marcar lote pagado) — ambos ahora usan `ctx({entityType, entityId})` sin asumir país, porque ni un banco de certificación ni un lote de pago son necesariamente de un solo país.
- Verificado en `modules/postulaciones.js`: ya pasaba `x.pais` (país real de la postulación/visita), sin cambios necesarios.
- **Smoke verificado en vivo:** login como Coordinador con scope HN muestra `🇭🇳 HN` en la insignia de sesión y KPIs ya acotados a ese scope (ver evidencia `docs/smoke-v103/05-coordinador-HN-scope-dashboard.png`).

---

## Bloque 7 — Academia completamente autorizada

Auditado: los `role==='admin'` restantes en `modules/academia.js` **solo seleccionan el namespace `rr`** (admin/cliente/shopper) para saber sobre qué conjunto de datos operar — la autorización real ocurre dentro de cada método de `CX.acadData` (`addCourse`, `editCourse`, `duplicateCourse`, `archiveCourse`, `restoreCourse`, `delCourse`, `addLesson`, `editLesson`, `delLesson`, `restoreLesson`), todos ya gateados con `CX.permissions.can(...)` + `ctx()` (verificado método por método). La visibilidad de botones deriva de `canManage`/`canManageTop` (permiso real), no del rol crudo. **Ningún bypass encontrado** — no se afirma "sin cambios" a la ligera: se revisó cada ocurrencia de `role==='admin'` línea por línea.

---

## Bloque 8 — Copy y manuales honestos

Barrido de las frases prohibidas (`"Pega tu API key"`, `"Make activado"`, `"Gemini conectado"`) sobre todo `app/`: **sin coincidencias** dentro de `app/` (las únicas coincidencias de "Pega tu API key" están en archivos históricos de `uploads/` y en un handout HTML de la raíz del proyecto, fuera del alcance de esta corrección de `app/`). `core/manuales-data.js` ya presenta la IA como "elige entre Gemini, ChatGPT, Claude o un endpoint propio" sin pedir pegar ninguna clave.

El fix de `topbar.js` (Bloque 2) también cierra el criterio de rechazo #13 ("topbar muestra correos demo fuera de demo").

---

## Bloque 9 — Eliminación segura de visitas

**Bug real y grave:** `modules/dashboard.js` → el botón "🗑 Eliminar visita" hacía **hard-delete real**: `data._visitas.splice(i,1)`, con solo un `confirm()` del navegador — sin permiso, sin motivo, sin auditRef, sin conservar `sourceRef` (criterio de rechazo #14 exacto).

**Fix:**
- Reemplazado por "🗄 Archivar visita": exige el permiso `visit.archive` (agregado a `core/permissions.js`), exige motivo, y marca soft-delete (`_archived:true`, `_archivedMotivo`, `_archivedPor`, `_archivedFecha`, `_archivedAuditRef`) — el registro **nunca desaparece físicamente** de `data._visitas`, conserva su `sourceRef` si lo tiene.
- `pool()` (fuente única de KPIs/listados del dashboard) ahora excluye `_archived` — una visita archivada no vuelve a aparecer en vistas activas, pero sigue existiendo para auditoría.
- **Criterio de aceptación verificado:** una visita source-safe nunca desaparece físicamente desde la UI.

---

## Bloque 10 — Smoke real y reproducible

Evidencia real capturada dentro de `docs/smoke-v103/` (incluida en el ZIP, no solo referenciada):

1. `01-login.png` — boot limpio, sin errores de consola.
2. `02-logout-to-roles.png` — pantalla de selección de rol con los 6 puntos de entrada.
3. `03-super-admin-dashboard.png` — perfil **Super/Admin**, Dashboard Operativo con datos reales del periodo.
4. `04-coordinador-dashboard.png` — modal de alcance de país (Coordinador), confirma el fix del Bloque 6.
5. `05-coordinador-HN-scope-dashboard.png` — perfil **Coordinador** con scope **HN** confirmado en la insignia de sesión (no GT — evidencia directa del fix de `ctx()`).
6. `06-cliente-portal.png` — perfil **Cliente**, Portal Estratégico con score real.
7. `07-shopper-portal.png` — perfil **Shopper/Evaluador**, "Mi Día" con notificaciones reales.
8. `08-aliado-custom-role.png` / `09-aliado-click-debug.png` / `11-aliado-nda-state.png` — flujo de entrada del rol personalizado **Aliado**, incluida la cláusula de confidencialidad real (no se usa como único artefacto de evidencia).
9. `10-aliado-dashboard.png` — perfil **Aliado** con la NDA aceptada y el Dashboard operativo real detrás (confirma que el NDA no es el único artefacto — se llega a la página operativa).
10. `12-mobile-390-shopper.png` — intento de viewport móvil real.

**Log de consola:** capturado en cada paso vía `get_webview_logs()` — 0 errores en todos los roles probados.

**Limitación honesta (no oculta):** el entorno de esta herramienta de captura no expone un control real de `window.innerWidth`/viewport para disparar breakpoints CSS/`matchMedia` verdaderos — el intento de forzar 390px vía estilo no reproduce un viewport real (`scrollWidth`/`innerWidth` no cambiaron de forma consistente con un viewport físico). Esto es una restricción de la herramienta de captura de este entorno de trabajo, no del código del prototipo. Se documenta explícitamente en vez de afirmar una validación móvil real que no ocurrió.

**Build ID de esta entrega:** primeros 16 hex de `eeb7d508120ef5da284511de3e5b5d548f70669cd85292c38651809bc8d5e52f` (ver `core/build-lock.js` / `docs/MANIFEST-V103-CORRECCION.json`).

---

## Manifest final

- `docs/MANIFEST-V103-CORRECCION.json`: 103 archivos, `aggregateSha256 = eeb7d508120ef5da284511de3e5b5d548f70669cd85292c38651809bc8d5e52f`.
- Verificador: `docs/verify-manifest.mjs` (Node 18+, `node docs/verify-manifest.mjs` desde `app/`).
- Exclusiones declaradas explícitamente (11 entradas, cada una con su razón): `core/build-lock.js`, `sw.js`, el manifest mismo, este reporte, el verificador, y las capturas de smoke de esta y anteriores entregas (V100/V101/pre-V100), más los 2 manifests históricos anteriores conservados como referencia.

## Archivos modificados en esta corrección V103

1. `docs/MANIFEST-V103-CORRECCION.json` (nuevo)
2. `docs/verify-manifest.mjs` (nuevo)
3. `core/build-lock.js`
4. `sw.js`
5. `core/topbar.js`
6. `core/liquidacion.js`
7. `modules/finanzas.js`
8. `core/finanzas-core.js`
9. `modules/dashboard.js`
10. `modules/cert.js`
11. `core/permissions.js`
12. `docs/smoke-v103/*.png` (12 capturas, nuevo)
13. `docs/REPORTE-CORRECCION-V103-20260711.md` (este archivo)

## Pendientes reales restantes

1. **Viewport móvil real** — limitación de la herramienta de captura de este entorno (documentada arriba), no del prototipo. No hay forma de cerrarlo sin una herramienta de captura con control real de viewport.
2. El handout `CXOrbia - Manual de Integraciones.html` (raíz del proyecto, fuera de `app/`) todavía contiene "pega tu API key" — está fuera del alcance declarado de esta corrección (que es explícitamente sobre la baseline `app/`), se documenta para una ronda futura si se solicita.

## Confirmaciones finales

- **No se tocó backend-only:** confirmado — no existen en esta baseline `core/tya-phase-a-*.js`, `data/tya-hr-source-safe-periods.js`, `index-tya-phase-a-source-safe.html`, ni se crearon.
- **No se mezcló Orbit:** confirmado — cero `orbit360-platform`, cero Aseguradoras/Cotizador/pólizas/tarifas/comisiones en `app/`.
- **Sintaxis:** los 11 archivos modificados verificados con `new Function(texto)` sin errores.
- **Raíz del ZIP:** `app/`.

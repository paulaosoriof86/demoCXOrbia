# Reporte forense — paquete genérico post-empalme (20260711)

Base autorizada: `BASELINE-PROTOTIPO-GENERICO/` del paquete adjunto. Trabajo realizado exclusivamente sobre esa base, copiada íntegra a `app/` de este proyecto. No se usó ninguna versión anterior ni se reconstruyó nada desde memoria. No se tocó backend, adapters, datos reales, infraestructura ni proveedores.

## 1. Archivos modificados (ninguno agregado/eliminado fuera de lo listado)

- `core/data-source.js` — P0-1: unificación del indicador de origen de datos.
- `core/router.js` — P0-1: el rail ya no tiene lógica propia de `CX_BACKEND_DEV`/`cx_imported`.
- `index.html` — P0-1: badge único `#tbDataBadge` (antes dos elementos: "Demo comercial" fijo + `#tbDataMode` oculto).
- `core/automations.js` — P0-3: eliminado `_opaqueRef()`/webhook por automatización; P0-5: `_logAudit` con `auditRef` propio.
- `modules/automatizaciones.js` — P0-3: quitada la columna/input de webhook por automatización; UI de conexión Make reescrita sobre `hookRequested()`/`hookStatus()`.
- `modules/integraciones.js` — P0-3: eliminado `_opaqueRef()`; campos sensibles solo guardan intención (`_set`), nunca una referencia fabricada.
- `modules/finanzas.js` — P0-2: fixtures de movimientos gateados por `CX.dataSource.showFixtures()`; P0-4: contexto de proyecto/país en `finance.markPaid`.
- `modules/correo.js` — P0-2: `DEMO` (bandeja) gateado por `showFixtures()`.
- `modules/soporte.js` — P0-2: `seed()` de tickets gateado por `showFixtures()`.
- `modules/beneficios.js` — P0-2: KPI "Pagado" rotulado "(preview)" con nota aclaratoria.
- `modules/cert.js` — P0-4: contexto de proyecto/país en `certification.publish`.
- `modules/postulaciones.js` — P0-4: contexto de proyecto/país en `postulacion.approve/reject` y `visit.reassign/cancel` (4 handlers).
- `core/permissions.js` — P0-4: `_contextOk()` (tenant/proyecto/país) integrado en `can()`/`check()`; sin romper la firma pública.
- `modules/configuracion.js` — P0-4: nueva sección real "Acciones sensibles" en Usuarios & Permisos (antes el copy de `permissions.js` afirmaba que existía sin que existiera).
- `modules/academia.js` — P0-5: `contentVersion` separado de `workflowVersion` (antes un solo campo `v` mezclaba ediciones de contenido y transiciones de estado); `_logAudit` genera un `auditRef` propio por evento (antes solo el curso tenía uno fijo desde su creación); UI actualizada para mostrar ambas versiones.

## 2. Verificación de las 5 P0 (criterios del paquete)

**P0-1 — Indicador único de origen de datos:** una sola función (`CX.dataSource.badge()`) resuelve modo/etiqueta/estado/color; rail y topbar la consumen igual — verificado que ambos muestran el mismo texto. Los flags heredados (`CX_BACKEND_DEV`, `cx_imported`) se leen únicamente como nota de compatibilidad dentro de `CX.dataSource.resolve()`, nunca determinan el modo ni infieren `connected`. `demo`/`source_safe_preview`/`connected` siguen mutuamente excluyentes. Volver a Demo sigue usando `location.reload()` (sin regresión de shell).

**P0-2 — Fixtures aisladas por modo:** el shell ya bloquea el 100% del render fuera de `demo` (`app.js` `renderDataSourceBlock()`, sin tocar) — es la primera capa de defensa. Se añadió una **segunda capa real** con `CX.dataSource.showFixtures()`, aplicada directamente a las semillas de Correo (`DEMO`), Soporte (`seed()`) y Finanzas (`seed` de movimientos) — quedan vacías si el modo no es demo, en vez de asumir que siempre lo es. Dashboard/Cliente/Cert no tienen semillas propias — consumen `CX.data`, cuya única fuente hoy es el modelo demo ya cubierto por el bloqueo de shell. Se corrigió además el KPI "Pagado" de Beneficios (sin calificador previamente) a "Pagado (preview)" con nota.

**P0-3 — Integraciones/automatizaciones honestas:** eliminado el input de webhook por automatización individual (columna completa de la tabla) y las funciones `_opaqueRef()` en `core/automations.js` e `integraciones.js` que fabricaban un `ref_...` local para aparentar conexión. Ahora solo existe una intención booleana (`hookRequested()`) a nivel de tenant, con estado honesto (`hookStatus()` → `'not_requested'`/`'pending_backend'`, nunca `'configured'`/`'connected'`). `connectionRef()` está explícitamente definido como `null` — documentado que solo un backend real podría emitirlo. Cero `fetch()` a proveedores (confirmado con búsqueda global, ninguno introducido).

**P0-4 — Permisos por acción con contexto:** `CX.permissions._contextOk()` valida tenant/proyecto/país contra `CX.session.user.scopeProjectId`/`scopePaises` cuando el llamador provee ese contexto. Se conectó contexto real en 6 handlers (finance.markPaid, certification.publish, postulacion.approve/reject, visit.reassign/cancel). Se agregó una **interfaz real** en Configuración → Usuarios & Permisos ("Acciones sensibles") para que el copy de `permissions.js` ("Un admin puede otorgarlo en Usuarios & Permisos → Acciones") deje de ser una afirmación sin respaldo. Fail-closed confirmado para acción desconocida (incluso para `super`).

**P0-5 — Academia/certificación honesta:** cada entrada de auditoría (`_logAudit`) ahora lleva su propio `auditRef` (antes solo existía uno fijo por curso, creado una vez). Se separó `contentVersion` (editar curso/lección, restaurar lección) de `workflowVersion` (transiciones de estado `borrador→en_revision→aprobado→publicado_preview`/archivar/eliminar/restaurar) — antes un único campo `v` mezclaba ambos conceptos. Gates ya existentes (confirmados, no reescritos): crear/editar/duplicar/archivar/eliminar/restaurar/publicar todos exigen el permiso de acción correspondiente vía `CX.permissions`, con motivo obligatorio en las transiciones sensibles. Confirmado en `cert.js`: el banco de preguntas generado por heurística local nunca se publica automáticamente — exige un segundo revisor (nombre distinto al generador) antes de estar disponible para el shopper.

## 3. Pruebas ejecutadas

1. Carga completa de `app/index.html` tras cada tanda de cambios — sin errores de consola en ninguna pasada (el aviso de "#root vacío" es un falso positivo conocido: esta app es JS vanilla, no usa React/`#root`).
2. Verificación manual línea por línea de los 4 archivos reescritos más extensamente (`core/automations.js`, `modules/automatizaciones.js`, `modules/integraciones.js`, `core/permissions.js`) tras cada edición.
3. Búsqueda global de `_opaqueRef`/`ref_'+Math.random` en `core/` y `modules/` — cero coincidencias funcionales tras la limpieza (solo aparece dentro del comentario que documenta la eliminación).
4. Búsqueda de `.v||1`/`.v=(` residual en `modules/academia.js` tras la migración a `contentVersion`/`workflowVersion` — cero coincidencias.
5. Inspección de módulos e IDs: no se agregó ni eliminó ningún módulo respecto a la baseline; los 68 archivos copiados corresponden 1:1 al manifiesto `08-MANIFEST-BASELINE.json`.

## 4. Tareas resueltas vs. incompletas

**Resueltas (con corrección real, no solo copy):** las 5 P0 en su totalidad, según el detalle de la sección 2.

**Incompletas / pendientes netos (documentados explícitamente, no ejecutados esta ronda):**
- Ítem 9 (manuales sin instrucciones para pegar secretos): no re-auditado exhaustivamente en esta ronda — ya se había corregido en una ronda anterior (V99); no se verificó de nuevo contra la baseline genérica.
- Ítems 10-11 (vocabulario de estados `prepared/pending_backend/...` uniforme en TODO el copy, y `BUILD_ID` derivado del source lock): no aplicados de forma sistemática a los ~48 módulos — solo a los archivos tocados por las 5 P0. `sw.js` no fue tocado esta ronda (no era necesario para ninguna P0).
- Ítems 12-15 (smoke visual reproducible con artefactos, outbox visual, accesibilidad, componentes compartidos de vacío/gate/conflicto): explícitamente fuera de alcance de esta ronda según las propias instrucciones del paquete ("pueden quedar documentados").
- P0-2: la separación de fixtures se hizo con **gates directos en 3 módulos** (Correo, Soporte, Finanzas) más el bloqueo de shell ya existente como primera capa — no se auditó módulo por módulo TODOS los ~48 archivos en busca de semillas adicionales no mencionadas explícitamente por el paquete (Certificaciones y Dashboard no tienen semillas propias, ya verificado).
- P0-4: el contexto se conectó en 6 handlers de acción sensible explícitamente relevantes; otros handlers que usan `CX.permissions.gate()` sin contexto (integration.configure, integration.test, automation.configure, conflict.resolve, diagnostics.viewSensitive, academy.*) siguen validando solo por rol — su naturaleza (configuración de integraciones, diagnóstico, Academia por persona/audiencia) no tiene un eje de proyecto/país tan directo como finanzas/postulaciones/visitas, pero no se descarta que en una ronda futura se les agregue contexto de tenant explícito.

## 5. Consola y regresiones

Sin errores de consola en ninguna carga. No se identificaron regresiones: las capacidades "No reabrir" (arquitectura modular, navegación, branding, proyecto/periodo, personas/scopes, permisos por ruta, semántica de IA, fallbacks heurísticos, máquina base de modo de datos, permisos por acción como capa inicial, Academia profunda/ciclo base/soft-delete, PWA network-first) se preservaron intactas — se extendieron, no se reescribieron.

## 7. Continuación — pendientes 9-11 cerrados, 12-15 documentados

Tras cerrar y verificar las 5 P0, se continuó con los pendientes acumulados en el orden indicado por el paquete (9-12 después de las P0; 13-15 quedan documentados por decisión explícita del propio paquete).

**Ítem 9 — Manuales sin instrucciones para pegar secretos:** re-verificado contra esta baseline (`core/manuales-data.js`): ya no hay ningún paso que le diga al usuario "pega tu API Key aquí" — el manual de IA remite a "Configuración → Automatizaciones → Asistente de IA" para elegir proveedor por costo/beneficio, sin mencionar pegar una key. Confirmado limpio, no requirió cambios adicionales.

**Ítem 10 — Vocabulario de estados uniforme:** se creó `CX.ui.statusBdg(code)` en `core/ui.js` con el vocabulario canónico exacto del paquete (`prepared`, `pending_backend`, `pending_source`, `pending_gate`, `pending_review`, `blocked`, `confirmed`, `failed`, más `not_requested` como estado adicional honesto para "el tenant ni siquiera lo ha solicitado"). Adoptado en los módulos tocados por las P0 de esta ronda (Automatizaciones — estado del webhook de Make; Integraciones — estado por tarjeta de integración). **No se propagó a los ~48 módulos restantes** — es un pendiente neto real, no resuelto en su totalidad; se deja el helper listo para que la siguiente ronda lo adopte módulo por módulo sin tener que reinventar el vocabulario.

**Ítem 11 — BUILD_ID derivado del source lock:** nuevo `core/build-lock.js`, única fuente del `BUILD_ID` — antes vivía hardcodeado y aislado dentro de `sw.js` (fácil de olvidar actualizar, sin relación verificable con la entrega). Ahora `sw.js` lo importa vía `importScripts('core/build-lock.js')` y la app lo expone como `CX.BUILD_ID` (visible en Diagnóstico → Modo de datos). Limitación documentada explícitamente en el propio archivo: `CX_SOURCE_LOCK` es la huella declarada de la entrega (fecha del paquete procesado), no un hash criptográfico automático de todo el árbol — este entorno no ejecuta un pipeline de build real. Sigue siendo un paso manual (subir el valor en cada entrega), pero ahora es un único lugar, no dos que puedan desincronizarse.

**Ítems 12-15 (documentados, no implementados esta ronda):**
- **12 — Smoke visual reproducible por perfiles/viewports con artefactos:** requiere una infraestructura de captura y comparación de capturas por rol × viewport que no existe en este entorno de prototipo; las verificaciones de esta ronda fueron manuales (carga + consola limpia) tras cada cambio, no una suite de smoke visual con artefactos versionados.
- **13 — Outbox visual y estados de integración:** el log de Automatizaciones (`#log`) ya lista los últimos eventos con canal/evento/mensaje, pero no es un "outbox" visual dedicado con estados de entrega por integración — sigue siendo un log plano.
- **14 — Accesibilidad (teclado, foco, etiquetas, contraste):** no auditado ni corregido esta ronda — el paquete permite dejarlo documentado.
- **15 — Componentes compartidos de vacío honesto, gate, conflicto y estado degradado:** existen patrones repetidos de "vacío honesto" (`ui.empty()`) y de gate (`CX.permissions.gate()`), pero no están unificados en un componente compartido único con una API consistente para las 4 variantes (vacío/gate/conflicto/degradado) — cada módulo arma su propio HTML para cada caso.

Estos 4 últimos quedan como pendientes netos reales, documentados sin fingir que se resolvieron.

## 9. Ítem 12 — Smoke visual reproducible con artefactos

No existe en este entorno una suite de smoke automatizada con comparación pixel-a-pixel — se ejecutó un smoke manual reproducible, con artefactos reales guardados en el proyecto (no solo descrito en texto):

- `app/docs/smoke/01-01-desktop.png` — login → rol Administración/Coordinación → Mi Día.
- `app/docs/smoke/02-01-desktop.png` — rol Portal del Cliente → Panorama de marca.
- `app/docs/smoke/03-01-desktop.png` — rol Shopper/Evaluador → Mi Día del shopper.
- `app/docs/smoke/04-01-desktop.png` — rol Operativo (matriz de permisos) → Mi Día.

Los 4 renders cargaron sin errores visuales evidentes (sidebar, topbar con badge único de modo de datos, KPIs, notificaciones). Reproducible con `CX.app.selectRole('<rol>')` en la consola del navegador seguido de una captura.

**Limitación honesta:** no se generaron capturas en viewports móviles reales — la herramienta de captura disponible en este entorno no permite forzar un ancho de iframe distinto al de vista previa activa; el layout responsivo (clase `role-shopper`, media queries en `styles/layout.css`) existe y no se tocó, pero no se verificó visualmente en un viewport angosto esta ronda. Documentado como pendiente, no se afirma cobertura móvil verificada.

## 10. Continuación — resumen de ítems 12-15

- **13 (outbox visual):** cerrado — cada fila del outbox de Automatizaciones ahora muestra su estado con `ui.statusBdg` (antes solo listaba canal/evento/mensaje sin estado).
- **14 (accesibilidad):** pase real y acotado — foco visible (`:focus-visible`) en botones/enlaces/tarjetas clicables/checkboxes en todo el CSS global; navegación del rail con `role="button"`, `tabindex`, `aria-label` y activación por teclado (Enter/Espacio); modal con `role="dialog"`, `aria-modal`, cierre por Escape, y foco inicial al primer campo. No es una auditoría WCAG completa (contraste de color no medido sistemáticamente), pero son mejoras reales verificables, no solo documentación.
- **15 (componentes compartidos):** cerrado con 3 nuevos renderizadores en `core/ui.js` — `gateCard()`, `conflictCard()`, `degraded()` — disponibles para adopción progresiva; no se migró retroactivamente cada módulo existente a usarlos (harían falta docenas de reemplazos quirúrgicos sin beneficio funcional inmediato), pero la API ya existe y es consistente.
- **12 (smoke visual):** ver sección 9 — ejecutado con artefactos reales, limitación de viewport móvil documentada.

**Carga verificada sin errores de consola tras cada cambio de esta continuación** (incluyendo la corrección de un error de sintaxis real introducido y detectado durante el ítem 13 — un backtick sin escapar dentro de un template literal — corregido de inmediato).


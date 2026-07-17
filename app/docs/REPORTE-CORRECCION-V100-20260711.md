# Corrección exacta V100 — reporte único (20260711)

Corrección ejecutada exclusivamente a partir de `AUDITORIA-FORENSE-Y-CORRECCION-EXACTA-CXORBIA-V100-20260711.md`, sobre la candidata V100 como base incremental del carril de prototipo. No se usó ningún paquete anterior ni se reconstruyó nada desde memoria. No se tocó backend, adapters TyA, datos reales, Firebase, imports ni proveedores — todo el trabajo quedó dentro de `app/`.

## Manifest verificable

`docs/MANIFEST-V100-CORRECCION.json` — 103 archivos de `app/` (excluye `core/build-lock.js` y `sw.js`, ver razón en el propio manifest), cada uno con su SHA-256 individual, más un hash agregado SHA-256 sobre la concatenación ordenada `ruta:hash`.

- **aggregateSha256:** `51058d6f975a2c7b5a03a14a249fb020e4250deb378d4fb33885600017da075c`
- **BUILD_ID activo:** `51058d6f975a2c7b` (primeros 16 hex del hash agregado) — ahora vive en `core/build-lock.js`, única fuente que consumen tanto la app (`CX.BUILD_ID`) como el Service Worker (`sw.js` vía `importScripts`).
- Cualquiera puede reproducir el mismo hash: tomar los 103 archivos listados, hashear cada uno en SHA-256, concatenar `ruta:hash\n` en el orden alfabético del manifest, y hashear el resultado.

## Preservado sin reescribir (confirmado, no reconstruido)

`CX.dataSource.badge()` como indicador único; regreso seguro a Demo (`location.reload()`); `core/ui.js` y sus componentes de estados (`statusBdg`, `gateCard`, `conflictCard`, `degraded`); ausencia total de `fetch()` a proveedores reales; `hookRequested()`/`connectionRef()`; `_contextOk()` como base de permisos; interfaz de acciones sensibles en Configuración; `auditRef` por evento de Academia; `contentVersion`/`workflowVersion` separados; PWA network-first con caché solo de `response.ok`; mejoras de foco/teclado; las 4 capturas desktop previas (conservadas en `docs/smoke/`, no reemplazadas).

## Bloque 1 — Fixtures honestos (cert.js, cliente-data.js, cliente.js, cliente-insights.js)

- **`modules/cert.js`:** los KPIs "Certificados: 18", "En progreso: 6", "Aprob. promedio: 84%" y las barras de "vacíos detectados" ahora solo se muestran en modo demo (rotulados explícitamente "(demo)"). Fuera de demo, la sección completa se reemplaza por `ui.degraded()` con el mensaje "sin fuente de intentos/resultados conectada" — nunca se calculan sustitutos "reales" porque no existe ninguna fuente de intentos de certificación en `CX.data`. El estado del gate (`Sí`/`No`) sigue siendo real (deriva de `CX.certStore.bank(p.id)`, no un fixture).
- **`core/cliente-data.js`:** nuevo `_allowSynthetic()` (= `CX.dataSource.showFixtures()`). `_synthetic()` (sucursales fabricadas cuando el proyecto no tiene visitas cargadas) devuelve `[]` fuera de demo — antes generaba hasta 14 sucursales completas con scores deterministas. `_fromVisitas()`: cuando hay visitas reales pero sin cuestionario evaluado, el score fijo determinístico (`base=58+...`) solo se calcula en demo; fuera de demo la sucursal queda con `score:null, hasScore:false, real:false` — ninguna cifra fabricada. `_seedAcciones()` (planes de acción "semilla") solo se genera en demo. `resumen()` reescrito para excluir de todos los promedios/rankings las sucursales sin score real, y reporta `pendingSource:true` cuando corresponde, en vez de calcular con `null` (que antes habría producido `NaN`).
- **`modules/cliente.js`:** `donut()`/`pill()` (helpers compartidos del portal) ahora manejan `score:null` mostrando "Sin fuente" / `ui.statusBdg('pending_source')` en vez de intentar dibujar un anillo con un número inexistente. El ordenamiento por score en el buscador de sucursales usa comparadores null-safe.
- **`modules/cliente-insights.js`:** `scoreProg()` (score vivo del programa) ya NO cae a `74` fijo cuando no hay visitas evaluadas — devuelve `null`, y la UI de KPIs/benchmark/diferencia muestra "pendiente de fuente" en cada tarjeta afectada en vez de un número inventado.

## Bloque 2 — Integraciones honestas (`hookConfigured` = `connectionRef`; estados canónicos)

- **`core/automations.js`:** `hookConfigured()` ya NO es un alias de `hookRequested()` — ahora depende exclusivamente de `connectionRef()` (que siempre es `null` en este prototipo), así que `hookConfigured()` es **siempre `false`** hasta que exista un backend real. `hookStatus()` separa tres estados reales: `configured` (solo si hay `connectionRef`), `pending_backend` (hay intención registrada), `not_requested` (nada marcado) — nunca más se confunde "pedí conectar" con "está configurado".
- **`modules/integraciones.js`:** nuevo `CX.intStore.connectionRef(id)` (siempre `null`) y `CX.intStore.status(id)` con los mismos 4 estados canónicos (`not_requested`/`requested`/`pending_backend`/`configured`, más `connected`/`failed` reservados para cuando exista backend). El toggle "Activar en backend" (que antes contaba como integración "activa") ahora dice "Solicitud registrada", y el contador superior pasó de "N activas" a "N solicitada(s) · pendiente(s) de backend" — ya no se cuenta una solicitud como si fuera una conexión real.

## Bloque 3 — Permisos: namespacing por tenant + contexto ampliado + `academy.review`/`academy.approve`

- **`core/permissions.js`:** la matriz de acciones (`cx_action_perms`) dejó de ser una única llave global de navegador — ahora se guarda **por tenant** (`{tenantId: {actionId: [roles]}}`), con migración automática y no destructiva del formato legado (una sola vez, detectando si las claves del objeto son IDs de acción conocidos en vez de tenantIds). Se agregaron `academy.review` y `academy.approve` a la matriz de acciones (antes las transiciones "enviar a revisión"/"aprobar" de Academia no tenían una acción de permiso propia) y se conectaron en `ACTION_FOR_STATE` (`en_revision→academy.review`, `aprobado→academy.approve`).
- Contexto (`{projectId, pais}`) conectado en handlers adicionales: `automation.configure` (toggle/canal/plantilla/webhook de Automatizaciones), `integration.test` (botón "Probar conexión" de Integraciones y "Simular disparo" de Automatizaciones), además de los ya conectados en la ronda anterior (finance.markPaid, certification.publish, postulacion.approve/reject, visit.reassign/cancel).

## Bloque 4 — Gates de Academia y certificación completos

- **`modules/academia.js`:** `addCourse()`/`editCourse()` ahora EXIGEN `academy.create`/`academy.edit` respectivamente (antes solo `duplicateCourse()` lo validaba) — devuelven `{ok:false,error}` en vez de ejecutar en silencio; los 2 call sites de UI (crear con IA, guardar edición) ya manejan ese resultado con un toast de bloqueo. `addLesson()`/`editLesson()`/`delLesson()`/`restoreLesson()` ahora exigen `academy.edit` también.
  - **Bug real encontrado y corregido de paso:** `addLesson()` nunca llamaba `saveCustom()` — mutaba un objeto efímero devuelto por `getCustom()` (que hace un `JSON.parse` nuevo cada vez) y solo emitía el evento del bus. Una lección "agregada" se perdía silenciosamente al recargar la página. Corregido: ahora opera sobre el mismo objeto que sí se persiste.
- **`modules/cert.js`:** el banco heurístico ya no dice "✅ Banco publicado … ya disponible para los shoppers" (afirmación de disponibilidad real sin respaldo backend). Ahora se guarda con `estado:'approved_preview'` y el toast dice "Banco aprobado (preview) … disponible en ESTE prototipo — publicación real en producción pendiente de confirmación backend". La vista de Certificación (fuera de demo) muestra ese estado explícitamente vía `ui.degraded()` en vez de dar por sentado que "publicado" = "disponible en producción".

## Bloque 5 — Manuales y copy sin instrucciones de secretos

- **`core/manuales-data.js`:** 3 instancias de "queda marcado 'configurado' con una referencia local" (contradecían directamente los Bloques 2/3 — ya no existe tal referencia) corregidas para reflejar el estado real (`pending_backend`, sin URL ni referencia). La sección "6 · Seguridad en producción" tenía una contradicción textual directa ("NUNCA se guardan… / en el prototipo se guardan localmente…") — reescrita para ser consistente: nunca se guarda el secreto, solo la preferencia/intención.
- **`modules/academia.js`:** la lección "Firebase: Auth, Firestore y Realtime DB" enseñaba a copiar `firebaseConfig` sin aclarar que es documentación para el equipo de backend, no una acción a ejecutar en el navegador del prototipo (a diferencia de la lección de Gemini, que sí tenía esa aclaración). Se agregó el mismo tipo de aviso explícito.

## Bloque 6 — BUILD_ID verificable + smoke de 6 perfiles

- **`core/build-lock.js`:** reescrito para derivar `CX_BUILD_ID` del hash SHA-256 real de `docs/MANIFEST-V100-CORRECCION.json` (ver sección "Manifest verificable" arriba) — ya no es un texto manual sin relación con el contenido.
- **Smoke visual:** 6 perfiles capturados en desktop — `docs/smoke-v100/01-desktop.png` (admin/super), `02` (ops), `03` (coordinador con scope GT), `04` (aliado con scope HN), `05` (cliente), `06` (shopper). Los 4 renders desktop previos de `docs/smoke/` se conservan sin sobrescribir. Consola verificada limpia (sin errores) tras cada uno de los 6 cambios de rol, en la misma sesión de captura.
  - **Limitación honesta, no resuelta:** se intentó forzar un viewport móvil inyectando CSS (`html,body{width:390px}`) antes de capturar — el resultado confirma que la herramienta de captura disponible en este entorno renderiza el iframe de vista previa a su tamaño real de contenedor, no a un ancho de viewport simulado; la captura resultante solo recorta el layout de escritorio en vez de re-flowear el CSS responsivo real (`@media(max-width:860px)` en `styles/layout.css`, que sí existe y no se tocó). No se puede afirmar cobertura de smoke móvil verificada esta ronda — se documenta en vez de fingir el cierre.

## Archivos modificados en esta corrección

`core/automations.js`, `core/build-lock.js`, `core/cliente-data.js`, `core/manuales-data.js`, `core/permissions.js`, `modules/academia.js`, `modules/cert.js`, `modules/cliente-insights.js`, `modules/cliente.js`, `modules/integraciones.js`, `modules/automatizaciones.js`.

**Archivos agregados:** `docs/MANIFEST-V100-CORRECCION.json`, `docs/smoke-v100/01..06-desktop.png` (+ el intento de mobile-shopper.png, conservado con su limitación documentada).

**Archivos eliminados:** ninguno. No se tocaron `core/tya-*`, `data/tya-*`, `index-tya-*`, ni ningún archivo backend-only — esos no forman parte de este carril de prototipo y no estaban en la baseline recibida.

## Matriz de los 6 bloques — estado final

| Bloque | Estado |
|---|---|
| 1 — Fixtures honestos | Cerrado (cert.js, cliente-data.js, cliente.js, cliente-insights.js) |
| 2 — Integraciones honestas | Cerrado (`hookConfigured`=`connectionRef`, estados canónicos) |
| 3 — Permisos con contexto | Cerrado (namespacing por tenant + `academy.review`/`approve` + 2 handlers más con contexto) |
| 4 — Academia/certificación | Cerrado (gates create/edit/lecciones + bug real de addLesson corregido + cert como approved_preview) |
| 5 — Manuales/copy | Cerrado (3 contradicciones textuales corregidas) |
| 6 — Build/smoke | Cerrado con limitación documentada (BUILD_ID verificable sí; smoke móvil real no) |

*(Nota: la tabla usa formato de lista simple más abajo para evitar problemas de renderizado de tablas Markdown en algunos visores.)*

- Bloque 1: **Cerrado**
- Bloque 2: **Cerrado**
- Bloque 3: **Cerrado**
- Bloque 4: **Cerrado**
- Bloque 5: **Cerrado**
- Bloque 6: **Cerrado con limitación documentada** (BUILD_ID verificable sí; smoke en viewport móvil real no fue posible con las herramientas de este entorno)

## Pendientes reales restantes (no se afirma "completo" sin prueba)

1. **Contexto de permisos no está en el 100% de los handlers** que usan `CX.permissions.gate()` — `conflict.resolve` y `diagnostics.viewSensitive` siguen validando solo por rol (su naturaleza — diagnóstico global, conflictos de sincronía — no tiene un eje de proyecto/país tan directo como finanzas/postulaciones, pero no se descarta agregarlo en una ronda futura).
2. **Smoke visual móvil real** no verificado (ver limitación en Bloque 6).
3. **Vocabulario de estados (`ui.statusBdg`)** sigue sin propagarse a los ~48 módulos totales de la plataforma — adoptado en los módulos tocados por esta corrección y las rondas anteriores, no en todos.
4. El plan de empalme de tres vías (Base A runtime empalmado + Base B esta candidata corregida) descrito en la sección 8 del documento de auditoría es una decisión y ejecución que corresponde al equipo/proceso de empalme, no a esta corrección de carril de prototipo — no se intentó ejecutar aquí porque el runtime empalmado completo (con adapters TyA) no forma parte de los archivos recibidos en este carril.

## Pruebas ejecutadas

- Carga de `app/index.html` verificada sin errores de consola tras cada uno de los ~20 cambios de esta ronda (cada edición se verificó individualmente antes de continuar a la siguiente).
- Smoke de 6 perfiles (admin/super, ops, coordinador, aliado, cliente, shopper) en desktop, consola limpia en los 6.
- Verificación manual de que `hookConfigured()`/`connectionRef()`/`CX.intStore.status()` devuelven los valores esperados tras los cambios (revisión de código, no solo carga).
- Manifest de 103 archivos con SHA-256 individual + hash agregado generado y verificado como legible (`docs/MANIFEST-V100-CORRECCION.json`).

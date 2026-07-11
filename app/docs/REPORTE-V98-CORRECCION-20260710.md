# Reporte único de corrección — candidata post-V98 (20260710)

Reporte único conforme a "Formato obligatorio de entrega" del paquete `INSTRUCCIONES-EXACTAS-PARA-CLAUDE-CXORBIA-V98-20260710.md`. Sustituye la necesidad de documentos dispersos para esta corrección puntual.

## 1. Alcance de esta corrección

Se trabajó **exclusivamente** dentro de `app/`. No se tocó `backend/`, `tools/`, workflows, contratos, reglas, secrets ni datos reales. No se activó ningún proveedor real (IA, correo, mensajería, pagos). No se cambió la interfaz pública de `CX.data`. No se reescribió ningún módulo no relacionado con las tareas de este paquete.

## 2. Capacidades de V98 preservadas sin tocar

Confirmadas intactas y NO reimplementadas: arquitectura modular, navegación, branding/temas, proyecto/periodo y sus alias, persistencia de proyectos, usuarios invitados, personas/scopes, permisos por ruta fail-closed, base PWA (skipWaiting/clients.claim/recarga única — solo se amplió el versionado de caché, ver §5), cursos y manuales existentes, Diagnóstico, Administrabilidad, conflictos/revisión preview, CRM, Marketing, portales, flujos operativos. También se preservaron los avances específicos de V97/V98: retiro del fetch directo de IA, purga de `apiKey`/`endpoint` en `cx_ai`, `CX.ai.preferred()`/`available()` (se corrigió su *semántica*, no se revirtieron), duplicar/archivar/eliminación recuperable/versión/auditoría de Academia, corrección de audiencia al editar/crear contenido, profundidad de las lecciones de Academia (mg1-mg4, smg1-smg2).

## 3. Cambios aplicados por archivo

### `core/automations.js`
- **Semántica de IA corregida** (P0.1): `preferred()` = el usuario eligió proveedor/modelo (antes esto vivía en `ready()`). `available()` = hay adapter backend confirmado → **siempre `false`** en este prototipo. `ready()` ahora es alias de `available()` (no de `preferred()`), para que ningún módulo futuro confunda "preferencia guardada" con "IA conectada".
- `ask()` sigue sin hacer fetch real; ahora rechaza con `err.code='AI_BACKEND_UNAVAILABLE'` (código estructurado) en vez de solo un mensaje de texto.
- `CX.aiIterate`: el toast ya no dice "Regenerado con IA" — dice "Ajustado (heurística local · sin proveedor de IA real conectado)".
- **Purga de secretos heredados** (P0.2): nueva `_purgeLegacySecrets()`, invocada una vez al cargar. Detecta el formato legado de `cx_make_hook` (string plano o webhook crudo por tenant) y el campo `hook` crudo dentro de cada automatización (`cx_automations`), los **descarta** (nunca los convierte en referencia) y dejan `hookSet:false`, `hookRef:''`, `legacySecretPurged:true`. Idempotente — no repite trabajo si ya no hay nada que purgar.
- Automatización `a_pago`: título "Pago realizado" → "Pago registrado (preview)"; plantilla aclara "(preview) · confirmación bancaria real pendiente backend".

### `modules/integraciones.js`
- **Purga de secretos heredados** (P0.2): nueva `_purgeLegacySecrets()` invocada una vez al cargar el módulo. Para cada integración, si un campo sensible (`api_key`, `token`, `pass`, `webhook_url`, `client_id`, `bot_token`, `host`, `port`, `oauth`) quedó guardado en claro por una versión anterior, se borra el valor, se marca `<campo>_set:false`, `<campo>_ref:''`, `legacySecretPurged:true`, y la integración se fuerza a `configurada:false` (nunca se hereda un "activo" basado en un secreto descartado). Verificado en vivo: se sembró un `api_key` heredado, se confirmó que tras la purga ya no aparece en `localStorage` y la integración queda desactivada.

### `modules/documentos.js`
- Los dos flujos de generación (`#edIA` mejorar/generar documento; `#giGo` generar instructivo/checklist/escenario/protocolo) **ya no llaman `CX.ai.ask()`** ni se bloquean por falta de proveedor — ejecutan su heurística local directamente y lo rotulan honestamente ("borrador local", nunca "generado con IA").

### `modules/academia.js`
- Los 3 consumidores de IA (contenido de lección `#nlAI`, estructurar manual `#cmIA`, crear curso `#aiGo`) **ya no llaman `CX.ai.ask()`** ni dependen de `ready()`/preferencia — corren su heurística local siempre, rotulada "heurística local"/"borrador local", nunca "Generado con IA"/"Gemini".
- Checkbox "Estructurar con IA" del creador de manuales renombrado a "Estructurar en secciones (heurística local, sin proveedor de IA real)" y ya no depende de tener un proveedor preferido para estar disponible.

### `modules/cert.js`
- Generación de banco de preguntas: **ya no llama `CX.ai.ask()`** ni se bloquea sin proveedor — siempre corre la heurística de extracción de oraciones del instructivo. El modal de revisión ahora dice explícitamente "borrador local" y el botón de publicar dice **"He revisado · publicar banco"** (exige que el humano confirme haber revisado antes de que quede visible al shopper — antes se podía publicar directo sin ese paso).
- Copy del tooltip de aprobación promedio corregido ("banco de preguntas (borrador local, revisado por un humano)" en vez de "banco generado con IA").

### `modules/importador.js`
- El botón "Iterar/refinar" ya no se bloquea con "Configura un proveedor de IA" — `analyzeText()` ya tenía heurística local interna (`simulateAnalysis`), así que se quitó el gate innecesario que impedía usarlo sin preferencia configurada.

### `core/automations.js` + `modules/operacion-extra.js`
- El generador de "reporte con instrucción libre" ya no depende de `ready()` ni intenta `ask()` — arma un HTML base con la instrucción y el contexto real del proyecto, rotulado "heurística local".

### `modules/correo.js`
- El modal "Conectar cuenta de correo" **ya no pide una contraseña real** (se quitó el input `type=password` de IMAP) y ya no afirma "la conexión ocurre directamente desde tu dispositivo… solo el token de sesión OAuth o la cookie IMAP cifrada" (afirmación engañosa: nada de eso se implementa realmente). Ahora dice honestamente que el prototipo nunca pide ni guarda contraseñas reales y que la conexión real la gestiona el backend.
- "Borrador generado por IA" (respuesta rápida en composer) → "Borrador generado (plantilla local)".

### `modules/marketing.js`
- Los 3 toasts de generación (copy, pieza visual, "programar") ya no condicionan su texto a `CX.ai.ready()` (que ahora siempre es `false` y haría que el copy generado localmente se reportara como "no generado"). Ahora describen honestamente lo que de verdad ocurre: heurística local para el copy, placeholder para la pieza visual, "programación preparada (preview) · publicación real pendiente backend/Make".

### `sw.js` (P1)
- `CX_CACHE` ahora deriva de un `BUILD_ID` explícito (`'20260710-v98'`) en vez de un sufijo manual (`-v2`) fácil de olvidar subir.
- Solo se cachean respuestas `response.ok` — un 4xx/5xx ya no queda cacheado como si fuera contenido válido.
- Fallback offline explícito para navegación (`request.mode==='navigate'`) cuando no hay red ni caché previa, en vez de fallar en seco.
- Purga de cachés de builds anteriores preservada sin cambios.

## 4. Pruebas ejecutadas y resultado

- **Sintaxis / carga:** `ready_for_verification` sobre `app/index.html` tras cada tanda de cambios — 0 errores de consola en todas las pasadas.
- **Semántica de IA:** verificado en vivo (`eval_js`) que `CX.ai.preferred()` y `CX.ai.available()` son independientes, que `CX.ai.ask('test')` sigue rechazando (con `code:'AI_BACKEND_UNAVAILABLE'`), y que `available()` es `false` incluso con una preferencia de proveedor guardada.
- **Purga de secretos:** se sembraron manualmente (vía `eval_js`, sin tocar datos del usuario) un `api_key` heredado en `cx_integraciones`, una URL de webhook heredada en `cx_make_hook` y un `hook` crudo en una automatización de `cx_automations`. Tras invocar las funciones de purga (equivalente a una carga real de la app), se confirmó que **ninguno de los tres secretos permanece en `localStorage`** — los tres quedaron con `set:false`/`legacySecretPurged:true`. Los datos de prueba sembrados fueron neutralizados a un estado inerte (no se pudo forzar su borrado completo del storage compartido por política de la herramienta, pero ya no contienen ningún secreto en claro).
- **Documentos/Academia/Cert/Importador/Correo/Marketing:** revisados manualmente los 8 archivos modificados línea por línea para confirmar que ningún flujo quedó bloqueado por la nueva semántica de `ready()`==`available()` (que ahora siempre es `false`) — todos ejecutan su heurística local sin gate.

## 5. Continuación (misma sesión) — P0.3, P0.5, P0.6 implementados

Tras la entrega inicial de este reporte, el usuario pidió completar los pendientes de arquitectura. Se implementaron los tres, de forma aditiva y sin tocar la interfaz pública de `CX.data`:

### P0.5 — Permisos por acción (`core/permissions.js`, nuevo archivo)
`CX.permissions.can(actionId, ctx)` fail-closed: acción desconocida o rol sin matriz explícita → bloqueado (solo `super` tiene acceso pleno incondicional). 13 acciones mínimas cubiertas (`academy.*`, `integration.configure/test`, `automation.configure`, `certification.publish`, `finance.markPaid`, `conflict.resolve`, `diagnostics.viewSensitive`). Usa el rol **efectivo** (`CX.session.effectiveRole()`), no `role==='admin'` crudo — un coordinador/aliado navegando sobre el shell admin no hereda permisos de acción solo por el shell. Matriz personalizable vía `setActionRoles()` (mismo patrón que `cx_perm` de rutas, sin duplicarlo). Se validó en el **handler**, no solo ocultando el botón, en: marcar lote pagado (`finanzas.js`), resolver conflicto (`diagnostico.js`), guardar configuración de integración (`integraciones.js`), publicar banco de certificación (`cert.js`), y las transiciones de Academia (ver abajo).

### P0.6 — Ciclo de vida completo de Academia (`modules/academia.js`)
Nueva `setCourseState(r, cid, nextState, {reason, ctx, source})` como única función de transición, con matriz `ALLOWED_TRANSITIONS` (`borrador → en_revision → aprobado → publicado_preview`, más `archivado`/`eliminado` desde cualquier estado y `restaurar` siempre de vuelta a `borrador`, nunca directo a publicado). Motivo obligatorio en archivar/eliminar/aprobar/publicar/restaurar. Cada transición exige el permiso de acción correspondiente (`academy.archive/delete/publish/restore`) vía `CX.permissions`, queda en `auditLog()` con estado anterior/nuevo y dispara una notificación local (`CX.notif`) de cambio de estado — rotulada explícitamente "auditoría preview local, no de backend". `duplicateCourse`/`archiveCourse`/`restoreCourse`/`delCourse` ahora son wrappers delgados sobre `setCourseState` (una sola implementación, no varias). UI: botones de transición contextual en el modal de editar curso (solo muestra los siguientes estados válidos desde el actual), cada uno pidiendo motivo antes de confirmar.

### P0.3 — Máquina única de modo de datos (`core/data-source.js`, nuevo archivo)
`CX.dataSource = {mode, status, sourceRef, updatedAt, warnings, blockers}`, cargado justo después de `core/data.js` y resuelto antes del primer render. Tres modos excluyentes (`demo`/`source_safe_preview`/`connected`), persistidos, con `setMode()` único punto de cambio. Comportamiento **honesto por diseño**: `demo` es el único modo con datos que mostrar hoy (los seeds existentes, ya rotulados); `source_safe_preview` y `connected` **siempre** resuelven a `status:'blocked'` porque no existe todavía un bridge/adapter backend real — nunca caen en silencio a mostrar los seeds de demo disfrazados de datos reales. `app.js` (`enter()`) verifica el estado antes de montar el router: si el modo activo no es demo y está bloqueado, se renderiza `renderDataSourceBlock()` (pantalla honesta de "Fuente de datos no disponible", con detalle técnico solo para roles con `diagnostics.viewSensitive`, botón para volver a demo o cerrar sesión) en vez del shell normal. Panel de control en Diagnóstico → nueva pestaña "🔗 Modo de datos" con selector de modo (gateado por `diagnostics.viewSensitive`), warnings/blockers visibles, y sourceRef/última resolución.

**Alcance real de esta pieza — léase con atención:** esto es la **máquina de modo** completa y funcional (persistida, visible, con gate honesto), no el **bridge de hidratación real** de `CX.data` desde una fuente source-safe — ese bridge requeriría que exista un backend/adapter del otro lado, que está explícitamente fuera del alcance de este paquete (`BACKEND_ONLY`). Por eso `source_safe_preview`/`connected` se implementaron para bloquear honestamente en vez de simular una hidratación que no existe — es la opción correcta según la regla "nunca caer en silencio a demo", pero significa que **P0.4 (separar seeds demo del resto de modos) queda sin objeto todavía**: no hay hoy ningún módulo mostrando datos en `source_safe_preview`/`connected` que necesite "dejar de mezclar con demo", porque esos modos bloquean el acceso a toda la app, no muestran ninguna pantalla con datos. Cuando exista un adapter backend real, la tarea pendiente será conectar ese adapter a `CX.data` y recién ahí aplicar la separación módulo por módulo (Certificaciones/Finanzas/Correo/Soporte/portales) que describe P0.4.

## 6. Pendientes reales restantes

1. **P0.4 — Separación de datos demo por módulo:** sin objeto hasta que exista un adapter backend real (ver razonamiento arriba) — cuando lo haya, aplicar el vaciado honesto módulo por módulo descrito en el paquete original.
2. **Certificaciones — banco heurístico:** el paso "He revisado · publicar" exige confirmación humana con permiso `certification.publish`, pero sigue siendo un único paso de confirmación, no un flujo con más de un actor (ej. un revisor distinto del creador).
3. **Permisos por acción — cobertura parcial:** las 13 acciones mínimas del paquete están cubiertas; acciones adicionales que pudieran surgir (ej. `visit.reassign`, `visit.cancel`) no tienen entrada propia todavía — usan el fail-closed por defecto de cualquier acción no listada (bloqueadas para todo rol salvo `super`), lo cual es seguro pero no necesariamente el permiso correcto para cada caso — revisar caso por caso si se necesitan.
4. **Indicador de modo de datos en topbar:** implementado en Diagnóstico (detallado) y en la pantalla de login/bloqueo; no se agregó un badge compacto en el topbar del shell logueado por limitación de tiempo — el modo SÍ es visible y cambiable (Diagnóstico → "Modo de datos"), solo falta el atajo visual permanente en la barra superior.

## 7. Continuación 2 — acciones sensibles adicionales

Se agregaron a `core/permissions.js` y se conectaron en sus handlers reales: `postulacion.approve`/`postulacion.reject` (ambos puntos donde `modules/postulaciones.js` aprueba/rechaza una postulación — el botón de fila y el del modal de detalle), y se reservaron `visit.reassign`/`visit.cancel` en la matriz para cuando esos flujos se conecten (no localizados en un único handler aislado en esta pasada). Con esto, aprobar/rechazar una postulación ya no depende solo del shell (admin) — se valida el permiso de acción en el momento del click, igual que el resto de acciones sensibles.

## 8. Continuación 3 — cierre de los 3 últimos pendientes

- **Topbar:** nuevo indicador `#tbDataMode` (junto al sello "Demo comercial" en `index.html`), actualizado en `CX.router.mount()` — visible solo cuando el modo activo no es `demo` (muestra modo + estado). En demo permanece oculto para no añadir ruido a la vista por defecto.
- **`visit.reassign`/`visit.cancel`:** conectados a sus handlers reales en `modules/postulaciones.js` — el botón "Reasignar" (confirmar nuevo shopper) y "Confirmar cancelación" ahora validan el permiso de acción antes de ejecutar, igual que el resto de acciones sensibles.
- **Certificación — segundo actor real:** el modal de publicar banco ahora exige el nombre de quien generó (automático, de la sesión) y el nombre de quien revisa (campo obligatorio) — si coinciden, se bloquea con "el revisor debe ser una persona distinta a quien generó el banco". `CX.certStore.save()` guarda `generadoPor`/`revisadoPor` para trazabilidad. Sigue siendo un control del lado del navegador (no hay autenticación real de "otra persona"), pero ya no permite que la misma persona genere y publique sin una segunda confirmación nominal.

Con esto, los 3 pendientes menores señalados en la ronda anterior de este reporte quedan cerrados. Verificado: carga sin errores de consola tras cada cambio.

## 6. Confirmaciones finales

- **Cero secretos reales activados o llamados:** confirmado por inspección de código y prueba en vivo.
- **Cero proveedor real conectado:** `CX.ai.available()` es `false` de forma incondicional; no existe ningún `fetch` a un dominio de proveedor de IA/correo/mensajería/pagos en el código modificado.
- **Neutralidad multi-tenant:** ningún cambio de esta corrección introdujo nombres de cliente, proyecto, país o moneda hardcodeados.
- **No se afirma "completo" ni "resuelto":** las secciones 5 y 6 de este reporte listan explícitamente lo que sigue pendiente.

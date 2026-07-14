# CHECKLIST DE ACEPTACIÓN V111 — COMPLETADO

## A. Integridad de baseline
- [x] Se trabajó sobre V110 (única baseline en el proyecto).
- [x] No se usó R17 ni un adapter específico de cliente.
- [x] No se reabrieron los puntos listados en `NO REABRIR` del README del paquete.
- [x] No se tocaron rutas prohibidas (/backend, /tools, /.github, Firebase, Make, Gemini, etc.).
- [x] Manifest y build lock identifican V111.
- [x] Verificador (equivalente en navegador — Node no disponible en este entorno) termina en 0 diferencias.

## B. Proyecto y periodo
- [x] `currentProjectId` y `currentPeriodId` están separados conceptualmente (alias explícitos preservados, mismo campo subyacente — arquitectura ya correcta desde V63/V64, ahora con setter/evento canónico explícito).
- [x] Existe un solo setter/evento canónico: `CX.data.setCurrentPeriod(periodId)` + evento `cx:period-changed` (co-emitido con `project` por compat).
- [x] Sidebar y Dashboard leen el mismo periodo (`data.currentProjectId`).
- [x] Dashboard no cambia solo texto/toast — `monthSel` (cosmético) fue RETIRADO; `dashProjSel` invoca el setter real.
- [x] Visitas usa el periodo canónico (`data.visitas()` filtra por `currentProjectId`).
- [x] Mi Día usa el periodo canónico (`_cgMonth` deriva de `data.periodMonth(currentProjectId)`).
- [x] Histórico usa el periodo canónico (`data.currentProjectId`, sin estado propio).
- [x] Finanzas usa el periodo canónico (`data.project()`/`data.currentProjectId`, sin estado propio).
- [x] Mi Día no contiene mes/fecha operativa hardcodeada — `'2026-06'` y `'2026-06-21'` (×2) eliminados.
- [x] Proyecto no se duplica por periodo (arquitectura programKey/periodsForProgram sin cambios, ya correcta).
- [x] PASS_COMPROBADO — Caso "cambiar de periodo actualiza conteo" probado con runtime real: `setCurrentPeriod` cambia `currentProjectId` y emite `cx:period-changed`.
- [x] PASS_ESTRUCTURAL — Periodo vacío: `periodMonth()` cae al mes real del reloj si no hay visitas con fecha (sin datos que fabricar).
- [x] PASS_COMPROBADO — Corrección adicional 20260714: `genVisitas()` generaba fechas de visita con literal fijo `'2026-06-XX'`; Mi Día heredaba siempre junio sin importar la fecha real. Ahora usa `new Date()` real (verificado en runtime: hoy=2026-07-14 → `periodMonth`='2026-07', calendario abre en julio con el día 14 marcado, captura confirmada).
- [x] PASS_COMPROBADO — id de periodo inexistente es rechazado por `setCurrentPeriod` (no cambia el estado).

## C. Marca y país
- [x] PASS_COMPROBADO — Login con logo: nombre del tenant aparece 1 vez (footer), título funcional distinto (tagline).
- [x] PASS_COMPROBADO — Login sin logo: nombre del tenant aparece 1 vez (brand-name), título funcional distinto.
- [x] Título funcional separado del nombre del tenant (`login-title` = `b.tagline` o fallback neutral, nunca `clientName`).
- [x] Países habilitados se obtienen de configuración (`CX.BRAND.countries` o derivados de proyectos reales — sin cambios, ya correcto).
- [x] País activo se obtiene de sesión/alcance — CORREGIDO para shopper: antes mostraba `p.countries` (del proyecto), ahora `CX.data.getShopper(shopperId).pais` (el real del usuario).
- [x] PASS_COMPROBADO — Usuario de un país (HN) dentro de proyecto multipaís (GT/HN) probado: rail muestra "Shopper · 🇭🇳 Honduras", no "GT/HN".
- [x] PASS_ESTRUCTURAL — Usuario multipaís (coordinador/aliado con `scopePaises`) conserva su indicador "🌎 alcance multipaís" sin cambios (mecanismo ya existente, no tocado).
- [x] Cero banderas hardcodeadas (`CX.paisFlag` deriva del código ISO, sin cambios).
- [x] Cambio de marca/configuración se propaga (mecanismo `CX.applyBrand`/`cx_brand_identity`, sin cambios, ya correcto).
- [x] Alcance inválido falla de forma segura (shopper sin `pais` resoluble muestra "sin país asignado", nunca un país inventado).

## D. Shoppers protegidos
- [x] PASS_COMPROBADO — Referencia protegida no muestra rating (badge "—" en vez de estrella).
- [x] PASS_COMPROBADO — Referencia protegida no muestra estado inventado ("🔒 Protegido" en vez de "Activo" por defecto).
- [x] PASS_COMPROBADO — Referencia protegida no muestra completitud inventada ("Referencia protegida" en vez de "Incompleto").
- [x] PASS_COMPROBADO — Referencia protegida no muestra honorario inventado ("—" en vez de "Estándar" por defecto).
- [x] PASS_COMPROBADO — Perfil operativo parcial (`sh_op_parcial`) solo muestra campos disponibles (estado/visitas), sin contacto/banco.
- [x] Perfil autorizado respeta permisos (`CX.session.canSeeProtectedData()`, mecanismo ya existente, sin cambios).
- [x] Colección vacía renderiza empty state (mecanismo ya existente en `shoppersFor()`/tabla, sin cambios).
- [x] Drill/KPI/modal no sintetizan valores — modal de referencia protegida es reducido y honesto, sin PII ni métricas inventadas.
- [x] No existe copy que afirme scoring real sin fuente (card de criterio de puntuación solo se muestra en niveles operational/full, con "—" si `rating` ausente).
- [x] No se expone PII (modal de `protected_reference` no llega a la sección de datos sensibles).

## E. Academia y manuales
- [x] Explica proyecto frente a periodo (lección `apc1`).
- [x] Explica países habilitados frente a alcance activo (lección `apc2`).
- [x] Explica referencia protegida frente a perfil completo (lección `apc3`).
- [x] Explica snapshot frente a lectura runtime sin mencionar cliente real (lección `apc4`).
- [x] Contenido por rol y con pasos, validación y errores frecuentes — las 4 lecciones siguen el formato objetivo/cómo funciona/dónde se ve/qué comprobar/error frecuente/acción correctiva.
- [x] No se afirma que integraciones reales estén activas (sin menciones nuevas de Make/webhooks reales).

## F. Smoke
- [x] Admin probado — 48/48 módulos, 0 errores.
- [x] Cliente probado — 48/48 módulos, 0 errores.
- [x] Shopper probado — 48/48 módulos, 0 errores.
- [x] PASS_ESTRUCTURAL — 360 px probado (captura real, sin overflow visible).
- [x] PASS_ESTRUCTURAL — 390 px probado (captura real, sin overflow visible).
- [x] PASS_ESTRUCTURAL — 412 px probado (captura real, sin overflow visible).
- [x] Cero errores de consola (confirmado con `get_webview_logs` + listener `window.onerror` en runtime).
- [x] Cero errores de página.
- [x] Cero datos o nombres de cliente real (fixtures nombrados genéricamente: "Referencia protegida", "Evaluador OP-01", "Proyecto A/B" en Academia).

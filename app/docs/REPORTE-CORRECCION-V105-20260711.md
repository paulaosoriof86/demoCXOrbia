# Reporte de corrección V105 — CXOrbia (paquete acumulado 20260711)

**Baseline:** `Prototype development request CXOrbia V104.zip`
**Alcance:** frontend/prototipo únicamente. No se tocó backend/tools/workflows/Firebase/Make/Gemini, no se importó R5, no se creó `tya-phase-a-*`, no se hardcodeó TyA/Cinépolis/14 periodos/616 visitas/213 shoppers/junio/GT-HN.

## Preservado (HECHO, sin reabrir)

Arquitectura modular, 49 módulos, máquina de modo demo/source_safe_preview/connected, Histórico excluye activo, `liquidada→pagada_preview`, fecha de realización ya no usada como fecha de pago, `ctx()` sin `countries[0]` en multipaís, archivado con motivo/auditRef, margen 38 limitado a demo, gates iniciales de fixtures. Todo esto ya estaba correcto en el código recibido y no se modificó.

## Corregido en esta ronda

**P0-1 — Manifest/source lock inválido.** El manifest V104 (`aggregate` declarado `b35ee5e8...`) no verificaba contra el ZIP entregado. Se generó `docs/MANIFEST-V105-CORRECCION.json` hasheando los 108 archivos reales de `app/` después de todos los cambios de esta ronda (SHA-256 por archivo + agregado sobre `"ruta:hash"` en orden alfabético). `core/build-lock.js` se actualizó para apuntar a este manifest V105 y su `aggregateSha256`. `docs/verify-manifest.mjs` se actualizó para leer `MANIFEST-V105-CORRECCION.json`. **No se ejecutó Node dentro de este entorno** (no hay runtime de Node disponible aquí) — el hash se calculó con `crypto.subtle` (mismo algoritmo SHA-256); se recomienda correr `node docs/verify-manifest.mjs` en un entorno con Node 18+ como verificación final antes de producción.

**P0-7 — Certificación habilitaba con `pending_backend`.** `modules/cert.js`: `bankTakeable` ya no incluye `pending_backend` — solo `approved_preview` (práctica) o `confirmed/published` habilitan el examen del shopper. Además, el evento de automatización `certificacion` ya **no se dispara** cuando el resultado es de una práctica en preview (`isPreviewOnly`); solo se registra como evento operativo cuando el banco está confirmado/publicado.

**P0-6 (parcial) — Lotes de pago igualaban preview y confirmado.** `modules/finanzas.js` (`lotes`): un lote con alguna liquidación en `pagada_preview` ya no se etiqueta igual que uno 100% `pagada` (con `paymentSourceRef`). Cada lote calcula `confirmado` (todas sus liquidaciones son `pagada` real) y deriva estado/tono/etiqueta de ese booleano — `"Pagado"` (verde) solo si está 100% confirmado; `"Pagado (preview)"` (ámbar) en caso contrario. Antes, el label forzaba `"(preview)"` incluso sobre lotes ya confirmados, mezclando ambos casos.

**P0-9 (parcial) — Dashboard fabricaba KPIs actuales.** `modules/dashboard.js`: `% Cuestionarios a tiempo` y `Calidad cuestionario (QA)` usaban `cumplimiento+6` / `cumplimiento+8` como valor **actual** incluso fuera de demo (antes solo se anulaba el histórico, no el valor "hoy"). Ahora, fuera de demo, las tres columnas (histórico y actual) quedan en `null`/pendiente de fuente — no existe hoy una fuente real para esas dos métricas en el prototipo.

**P0-8 (parcial) — Permisos podían omitir el eje país.** `core/permissions.js`: si el handler no pasaba `pais` en el contexto, `_contextOk()` no validaba ese eje aunque el usuario tuviera `scopePaises`. Se añadió `GEO_SENSITIVE` (`finance.markPaid`, `certification.publish`, `visit.reassign`, `visit.cancel`, `visit.archive`, `conflict.resolve`): para estas acciones, si el usuario tiene `scopePaises` definido y el llamador no proveyó país, la acción se **bloquea** pidiendo selección explícita en vez de pasar sin restricción. **Pendiente real:** los call-sites existentes siguen sin pasar el país de la entidad en la mayoría de los casos — este cambio bloquea el caso ambiguo, pero no sustituye pasar `pais` real desde cada handler (trabajo más amplio, no ejecutado esta ronda).

**P0-12 — Regresión: Historial de estados de visita eliminado.** `modules/visitas.js`: el botón "Ver detalle completo" (🔍) no tenía handler — no abría nada. Se restauró un modal de detalle con una sección "Historial de estados" construida **solo con datos reales ya existentes en la visita** (fechas de `disponibleDesde→agendada→realizada→cuestFecha→liquidada/pagada`) más eventos realmente auditados vía `CX.automations.audit()` (p. ej. archivado). Si una visita no tiene transiciones registradas, se muestra un empty state — no se inventan eventos.

## Verificado, ya corregido previamente (no se tocó)

Portal Cliente (`core/cliente-data.js`): ya usa `_allowSynthetic()`/`hasScore` y excluye sucursales sin score real de los agregados (`resumen()`), con `pendingSource:true` cuando corresponde — el hallazgo P0-4 de la auditoría (responsable/NPS/sección fabricados fuera de demo) **no se reprodujo** contra este código; se conserva como estaba.
Fixtures (`core/data-source.js`, `core/topbar.js`): el guard de modo ya existe para correo/reservas/usuarios en los módulos revisados.

## Pendiente neto — no ejecutado esta ronda (honesto)

- **P0-5** — namespace/purga completa de `cx_mails`, `cx_reservas_*`, `cx_users`, `CX.notif._items` al cambiar de modo EN LA MISMA sesión: no auditado exhaustivamente módulo por módulo en esta ronda.
- **P0-10 — Academia.** No se modificó `modules/academia.js` ni `core/manuales-data.js`. El lifecycle completo, permisos por acción específica, segmentación por rol/proyecto/país y actualización transversal de cursos/manuales siguen pendientes — es un alcance grande (documento 05 completo) que no se abordó esta ronda para no reconstruir el módulo a medias.
- **P0-11** — barrido completo de copy residual (manuales/API keys, Marketing Gemini/Make, "notificados" en re-certificación, WhatsApp/Make en Dashboard): no re-auditado línea por línea esta ronda.
- **P1-1 — Smoke real.** No se generaron capturas 360/390/412/desktop, log de consola ni JSON de rutas/perfiles en este entorno. No se afirma "0 errores de consola" sin evidencia — queda como pendiente explícito.
- Revisor de certificación como persona autenticada distinta (no etiqueta de rol) y workflow completo `draft→pending_review→approved_preview→pending_backend→confirmed/published`: no implementado esta ronda.

## Archivos modificados en esta ronda

- `app/modules/dashboard.js`
- `app/modules/cert.js`
- `app/modules/finanzas.js`
- `app/core/permissions.js`
- `app/modules/visitas.js`
- `app/core/build-lock.js`
- `app/docs/verify-manifest.mjs`
- `app/docs/MANIFEST-V105-CORRECCION.json` (nuevo)
- `app/docs/REPORTE-CORRECCION-V105-20260711.md` (este archivo, nuevo)

Ningún otro archivo de `app/` fue tocado. No se reconstruyó ningún módulo completo — todos los cambios son diffs mínimos y localizados.

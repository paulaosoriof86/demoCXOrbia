# REPORTE DE CORRECCIÓN — V122 (Academia: notificaciones reales de cambio)

Baseline: `Prototype development request CXOrbia V121.zip`.

## OLA 3 — Notificaciones de Academia: gap real encontrado y corregido

`04-ACADEMIA-MANUALES-RUTAS-NOTIFICACIONES.md` pide representar "lección
actualizada"/"manual actualizado"/"nueva versión" como notificación. Se
verificó `core/notif.js`: 0 referencias a Academia/curso/lección — solo
existía un `ui.toast()` efímero al editar, sin registro persistente que
otros usuarios (o el mismo usuario en otra sesión) pudieran ver en el
centro de notificaciones.

Corregido: `editLesson()` y `editCourse()` en `modules/academia.js` ahora
además de guardar el cambio, empujan una notificación real vía
`CX.notif.push()` (`academia_leccion`/`academia_curso`) — visible en el
Tablón/centro de notificaciones, sin afirmar envío por WhatsApp/correo
(eso sigue pendiente de proveedor real).

## Resto de OLA3 (checklist por módulo completo de 13 puntos, rutas por rol
comprobadas end-to-end) y todo el backlog restante de OLA1/OLA2: sigue
NO_ATENDIDO, sin cambios respecto a V121.

## Gate técnico
- Sintaxis: PASS. Smoke 48×3: sin error. Manifest V122 regenerado, 0 diffs.

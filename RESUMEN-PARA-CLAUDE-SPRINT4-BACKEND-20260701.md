# RESUMEN-PARA-CLAUDE-SPRINT4-BACKEND-20260701.md

Fecha: 2026-07-01

## Estado backend relevante para Claude

Sprint 3 quedo cerrado: reglas Firestore DEV publicadas y smoke de acciones operativas completado en modo write-log-only. No se mutaron visitas, postulaciones, cuestionarios ni liquidaciones.

Sprint 4 queda preparado para validar la primera accion operativa concreta del backend: solicitud de asignacion de visita (`assignVisit`).

## Regla para Claude

Claude no debe tocar backend, reglas, Firebase, scripts ni archivos protegidos. Claude debe trabajar solo prototipo/UX/modulos cuando se le entregue un nuevo ZIP.

## Lo que NO debe cambiar el prototipo

- No conectar botones reales a acciones finales todavia.
- No mutar visitas desde UI.
- No mutar postulaciones desde UI.
- No mutar cuestionarios desde UI.
- No mutar liquidaciones desde UI.
- No sobrescribir archivos `app/core/backend*.js`.
- No sobrescribir `app/index-backend-dev.html`.
- No modificar `firestore.rules`.
- No reintroducir `modules/rutas.js` cargado desde `app/index.html`.
- No reintroducir `modules/aprendizaje.js` huerfano.

## Lo que Claude debe respetar del backend

- Sprint 4 usa solo datos ficticios de control.
- La accion preparada es `assignVisit`.
- El smoke Sprint 4 solo escribe logs/control/auditoria.
- La UI todavia no debe activar acciones finales.
- Cualquier necesidad visual debe documentarse como pendiente de prototipo, no resolverse tocando backend.

## Pendiente para Claude si trabaja una nueva version visual

Cuando Claude entregue un nuevo ZIP, debe mantener la separacion Proyecto / Periodo / Pais / Historico y no mezclar meses como proyectos. Debe conservar que el proyecto sea programa/campana y el periodo sea selector separado.

## Metodo de aplicacion

Cada nuevo ZIP de Claude se tratara como mini-release: auditar, proteger backend, aplicar solo si no toca archivos protegidos y documentar cambios/pending/regresiones.
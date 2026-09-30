# SPRINT-6-PUENTE-UI-BACKEND-SEGURO-20260701.md

Fecha: 2026-07-01

## Objetivo

Preparar un puente seguro entre UI y backend para acciones operativas, sin conectar botones reales del prototipo y sin tocar `app/modules`.

## Base validada

- Sprint 3: reglas Firestore DEV y smoke control/log completados.
- Sprint 4: `requestAssignVisit` validado como solicitud/control/log.
- Sprint 5: primera mutacion DEV real reversible validada solo sobre visita ficticia controlada.

## Archivo backend preparado

- `app/core/backend-ui-action-bridge.js`.

## Alcance del puente

El puente expone una capa backend para planificar acciones desde la UI futura, pero no conecta botones ni intercepta modulos.

Por defecto:

- No muta datos.
- No conecta UI.
- No toca `app/modules`.
- No ejecuta acciones sin feature flag y token DEV.

## Feature flag requerido

Para ejecutar acciones desde el puente, deben cumplirse todas estas condiciones:

- `CX.BACKEND.enabled === true`.
- `CX.BACKEND.previewMode === true`.
- `CX.BACKEND.enableUiActionBridge === true`.
- Token DEV exacto: `YES_PAULA_SPRINT6_UI_ACTION_BRIDGE_DEV`.

## Estado actual

Sprint 6 queda preparado a nivel de backend, pero el archivo todavia no debe considerarse integrado a botones reales de UI.

## Prohibiciones

- No activar botones reales.
- No modificar `app/modules`.
- No publicar Hosting.
- No tocar produccion.
- No mutar datos reales.
- No mezclar Orbit u Orbia.

## Siguiente gate

Validar carga del puente en preview backend DEV y comprobar que opera en modo dry-run por defecto. Luego, si se autoriza, cargarlo en `app/index-backend-dev.html` o mantenerlo disponible para una prueba local controlada.
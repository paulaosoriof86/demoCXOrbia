# SPRINT-7-VALIDACION-DRY-RUN-PUENTE-UI-BACKEND-20260701.md

Fecha: 2026-07-01

## Objetivo

Validar que el puente Sprint 6 cargado en preview backend DEV responde correctamente en modo dry-run, sin mutar datos y sin conectar botones reales.

## Base validada

- Sprint 6 integro `app/core/backend-ui-action-bridge.js` solo en `app/index-backend-dev.html`.
- El puente no se cargo en `app/index.html` normal.
- No se tocaron `app/modules`.
- No se conectaron botones reales.
- No se ejecutaron mutaciones.

## Validacion Sprint 7

La prueba debe comprobar:

1. `app/core/backend-ui-action-bridge.js` existe.
2. `node --check` pasa.
3. `app/index-backend-dev.html` carga el bridge exactamente una vez.
4. `app/index.html` normal no carga el bridge.
5. El bridge expone `CX.backendUiActionBridge.status()`.
6. El bridge expone `CX.backendUiActionBridge.planAction()`.
7. `status()` devuelve `loaded: true`, `uiConnected: false` y `mutatesByDefault: false`.
8. `planAction()` sin feature flag devuelve dry-run y no ejecuta acciones.

## Prohibiciones

- No publicar Hosting.
- No tocar produccion.
- No mutar Firestore.
- No pedir credenciales.
- No tocar `app/modules`.
- No conectar botones reales.
- No mezclar Orbit u Orbia.

## Criterio de cierre

Sprint 7 queda cerrado cuando el dry-run confirma que el puente esta cargado y responde sin mutaciones ni conexion UI real.

## Pendiente para Claude

Claude debe continuar tratando cualquier boton de accion como estado visual o mock, no como accion real conectada.
# Sprint 3 - Acciones operativas controladas y responsibilityLog

Fecha: 2026-07-01
Repo: paulaosoriof86/demoCXOrbia
Rama: release/cxorbia-tya-rc-20260630
Alcance: preparar backend DEV para escrituras trazables sin tocar UI ni activar acciones finales.

## Objetivo

Preparar una capa de acciones operativas controladas que registre solicitudes con trazabilidad antes de habilitar cualquier mutacion final en visitas, postulaciones, cuestionarios o liquidaciones.

## Regla de seguridad

Las acciones de Sprint 3 no modifican entidades operativas finales.

El primer nivel solo registra:

- operationActionLocks
- operationActions
- operationEvents
- entityAuditTrail
- projects/{projectId}/responsibilityLog

## Acciones candidatas preparadas

- Solicitar asignacion de visita.
- Solicitar reprogramacion de visita.
- Solicitar marcar visita realizada.
- Solicitar marcar cuestionario completado.
- Solicitar marcar submitido/validado.
- Solicitar cambio de estado de postulacion/aplicacion.
- Consultar responsibilityLog por proyecto y entidad.

## Archivos tocados

- app/core/backend-operational-actions.js
- firestore.rules
- firebase/client-write-tools/smoke-cxorbia-sprint3-operation-actions-dev.mjs

## Lo que NO se hizo

- No se tocaron app/modules.
- No se modifico app/index.html.
- No se activo backend global.
- No se hizo deploy.
- No se publico Hosting.
- No se escribieron datos reales.
- No se mezclo Orbit ni Orbia.

## Gates antes de activar acciones finales

1. Validar sintaxis JS del adapter Sprint 3.
2. Validar reglas Firestore localmente o por publicacion DEV autorizada.
3. Ejecutar smoke Sprint 3 con usuario DEV ficticio.
4. Confirmar que se escriben solo logs y no entidades finales.
5. Documentar resultado.
6. Solo despues, preparar mutaciones reales DEV por accion, una por una.

## Smoke preparado

Script:

```text
firebase/client-write-tools/smoke-cxorbia-sprint3-operation-actions-dev.mjs
```

Autorizacion requerida por variable de entorno:

```text
CXORBIA_SMOKE_SPRINT3_ACTIONS=YES_PAULA_SMOKE_SPRINT3_OPERATION_ACTIONS_DEV
```

El smoke no imprime secretos y falla si falta CXORBIA_DEV_PASSWORD.

## Pendiente inmediato

Publicar reglas Firestore Sprint 3 en DEV solo con autorizacion explicita de Paula y ejecutar el smoke.

Hasta entonces, Sprint 3 esta preparado en GitHub pero no validado contra Firestore DEV publicado.

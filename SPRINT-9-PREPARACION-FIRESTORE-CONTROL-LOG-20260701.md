# SPRINT-9-PREPARACION-FIRESTORE-CONTROL-LOG-20260701.md

Fecha: 2026-07-01

## Objetivo

Preparar el siguiente gate para validar la ruta del puente UI/backend contra Firebase DEV real, escribiendo solo documentos de control y auditoria.

## Base validada

- Sprint 7 valido dry-run sin credenciales ni Firestore.
- Sprint 8 valido feature flag con adaptador stub local.

## Alcance permitido para Sprint 9

- Firebase DEV: cxorbia-backend-dev.
- Tenant: tya.
- Proyecto: cinepolis-abril-26.
- Entidad ficticia: sprint9-ui-bridge-control-log-no-real-data.
- Accion: assignVisit como solicitud control/log.

## Colecciones permitidas

- operationActionLocks.
- operationActions.
- operationEvents.
- entityAuditTrail.
- responsibilityLog del proyecto.

## Prohibiciones

- No mutar visitas reales.
- No mutar postulaciones.
- No mutar cuestionarios.
- No mutar liquidaciones.
- No tocar app/modules.
- No conectar botones reales.
- No publicar Hosting.
- No tocar produccion.
- No mezclar Orbit u Orbia.

## Requisito de autorizacion

Sprint 9 no debe ejecutarse sin autorizacion explicita de Paula porque escribe en Firestore DEV.

## Criterio de cierre

Sprint 9 queda cerrado si la ruta con feature flag escribe solo control/log, confirma que no hubo mutacion operativa real y documenta resultado para backend y Claude.
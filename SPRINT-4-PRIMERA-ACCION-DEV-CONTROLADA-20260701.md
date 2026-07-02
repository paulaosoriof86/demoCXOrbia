# SPRINT-4-PRIMERA-ACCION-DEV-CONTROLADA-20260701.md

Fecha: 2026-07-01

## Objetivo

Preparar el primer gate Sprint 4 para validar una accion operativa DEV controlada sin conectar botones de UI y sin mutar entidades operativas finales.

## Base validada

Sprint 3 quedo cerrado con:

- Firestore rules DEV publicadas en `cxorbia-backend-dev`.
- Smoke Sprint 3 completado en modo `write-log-only`.
- 5 documentos de control/log creados y leidos.
- Sin mutar visitas, postulaciones, cuestionarios ni liquidaciones.
- Sin Hosting, sin produccion, sin Orbit y sin Orbia.

## Accion elegida para Sprint 4

Primera accion: solicitud controlada de asignacion de visita.

Wrapper relacionado en backend:

- `CX.backendOperationalActions.requestAssignVisit(input)`.

Tipo de accion registrada:

- `assignVisit`.

Entidad:

- `visit`.

## Alcance exacto del smoke Sprint 4

El smoke Sprint 4 debe escribir solo documentos de solicitud/control/auditoria para una visita ficticia de prueba:

- `operationActionLocks`.
- `operationActions`.
- `operationEvents`.
- `entityAuditTrail`.
- `projects/{projectId}/responsibilityLog`.

El smoke no debe escribir ni actualizar:

- `visits`.
- `applications` / postulaciones.
- `questionnaires`.
- `liquidations`.
- `shoppers`.
- `projects`.

## Datos ficticios permitidos

- Tenant: `tya`.
- Proyecto CXOrbia: `cinepolis-abril-26`.
- Visit ID ficticio: `sprint4-visit-no-real-data`.
- Shopper ID ficticio: `sprint4-shopper-no-real-data`.
- Fecha ficticia: `2099-01-01`.

## Gate de seguridad

El smoke debe requerir autorizacion por variable de entorno:

`CXORBIA_SMOKE_SPRINT4_ASSIGN=YES_PAULA_SMOKE_SPRINT4_ASSIGN_DEV`

Tambien debe usar credencial DEV local ignorada o variable local. La credencial no debe imprimirse ni pegarse en ChatGPT.

## Resultado esperado

- Auth DEV OK.
- Proyecto base legible.
- 5 documentos de control/log creados y leidos.
- `actionType = assignVisit`.
- `entityType = visit`.
- `entityId = sprint4-visit-no-real-data`.
- `mutatesOperationalEntity = false`.
- `secretPrinted = false`.

## Criterio de cierre

Sprint 4 solo queda cerrado cuando:

1. El smoke Sprint 4 devuelva `ok: true`.
2. Cree exactamente 5 documentos de control/log.
3. No mute entidades operativas finales.
4. Se documente el resultado real.
5. No se modifiquen `app/modules`.

## Siguiente paso posterior

Si Sprint 4 se valida, el siguiente gate puede preparar una mutacion DEV real reversible sobre un documento ficticio de `visits`, todavia sin UI y con autorizacion separada.

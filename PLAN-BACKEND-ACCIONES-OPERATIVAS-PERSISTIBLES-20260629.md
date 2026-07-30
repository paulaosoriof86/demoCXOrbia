# PLAN-BACKEND-ACCIONES-OPERATIVAS-PERSISTIBLES-20260629

## Objetivo

Convertir las acciones operativas del prototipo en comandos persistibles, auditables e idempotentes.

## Pendiente relacionado

#185 — acciones operativas persistibles.

## Problema

En el prototipo muchas acciones ya existen visualmente, pero algunas siguen operando como mutación local, store local o mensaje de éxito. Para producción, las acciones críticas deben pasar por una interfaz central.

## Acciones mínimas a centralizar

- aprobar postulación;
- rechazar postulación;
- asignar visita;
- solicitar cambio de agenda;
- aprobar reprogramación;
- cancelar visita;
- marcar visita realizada;
- marcar cuestionario realizado;
- marcar submit;
- crear lote de pago;
- marcar pago realizado;
- asignar responsable;
- resolver asignación;
- cambiar estado de soporte;
- exportar reporte.

## Colecciones backend propuestas

```text
tenants/{tenantId}/operationActions/{actionId}
tenants/{tenantId}/operationActionLocks/{idempotencyKey}
tenants/{tenantId}/operationEvents/{eventId}
tenants/{tenantId}/entityAuditTrail/{auditId}
```

## Contrato creado

```text
firebase/contracts/cx-data-operational-actions-contract-v1.json
```

## Método central esperado

```text
CX.data.performOperationAction(actionType, entityType, entityId, payload, options)
```

## Reglas

- Una acción crítica no debe modificar el dato directamente desde el módulo.
- Debe generar actionId.
- Debe generar idempotencyKey para evitar doble clic o duplicados.
- Debe crear evento operativo.
- Debe crear auditoría de entidad.
- Debe validar rol, país, proyecto y tenant.
- Debe devolver estado claro: queued, applied, skipped o failed.

## Módulos que deben migrar a este contrato cuando se autorice frontend

```text
postulaciones
visitas
misvisitas
finanzas
soporte
midia
operacion-extra/reportes
```

## Reportes Excel

Exportar reporte en Excel real también debe entrar como acción auditable cuando se requiera trazabilidad:

```text
actionType = exportReport
entityType = report
entityId = reportId
payload.format = xlsx
```

## Restricciones actuales

- No escribir Firestore todavía.
- No modificar frontend.
- No publicar reglas.
- No usar en producción.
- No activar adapter global.

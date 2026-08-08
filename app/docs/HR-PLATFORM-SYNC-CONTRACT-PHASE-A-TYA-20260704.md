# HR platform sync contract Phase A TyA

Fecha: 2026-07-04

## Proposito

Definir el contrato de sincronizacion entre HR y plataforma para asignaciones reales sin duplicaciones.

## Flujos requeridos

### Flujo A - Asignacion desde plataforma

1. Admin asigna shopper en plataforma.
2. Plataforma registra asignacion con `assignmentSource=platform`.
3. Make actualiza HR.
4. Plataforma marca visita como no disponible.
5. Si HR devuelve la misma asignacion, se reconoce como ya sincronizada.

### Flujo B - Asignacion desde HR

1. Admin asigna shopper directamente en HR.
2. Make o proceso de lectura detecta cambio.
3. Plataforma registra asignacion con `assignmentSource=hr`.
4. Plataforma retira visita de disponibles.
5. Si la plataforma ya tenia la asignacion equivalente, no duplica.

## Campos minimos de sincronizacion

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `shopperName`
- `assignmentSource`
- `assignmentSyncStatus`
- `assignedAt`
- `lastSyncedAt`
- `syncConflict`

## Estados propuestos

- `available`
- `assigned_platform_pending_hr`
- `assigned_platform_synced_hr`
- `assigned_hr_detected`
- `assigned_conflict_review`
- `cancelled_or_reopened`

## Reglas anti-duplicacion

- Si coincide `projectId + hrRowId + shopperId`, es la misma asignacion.
- Si coincide `projectId + visitId + shopperId`, es probablemente la misma asignacion y debe validarse contra HR.
- Si cambia shopper para la misma visita, no sobrescribir: enviar a conflicto.
- Si HR confirma una asignacion originada por plataforma, actualizar estado a sincronizado.
- Si HR asigna una visita disponible, retirarla de disponibles en plataforma.

## Conflictos

Enviar a revision cuando:

- La misma visita tiene dos shoppers diferentes.
- HR y plataforma tienen fechas incompatibles.
- La fila HR no tiene identificador suficiente.
- El shopper no existe en plataforma.
- La asignacion afecta un proyecto diferente.

## Alcance Phase A

Debe operar para Cinépolis y para nuevos proyectos TyA usando `projectId`.

## Estado

- Contrato documental.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.

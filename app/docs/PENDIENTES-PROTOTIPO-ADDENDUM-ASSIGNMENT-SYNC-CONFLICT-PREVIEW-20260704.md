# Pendientes prototipo addendum - Assignment sync conflict preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para assignment sync/conflicts. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes Postulaciones

1. No mostrar `HR sincronizada` si Make/HR sync esta apagado.
2. Al aprobar postulacion, mostrar `asignacion preparada` o `pendiente de sincronizacion HR`.
3. Si existe asignacion HR conflictiva, mostrar `requiere revision` y no aprobar automaticamente.
4. Mostrar origen de asignacion de forma clara.
5. No deduplicar por nombre visible, sucursal, ciudad o fecha.

## Pendientes Bandeja de asignaciones

1. Mostrar origen:
   - plataforma/postulacion;
   - manual admin;
   - detectada HR;
   - historico preview;
   - revision manual.
2. Mostrar estado:
   - pendiente HR sync;
   - detectada desde HR;
   - ya reflejada/no duplicar;
   - conflicto;
   - revision manual;
   - cancelada.
3. Mostrar conflicto cuando difieren shopper, proyecto, tenant, HR row o llave estable.
4. No sobrescribir asignaciones sin decision admin.

## Pendientes Disponibilidad de visitas

1. Una visita asignada desde plataforma debe salir de disponibles en preview.
2. Una visita asignada desde HR debe salir de disponibles cuando se detecta.
3. Si HR refleja la misma asignacion, no duplicar.
4. Si hay conflicto, bloquear como requiere revision.

## Pendientes textos honestos

Usar:

- pendiente HR sync;
- preparado;
- preview;
- requiere revision;
- conflicto;
- pendiente backend.

No usar:

- HR sincronizada;
- Make ejecutado;
- sincronizado real;
- asignacion final real si el gate esta apagado.

## Pendientes Academia

1. Curso Ops: postulacion a asignacion.
2. Curso Admin: conflictos HR/plataforma.
3. Curso Shopper: postulacion aprobada/asignacion pendiente.
4. Manual HR Source: reflejo de asignaciones.
5. Checklist antes de aprobar postulacion.
6. Checklist antes de aceptar asignacion detectada en HR.
7. Checklist antes de resolver conflicto.
8. Glosario de assignment sync.

## No corresponde a Claude

- Implementar validator backend.
- Activar Make real.
- Escribir HR.
- Escribir Firestore.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: Postulaciones y disponibilidad de visitas con estados honestos y sin duplicados.

P1: Bandeja de asignaciones y conflictos.

P2: Academia profunda y glosario/checklists.

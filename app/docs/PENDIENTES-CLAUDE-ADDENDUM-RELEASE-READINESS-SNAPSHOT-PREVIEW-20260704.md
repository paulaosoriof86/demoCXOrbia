# Pendientes Claude addendum - Release readiness snapshot preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para release/readiness snapshot. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes readiness UI

1. Mostrar dashboard de readiness por area.
2. Mostrar preview ready, ready for review, missing input, sensitive data blocked, real gate off, prototype pending, manual review y conflict review.
3. No decir production ready si los gates estan apagados.
4. No decir deployed, imported, connected, sent o synced sin gates activos.
5. Mostrar snapshotId, baselineRef, branch/PR, periodo y validatorId.
6. Mostrar blockingReason y manualReviewReason.
7. Separar prototype pending, backend pending y source/data pending.

## Pendientes Academia

1. Curso Admin: release readiness.
2. Curso Superadmin: release governance.
3. Curso Ops: impacto de readiness en operacion.
4. Curso Finanzas: readiness de liquidaciones/pagos/datos sensibles.
5. Manual release readiness.
6. Manual gate statuses.
7. Manual preview vs production.
8. Manual blockers/missing input.
9. Checklist antes de marcar area ready.
10. Checklist antes de pedir activacion real futura.
11. Glosario de release readiness.

## Prioridad

P0: no confundir preview-ready con production-ready y no prometer conexion/produccion.

P1: dashboard de readiness con blockers y gates.

P2: Academia profunda con manuales, checklists y glosario.

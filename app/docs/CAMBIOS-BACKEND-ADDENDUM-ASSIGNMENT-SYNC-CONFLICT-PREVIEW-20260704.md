# Cambios backend addendum - Assignment sync conflict preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de assignment sync/conflicts usando la politica de datos sensibles como gate transversal.

## Archivos creados

1. `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato de preview para comparar asignaciones plataforma y HR con llaves estables, sin writes y sin Make.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de assignment sync/conflicts.

2. `tools/migration/tya-assignment-sync-conflict-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con `platformAssignments` y `hrAssignments`.
   - Por que: permite clasificar pending HR sync, HR detected, no duplicate, conflict review y manual review sin datos reales.

3. `app/docs/ASSIGNMENT-SYNC-CONFLICT-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-ASSIGNMENT-SYNC-CONFLICT-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists, glosario y notificaciones para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin datos sensibles.

## Phase A que avanza

- Plataforma -> HR: asignacion queda preparada y pendiente de sync si Make esta apagado.
- HR -> Plataforma: asignacion detectada queda como HR-detected si no existe equivalente.
- Coincidencia plataforma/HR: no duplica si las llaves estables coinciden.
- Conflicto: shopper/proyecto/tenant/HR row diferente queda en `conflict_review_required`.
- Ambiguedad: falta de visitId/hrRowId/sourceVisitRef o shopperId queda en `manual_review_required`.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para probar escenarios.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de visit lifecycle/reservas.
4. Preparar Make payload draft sin activar.

## Pendientes prototipo/Claude derivados

1. Postulaciones no debe mostrar `HR sincronizada` mientras gate este apagado.
2. UI debe mostrar `pendiente HR sync`, `preview`, `requiere revision`, `conflicto` o `pendiente backend`.
3. Las visitas asignadas por plataforma o HR preview deben salir de disponibles sin duplicarse.
4. Conflictos deben mostrarse para revision, no resolverse automaticamente.
5. No exponer datos sensibles en referencias de asignacion.

## Impacto Academia

Se creo documento especifico de Academia para postulaciones/asignaciones, HR Source, conflictos, checklists y glosario de assignment sync.

## Siguiente bloque recomendado

Preview validator de visit lifecycle/reservas usando la misma politica de datos sensibles y los outcomes de assignment sync.

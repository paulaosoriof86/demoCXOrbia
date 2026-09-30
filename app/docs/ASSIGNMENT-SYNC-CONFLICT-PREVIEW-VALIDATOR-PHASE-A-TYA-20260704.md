# Assignment sync conflict preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el siguiente bloque largo backend del tracker: preview validator de assignment sync/conflicts usando la politica de datos sensibles como gate transversal.

Este bloque permite validar, con datos sinteticos o sanitizados, como se comportaria la sincronizacion plataforma ↔ HR para postulaciones/asignaciones sin escribir Firestore, sin escribir HR, sin llamar Make y sin usar datos sensibles.

## Archivos creados

- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `tools/migration/tya-assignment-sync-conflict-preview-validator.mjs`

## Dependencias documentales

Este bloque depende de:

- `app/contracts/assignment-sync-phase-a.tya.contract.json`
- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-phase-a.tya.contract.json`
- `app/contracts/visit-reservation-window-phase-a.tya.contract.json`

## Que valida

El validador revisa:

1. Que todos los gates sigan apagados:
   - runtime;
   - produccion;
   - Firestore writes;
   - HR writes;
   - Make writes;
   - import real.
2. Que exista politica de datos sensibles activa como gate.
3. Que el input opcional sea source-safe:
   - `sourceSafe=true`;
   - `containsRawSensitiveData=false`;
   - `isSyntheticOrSanitized=true`.
4. Que no existan nombres de campos sensibles en el preview.
5. Que plataforma y HR solo se comparen usando llaves estables.
6. Que no haya deduplicacion visual por nombre de sucursal, fecha, shopper display name, ciudad o coincidencia aparente.
7. Que los conflictos se clasifiquen para revision y no se sobrescriban silenciosamente.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "platformAssignments": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "shopperId": "shopper_ref_001",
      "assignmentId": "assignment_ref_001",
      "assignmentSource": "platform_postulation",
      "assignmentSyncStatus": "pending_make_sync"
    }
  ],
  "hrAssignments": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "shopperId": "shopper_ref_001",
      "assignmentId": "hr_assignment_ref_001",
      "assignmentSource": "hr_detected",
      "assignmentSyncStatus": "synced_from_hr"
    }
  ],
  "postulations": []
}
```

## Uso futuro local seguro

Sin input:

```bash
node tools/migration/tya-assignment-sync-conflict-preview-validator.mjs
```

Con input sintetico/sanitizado:

```bash
node tools/migration/tya-assignment-sync-conflict-preview-validator.mjs --input path/to/assignment-sync-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos y avisa que no mapeo filas.

## Outcomes de preview

El validador puede clasificar:

- `platform_pending_hr_sync`: la plataforma asigno, HR aun no refleja.
- `hr_detected_new_assignment`: HR trae asignacion no vista en plataforma.
- `already_reflected_no_duplicate`: plataforma y HR coinciden por llaves estables; no duplicar.
- `conflict_review_required`: HR y plataforma difieren en shopper, tenant, proyecto, HR row u otra llave critica.
- `manual_review_required`: faltan llaves estables.
- `cancelled_or_unassignable`: visita/asignacion cancelada o no asignable.

## Reglas clave

1. Plataforma -> HR:
   - aprobacion/postulacion genera asignacion preparada;
   - visita sale de disponibles en preview;
   - HR sync queda pendiente si Make esta apagado;
   - si HR luego refleja lo mismo, no se duplica.

2. HR -> Plataforma:
   - si HR detecta asignacion con llave estable nueva, se marca como `hr_detected_new_assignment`;
   - visita sale de disponibles;
   - no se crea duplicado si ya existia reflejo plataforma.

3. Conflictos:
   - si HR y plataforma no coinciden, queda `conflict_review_required`;
   - no se sobrescribe silently;
   - no se decide por coincidencia visual.

4. Datos sensibles:
   - no se permiten campos de banco, DPI/documentos, telefono crudo, WhatsApp crudo, direccion, NDA, adjuntos o cuerpos crudos;
   - si aparecen, el validador devuelve `review_required`.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de assignment sync para probar escenarios.
2. Integrar este validator a la secuencia local segura cuando haya runner consolidado.
3. Crear preview validator de visit lifecycle/reservas usando la misma politica de datos sensibles.
4. Preparar Make payload draft sin activar cuando el flujo de asignaciones este estable.

## Pendientes prototipo / Claude derivados

1. En Postulaciones, no usar `HR sincronizada` mientras Make/HR sync este apagado.
2. Mostrar `pendiente HR sync`, `preview`, `requiere revision`, `conflicto` o `pendiente backend`.
3. En bandejas de postulacion/asignacion, mostrar conflictos sin resolverlos automaticamente.
4. Al asignar desde plataforma o detectar HR, la visita debe dejar de aparecer como disponible sin duplicar.
5. Mostrar referencias seguras/opacas para revision admin, no datos sensibles.

## Impacto Academia

Academia debe crear/profundizar:

- curso Ops: flujo de postulacion a asignacion;
- curso Admin: revision de conflictos HR/plataforma;
- curso Shopper: que significa postulacion aprobada/asignacion pendiente;
- manual HR Source: como se reflejan asignaciones;
- checklist antes de aprobar postulacion;
- checklist antes de aceptar asignacion detectada en HR;
- checklist antes de resolver conflicto;
- glosario: `platform_pending_hr_sync`, `hr_detected_new_assignment`, `already_reflected_no_duplicate`, `conflict_review_required`, `manual_review_required`, `sourceVisitRef`.

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

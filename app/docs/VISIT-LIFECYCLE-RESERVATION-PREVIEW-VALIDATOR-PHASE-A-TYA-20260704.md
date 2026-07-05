# Visit lifecycle reservation preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend recomendado despues de assignment sync/conflicts: preview validator de visit lifecycle/reservas usando la politica de datos sensibles y los outcomes de assignment sync como gates previos.

Este bloque permite validar, con datos sinteticos o sanitizados, agenda, reprogramacion, cancelacion, visita realizada y cuestionario completado sin escribir Firestore, sin escribir HR, sin llamar Make y sin usar datos sensibles.

## Archivos creados

- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs`

## Dependencias documentales

Este bloque depende de:

- `app/contracts/visit-lifecycle-phase-a.tya.contract.json`
- `app/contracts/visit-reservation-window-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`

## Que valida

El validador revisa:

1. Gates apagados:
   - runtime;
   - produccion;
   - Firestore writes;
   - HR writes;
   - Make writes;
   - Storage writes;
   - import real.
2. Que exista politica de datos sensibles como gate.
3. Que exista assignment sync/conflicts como gate previo.
4. Que el input opcional sea source-safe:
   - `sourceSafe=true`;
   - `containsRawSensitiveData=false`;
   - `isSyntheticOrSanitized=true`.
5. Que no existan nombres de campos sensibles.
6. Que reservas/agenda usen llaves estables.
7. Que `availableFrom`, franja y quincena se respeten.
8. Que visita realizada y cuestionario completado no tengan fechas futuras.
9. Que cuestionario completado no sea anterior a visita realizada.
10. Que cuestionario completado no se trate como submitido ni pago.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "visits": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "sourceVisitRef": "source_visit_ref_001",
      "assignmentId": "assignment_ref_001",
      "shopperId": "shopper_ref_001",
      "actionType": "schedule_visit",
      "availableFrom": "2026-06-16",
      "franja": "WK",
      "quincena": "Q2",
      "scheduledAt": "2026-06-18",
      "assignmentSyncOutcome": "platform_pending_hr_sync"
    }
  ]
}
```

## Uso futuro local seguro

Sin input:

```bash
node tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs
```

Con input sintetico/sanitizado:

```bash
node tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs --input path/to/visit-lifecycle-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos y avisa que no mapeo filas.

## Action types

- `reserve_from_postulation`
- `schedule_visit`
- `request_reschedule`
- `approve_reschedule`
- `cancel_visit`
- `mark_performed`
- `mark_questionnaire_completed`
- `release_reservation`

## Outcomes de preview

- `reservation_ready`: la visita queda reservada/preparada en preview.
- `schedule_valid`: la agenda respeta reglas.
- `reschedule_valid`: la reprogramacion respeta reglas.
- `released_to_available`: reserva liberada segun reglas.
- `cancelled_or_unassignable`: visita cancelada/no asignable.
- `performed_pending_questionnaire`: visita realizada, pendiente de cuestionario.
- `questionnaire_completed_pending_review`: cuestionario completado, pendiente de revision.
- `assignment_conflict_blocks_schedule`: conflicto de asignacion bloquea agenda.
- `manual_review_required`: faltan llaves o datos minimos.
- `conflict_review_required`: regla de fecha/franja/quincena/estado requiere revision.

## Reglas clave

### Reservas

- Una reserva sostiene la visita en preview.
- Una reserva no significa HR sincronizada.
- Una reserva activa evita que la visita siga visible como disponible duplicada.
- Una reserva expirada o liberada solo vuelve a disponibilidad si reglas del proyecto lo permiten.

### Agenda y reprogramacion

- `scheduledAt`, `proposedDate` o `rescheduledAt` deben respetar `availableFrom`.
- WK debe ser lunes-viernes salvo override aprobado.
- WKND debe ser sabado-domingo salvo override aprobado.
- Q1 debe caer del dia 1 al 15.
- Q2 debe caer del dia 16 al final del mes.
- Fuera de rango requiere override con `authorizedBy` y `authorizedReason`.

### Visita realizada

- `performedAt` no puede estar en futuro.
- Visita realizada no equivale a cuestionario completado.
- Visita realizada no equivale a liquidacion ni pago.

### Cuestionario completado

- `questionnaireCompletedAt` no puede estar en futuro.
- No puede ser anterior a `performedAt` sin conflicto.
- Cuestionario completado no es submitido.
- Cuestionario completado no habilita pago automaticamente.

### Assignment sync como gate previo

- `conflict_review_required` o `manual_review_required` en assignment sync bloquean agenda.
- `already_reflected_no_duplicate` puede continuar si agenda es valida.
- `platform_pending_hr_sync` puede continuar solo como preview/pendiente HR sync.
- `hr_detected_new_assignment` puede continuar si hay llaves estables y shopper.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado con escenarios de agenda, reprogramacion, cancelacion, visita realizada y cuestionario completado.
2. Integrar este validator en una secuencia local segura cuando exista runner consolidado.
3. Crear preview validator de ficha postulacion dinamica.
4. Conectar future Make payload draft para agenda/reprogramacion sin activar.
5. Relacionar estados de ciclo de visita con liquidaciones sin tratar cuestionario como submitido.

## Pendientes prototipo / Claude derivados

1. En Mis visitas, no decir que agenda/reprogramacion sincroniza HR si Make esta apagado.
2. Mostrar reserva como `preparada`, `pendiente HR sync` o `preview`, no como sincronizada.
3. Mostrar fuera de rango con regla fallida: disponible desde, franja, quincena o proyecto.
4. Pedir override/justificacion cuando admin autoriza fuera de rango.
5. Separar claramente realizada, cuestionario completado, revision, submitido, liquidacion y pago.
6. Evitar que visita reservada/asignada siga apareciendo disponible duplicada.

## Impacto Academia

Academia debe crear/profundizar:

- curso Shopper: agendar, reprogramar, cancelar, marcar realizada y completar cuestionario;
- curso Ops: seguimiento de agenda y fuera de rango;
- curso Admin: autorizaciones fuera de ventana;
- manual de reservas;
- manual de availableFrom/franja/quincena;
- checklist antes de confirmar agenda;
- checklist antes de aprobar override;
- checklist antes de marcar realizada;
- checklist antes de marcar cuestionario completado;
- glosario: reservation_ready, schedule_valid, outside_franja, outside_quincena, performed_pending_questionnaire, questionnaire_completed_pending_review.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin HR writes.
- Sin Make real.
- Sin Gemini real.
- Sin correo real.
- Sin datos sensibles.

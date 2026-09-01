# Resumen para Claude addendum - Visit lifecycle reservation preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo un preview validator de ciclo de visita y reservas usando como dependencias la politica de datos sensibles, assignment sync/conflicts, visit lifecycle y reservas/franja/quincena.

Archivos agregados:

- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs`
- `app/docs/VISIT-LIFECYCLE-RESERVATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-VISIT-LIFECYCLE-RESERVATION-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-VISIT-LIFECYCLE-RESERVATION-PREVIEW-20260704.md`

No se activo runtime ni integraciones reales.

## Reglas que debe reflejar el prototipo

1. Reserva sostiene la visita en preview.
2. Reserva no significa HR sincronizada.
3. Agenda y reprogramacion deben respetar `availableFrom`, franja y quincena.
4. Fuera de rango debe pedir revision u override.
5. Visita realizada, cuestionario completado, revision, submitido, liquidacion y pago son etapas separadas.
6. Conflicto de assignment sync bloquea agenda.
7. Visita reservada/asignada no debe seguir disponible duplicada.

## Pendientes frontend concretos

### Mis visitas

- No decir que agenda/reprogramacion sincroniza HR si gate esta apagado.
- Mostrar reserva como preparada, preview o pendiente HR sync.
- Mostrar fuera de rango con regla fallida.
- Separar claramente cada etapa operativa.

### Postulaciones / agenda

- Validar fecha propuesta contra availableFrom, franja y quincena.
- Si falla, mostrar razon y pedir revision/override.
- No dejar disponible una visita ya reservada o asignada.

### Admin / Ops

- Mostrar cola de fuera de rango.
- Mostrar autorizador y razon para override.
- Mostrar conflicto de assignment sync antes de permitir agenda.
- No resolver conflictos automaticamente.

## Academia que Claude debe actualizar

- Curso Shopper: agendar, reprogramar, cancelar, marcar realizada y completar cuestionario.
- Curso Ops: seguimiento de agenda y fuera de rango.
- Curso Admin: autorizaciones fuera de ventana.
- Manual de reservas.
- Manual availableFrom/franja/quincena.
- Checklists antes de confirmar agenda, aprobar override, marcar realizada y marcar cuestionario completado.
- Glosario: `reservation_ready`, `schedule_valid`, `outside_franja`, `outside_quincena`, `performed_pending_questionnaire`, `questionnaire_completed_pending_review`.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Make/HR/Firestore/Storage reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real ni escrituras reales.

# Academia impact - Visit lifecycle reservation preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs`
- `app/docs/VISIT-LIFECYCLE-RESERVATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir el bloque tecnico de reservas, agenda, reprogramacion, cancelacion, visita realizada y cuestionario completado en aprendizaje operativo por rol, manteniendo separadas las etapas de visita, revision, submitido, liquidacion y pago.

## Rutas por rol

### Shopper

Debe aprender:

- que significa una visita disponible;
- que significa una reserva;
- como proponer fecha;
- como agendar;
- como reprogramar;
- como cancelar o solicitar ajuste;
- que significa marcar realizada;
- que significa cuestionario completado;
- por que cuestionario completado no es submitido ni pago.

### Ops / coordinador

Debe aprender:

- como revisar agenda por franja y quincena;
- como detectar fuera de rango;
- como revisar reservas activas;
- como evitar duplicados en disponibles;
- como escalar conflicto de asignacion antes de agenda;
- como hacer seguimiento sin prometer HR sync real.

### Admin

Debe aprender:

- como aprobar o rechazar fuera de ventana;
- como registrar motivo/autorizador;
- como preservar auditoria;
- como diferenciar visita realizada, cuestionario completado, revision, submitido y pago;
- como liberar/cancelar una visita sin duplicar disponibilidad.

### Cliente / auditor externo

Debe aprender a leer estados sin operar:

- agendada;
- realizada;
- cuestionario pendiente;
- en revision;
- submitido;
- liquidacion/pago separado.

### Superadmin / consultora / aliado

Debe aprender:

- como configurar franja/quincena por proyecto;
- por que no se hard-codea Cinépolis como regla global;
- como se comportan overrides;
- como se relaciona el ciclo de visita con liquidaciones.

## Manuales a crear o actualizar

1. Manual Visit lifecycle.
2. Manual Reservas.
3. Manual Agendamiento.
4. Manual Reprogramacion.
5. Manual Cancelacion/liberacion.
6. Manual AvailableFrom/franja/quincena.
7. Manual Override fuera de ventana.
8. Manual Cuestionario completado vs submitido.
9. Manual Handoff a revision/liquidacion.

## Lecciones requeridas

### Leccion 1 - Que es una reserva

Debe explicar:

- reserva sostiene la visita;
- reserva evita duplicidad visible;
- reserva no significa HR sincronizada;
- reserva puede expirar o liberarse segun reglas.

### Leccion 2 - AvailableFrom

Debe explicar:

- la fecha minima para agendar/proponer;
- que pasa si se propone antes;
- cuando admin puede autorizar excepcion;
- por que debe quedar auditado.

### Leccion 3 - Franja WK/WKND

Debe explicar:

- WK: lunes a viernes;
- WKND: sabado/domingo;
- por proyecto puede variar;
- en Cinépolis debe venir de HR;
- fuera de franja requiere revision/override.

### Leccion 4 - Quincena Q1/Q2

Debe explicar:

- Q1: dia 1 al 15;
- Q2: dia 16 al final de mes;
- el mes/periodo viene de proyecto/HR;
- fuera de quincena requiere revision/override.

### Leccion 5 - Visita realizada

Debe explicar:

- realizada no es cuestionario;
- realizada no es submitido;
- realizada no es liquidacion;
- fecha realizada no puede ser futura;
- se debe conservar auditoria.

### Leccion 6 - Cuestionario completado

Debe explicar:

- cuestionario completado no es submitido;
- no puede ser anterior a realizada sin conflicto;
- requiere revision o submitido HR-driven antes de liquidacion;
- no habilita pago automaticamente.

### Leccion 7 - Assignment sync como gate

Debe explicar:

- conflicto de asignacion bloquea agenda;
- HR detected puede habilitar si hay llaves estables;
- platform pending HR sync debe verse como pendiente/preparado;
- no usar textos de sincronizacion real mientras Make esta apagado.

## Checklists interactivos

### Antes de reservar visita

- Existe tenant/proyecto.
- Existe visita.
- Existe shopper/asignacion o postulacion.
- No hay conflicto assignment sync.
- La visita no esta ya reservada/activa.
- No hay datos sensibles en preview.

### Antes de confirmar agenda

- Fecha no esta antes de availableFrom.
- Franja valida.
- Quincena valida.
- Proyecto permite la fecha.
- Si no cumple, existe override autorizado.
- No se promete HR sync real.

### Antes de aprobar override

- Regla fallida identificada.
- Autorizador registrado.
- Motivo registrado.
- Scope del override registrado.
- Impacto shopper definido.
- No se penaliza automaticamente sin reglas aprobadas.

### Antes de marcar realizada

- Fecha no futura.
- La visita esta asignada/agendada.
- No hay conflicto pendiente.
- Se conserva auditoria.

### Antes de marcar cuestionario completado

- Fecha no futura.
- No es anterior a realizada.
- Se entiende que no es submitido.
- Se envia a revision/submitido segun proyecto.

## Glosario requerido

- available
- reservation_ready
- reserved_pending_schedule
- scheduled_confirmed
- reschedule_requested
- released_to_available
- availableFrom
- franja
- WK
- WKND
- quincena
- Q1
- Q2
- outside_franja
- outside_quincena
- override_required
- override_approved
- performed_pending_questionnaire
- questionnaire_completed_pending_review
- submitido_registered
- liquidation_candidate

## Notificaciones Academia

Cuando este flujo pase a UI, Academia debe notificar:

- curso nuevo de agenda y reservas;
- manual actualizado de franja/quincena;
- checklist nuevo de override;
- checklist nuevo de realizada/cuestionario;
- glosario actualizado;
- contenido pendiente de revision humana si IA/Gemini ayuda a redactar.

## Estado seguro

Documento academico. No activa runtime, no escribe Firestore/HR, no llama Make, no procesa datos reales y no cambia frontend.

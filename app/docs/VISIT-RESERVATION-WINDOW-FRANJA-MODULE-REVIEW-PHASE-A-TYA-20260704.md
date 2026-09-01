# Visit reservation, scheduling window and franja module review Phase A TyA

Fecha: 2026-07-04

## Objetivo

Complementar Phase A con una regla que no habia quedado suficientemente explicita: reservas de visitas, fecha propuesta en postulaciones, agendamiento y reprogramacion deben validar `availableFrom`, franja y quincena.

Este bloque no modifica frontend y no activa runtime. Define contrato, validador, gaps y Academia asociada.

## Modulos involucrados

- `app/modules/postulaciones.js`
- `app/modules/misvisitas.js`
- `app/modules/visitas.js`
- `app/modules/dashboard.js`
- `app/modules/hr-source.js`
- `app/core/data.js`
- `app/core/hr.js`
- `app/core/automations.js`

## Regla incorporada a Phase A

Las reservas, fechas propuestas, agendamientos y reprogramaciones deben validar:

1. Que la fecha sea igual o posterior a `Disponible desde` / `availableFrom`.
2. Que la fecha respete la franja de la visita.
3. Para Cinepolis:
   - `WK` = dias de semana;
   - `WKND` = fin de semana.
4. Que la fecha este dentro de la quincena asignada.
5. Que cualquier excepcion fuera de franja/rango sea aprobada por admin u operaciones.
6. Que la aprobacion especial registre quien autorizo, cuando y por que.
7. Que si la excepcion fue por falta del shopper, pueda generar impacto en puntaje, pendiente de contrato de ranking.

## Contrato creado

- `app/contracts/visit-reservation-window-phase-a.tya.contract.json`

El contrato define:

- reservas;
- fecha propuesta en postulacion;
- agendamiento;
- reprogramacion;
- validacion por `availableFrom`;
- validacion por franja;
- validacion por quincena;
- aprobacion fuera de rango/franja;
- impacto eventual en puntaje shopper;
- impacto Academia.

## Validador creado

- `tools/migration/tya-visit-reservation-window-validator.mjs`

El validador revisa:

- gates apagados;
- llaves estables;
- estados de reserva;
- estados de validacion;
- reglas WK/WKND;
- reglas Q1/Q2;
- campos obligatorios de autorizacion;
- regla de no penalizar automaticamente shopper score;
- impacto Academia.

## Llaves estables obligatorias

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `reservationId`
- `scheduleRequestId`
- `assignmentId`
- `postulationId`
- `shopperId`
- `country`
- `periodId`
- `quincena`
- `franja`
- `availableFrom`
- `proposedDate`
- `scheduledAt`
- `reservationStatus`
- `scheduleValidationStatus`
- `overrideApprovalId`
- `authorizedBy`
- `authorizedReason`
- `scoreImpactStatus`

## Estados de reserva

- `not_reserved`
- `reserved_pending_schedule`
- `reserved_with_proposed_date`
- `scheduled_confirmed`
- `reschedule_requested`
- `rescheduled_confirmed`
- `reservation_expired`
- `released`
- `cancelled`
- `conflict_review_required`

## Estados de validacion

- `valid`
- `before_available_from`
- `outside_franja`
- `outside_quincena`
- `outside_project_rules`
- `missing_required_date`
- `future_or_past_rule_conflict`
- `override_required`
- `override_approved`
- `override_rejected`
- `conflict_review_required`

## Reglas Cinepolis documentadas

Para Cinepolis, la franja debe validar:

- `WK`: lunes a viernes.
- `WKND`: sabado y domingo.

La fecha tambien debe estar dentro de la quincena asignada:

- `Q1`: dia 1 al 15.
- `Q2`: dia 16 al ultimo dia del mes.

Estas reglas quedan configurables por proyecto para no hard-codear Cinepolis como modelo unico.

## Aprobaciones fuera de franja/rango

Admin u operaciones puede aprobar una fecha fuera de rango/franja cuando exista autorizacion especial.

Debe quedar registrado:

- `authorizedBy`;
- `authorizedAt`;
- `authorizedReason`;
- `failedRules`;
- `overrideScope`;
- `scoreImpactDecision`.

La excepcion no implica automaticamente falta del shopper. Debe distinguirse:

- autorizacion operativa o del cliente, sin penalizacion;
- error/falta del shopper, posible impacto de puntaje;
- caso dudoso, revision manual.

## Puntaje shopper / ranking

Este bloque no define todavia el ranking completo.

Queda documentado que:

- no se debe reducir puntaje automaticamente hasta tener contrato aprobado de scoring;
- si la falta es atribuible al shopper, se crea evento potencial de score;
- los criterios de ranking deben revisarse en un bloque dedicado;
- se requiere validacion de Paula antes de activar penalizaciones.

## Gaps detectados

- Phase A necesitaba explicitar reservas y fecha propuesta en postulaciones.
- El lifecycle previo hablaba de agenda, pero no detallaba control de franja/quincena para reserva/propuesta/reprogramacion.
- Falta futuro contrato de scoring/ranking shopper.
- Falta mapa de campos HR exactos para `availableFrom`, `franja` y `quincena` por proyecto/fuente.

## Pendientes backend

- Crear preview validator sobre datos mock/staging seguro para fechas propuestas/agendadas/reprogramadas.
- Integrar esta validacion con assignment sync y visit lifecycle contracts.
- Preparar futuro contrato de shopper scoring/ranking.
- Preparar payload Make futuro sin activarlo.

## Pendientes prototipo

- Mostrar validacion de franja/rango en fecha propuesta de postulacion.
- Mostrar validacion de franja/rango en agendamiento.
- Mostrar validacion de franja/rango en reprogramacion.
- Permitir aprobacion especial admin/ops con motivo y autorizador.
- Mostrar que la reserva no equivale a HR sincronizada.
- Documentar para Claude cuando vuelva a tener capacidad.

## Impacto Academia

Academia debe crear contenido para:

### Shopper

- Que es una reserva.
- Que significa `Disponible desde`.
- Que significa franja WK/WKND.
- Que significa quincena.
- Como proponer fecha correcta.
- Como agendar correctamente.
- Como reprogramar correctamente.
- Que pasa si solicita fecha fuera de rango.
- Cuando puede afectar su puntaje.

### Operativo / coordinador

- Como validar fechas propuestas.
- Como revisar reservas.
- Como aprobar fuera de franja/rango.
- Como documentar autorizacion especial.
- Como identificar posible falta del shopper.

### Admin

- Como configurar reglas por proyecto.
- Como autorizar excepciones.
- Como auditar reservas y reprogramaciones.
- Como evitar impacto indebido en ranking.

### Cliente

- Como entender que algunas visitas pueden requerir autorizacion especial.

### Consultora / representante / franquiciado / aliado / socio

- Como el control de franja/quincena mejora calidad operativa.
- Como reduce reprocesos y errores de agenda.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin deploy.
- Sin produccion.

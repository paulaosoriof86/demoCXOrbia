# Visit lifecycle and scheduling module review Phase A TyA

Fecha: 2026-07-04

## Objetivo

Continuar la revision backend modulo por modulo sobre V82 con el flujo Phase A de visitas: disponibles, agendadas, reprogramadas, canceladas, realizadas y cuestionario realizado.

Este bloque no modifica frontend y no activa runtime. Define contrato, validador, gaps y Academia asociada.

## Modulos involucrados

- `app/modules/misvisitas.js`
- `app/modules/visitas.js`
- `app/modules/dashboard.js`
- `app/modules/cuestionario-shopper.js`
- `app/modules/revision-admin.js`
- `app/modules/hr-source.js`
- `app/core/data.js`
- `app/core/hr.js`
- `app/core/automations.js`

## Estado V82

V82 queda como baseline viva. Los flujos visibles existen parcialmente, pero el lifecycle aun debe mapearse a estados canonicos backend antes de runtime real.

Pendientes visuales heredados:

- algunos textos de sync HR siguen siendo demasiado fuertes;
- el texto `cuestionario enviado` debe quedar como `cuestionario realizado/completado`;
- visita realizada no debe habilitar automaticamente liquidacion;
- cuestionario realizado no debe tratarse como submitido;
- links externos faltantes deben advertirse sin caer a formulario interno.

## Contrato creado

- `app/contracts/visit-lifecycle-phase-a.tya.contract.json`

El contrato define:

- colecciones futuras;
- llaves estables;
- estados canonicos del ciclo de vida;
- estados de cuestionario;
- acciones de agenda/reprogramacion/cancelacion/realizada/cuestionario;
- reglas de fecha;
- separacion entre visita, cuestionario, revision, submitido, liquidacion y pago;
- impacto Academia.

## Validador creado

- `tools/migration/tya-visit-lifecycle-contract-validator.mjs`

El validador revisa:

- gates apagados;
- llaves estables;
- estados canonicos;
- acciones deshabilitadas;
- regla cuestionario != submitido;
- regla no liquidacion automatica;
- hard stops;
- impacto Academia.

## Llaves estables obligatorias

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `assignmentId`
- `shopperId`
- `periodId`
- `country`
- `currency`
- `franja`
- `quincena`
- `visitLifecycleStatus`
- `scheduleSyncStatus`
- `questionnaireStatus`
- `reviewStatus`
- `submitidoStatus`
- `liquidationEligibility`
- `lastSyncedAt`

## Estados canonicos de lifecycle

- `available`
- `postulation_pending`
- `assigned_pending_schedule`
- `scheduled`
- `reschedule_requested`
- `rescheduled`
- `cancellation_requested`
- `cancelled`
- `performed_pending_questionnaire`
- `questionnaire_completed_pending_review`
- `review_in_progress`
- `approved_for_submitido`
- `submitido_registered`
- `liquidation_candidate`
- `liquidated`
- `payment_scheduled`
- `paid`
- `conflict_review_required`

## Reglas Phase A

1. Visita disponible no debe mostrarse si ya tiene asignacion activa.
2. Visita agendada debe conservar `scheduledAt` y origen de la fecha.
3. Reprogramacion debe conservar fecha previa, motivo y auditoria.
4. Cancelacion debe conservar motivo y no liberar visita automaticamente salvo regla de proyecto/admin.
5. Realizada no equivale a cuestionario realizado.
6. Cuestionario realizado no equivale a submitido.
7. Submitido no equivale a liquidacion pagada.
8. Pago es estado financiero separado del ciclo operativo.
9. Fechas realizadas/cuestionario no deben ser futuras.
10. Si HR y plataforma discrepan, se crea conflicto; no se sobreescribe.

## Gaps detectados

- Se necesita mapa visible -> canonico para estados del prototipo.
- Se necesita preview seguro que detecte fechas futuras, cuestionario antes de visita y estados incompatibles.
- Se necesita separar mejor performed/questionnaire/review/submitido/liquidation/payment en UI y datos.
- Se necesita documentar manual Academia para cada paso operativo.

## Pendientes backend

- Crear validador de lifecycle preview sobre datos mock/staging seguro.
- Mapear metodos `CX.data` actuales a acciones canonicas.
- Preparar payload Make futuro para agenda/reprogramacion/cancelacion, sin activarlo.
- Preparar reglas de elegibilidad de liquidacion con submitido/revision.

## Pendientes prototipo

- Cambiar textos de cuestionario enviado a realizado/completado.
- Mostrar estados honestos de sync HR.
- Mostrar separacion clara: realizada, cuestionario realizado, revision, submitido, liquidacion y pago.
- Evitar que una accion visual sugiera que se escribio HR o se pago.

## Impacto Academia

Academia debe actualizar o crear contenido para:

### Shopper

- Como ver visitas disponibles.
- Como agendar.
- Como reprogramar.
- Como cancelar.
- Como marcar visita realizada.
- Como abrir o completar cuestionario.
- Que significa cuestionario realizado.
- Que NO significa cuestionario realizado: no es submitido ni pago.

### Operativo / coordinador

- Como dar seguimiento a agenda.
- Como revisar reprogramaciones.
- Como validar cancelaciones.
- Como detectar visita realizada sin cuestionario.
- Como escalar conflictos de fecha o HR.

### Admin

- Como supervisar ciclo completo.
- Como separar estado operativo, revision, submitido y pago.
- Como leer conflictos.
- Como auditar fechas.

### Cliente

- Como interpretar estados de visita sin acceder a informacion operativa sensible.

### Consultora / representante / franquiciado / aliado / socio

- Como el lifecycle reduce reprocesos.
- Como la trazabilidad aumenta control y valor para el cliente.

## Solicitudes de capacitacion asociadas

- Necesito aprender a agendar visitas.
- Necesito aprender a reprogramar/cancelar.
- Necesito entender estados de visita.
- Necesito entender diferencia entre realizada, cuestionario, submitido y pago.
- Necesito resolver conflictos de fechas.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin HR writes.
- Sin Make real.
- Sin deploy.
- Sin produccion.

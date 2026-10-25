# Cambios backend addendum - Visit lifecycle reservation preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de visit lifecycle/reservas usando politica de datos sensibles y assignment sync/conflicts como gates previos.

## Archivos creados

1. `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato de preview para reservas, agenda, reprogramacion, cancelacion, visita realizada y cuestionario completado.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de visit lifecycle/reservas.

2. `tools/migration/tya-visit-lifecycle-reservation-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con visitas y acciones de ciclo de visita.
   - Por que: permite clasificar agenda valida, fuera de ventana, conflicto, revision manual, realizada y cuestionario completado sin datos reales.

3. `app/docs/VISIT-LIFECYCLE-RESERVATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, action types, outcomes, reglas, pendientes backend, pendientes Claude, Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-VISIT-LIFECYCLE-RESERVATION-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists, glosario y notificaciones para Academia.

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

## Phase A que avanza

- Reserva sostiene visita en preview sin implicar HR sync real.
- Agenda valida respeta `availableFrom`, franja y quincena.
- Fuera de rango requiere override con `authorizedBy` y `authorizedReason`.
- Visita realizada queda separada de cuestionario completado.
- Cuestionario completado queda separado de submitido/liquidacion/pago.
- Conflicto de assignment sync bloquea agenda hasta revision.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para escenarios de visit lifecycle/reservas.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de ficha postulacion dinamica.
4. Preparar Make payload draft de agenda/reprogramacion sin activar.
5. Relacionar estados de visita con liquidaciones sin tratar cuestionario como submitido.

## Pendientes prototipo/Claude derivados

1. Mis visitas no debe decir que agenda/reprogramacion sincroniza HR si gate esta apagado.
2. Reserva debe verse como preparada/pendiente HR sync/preview, no sincronizada.
3. Fuera de rango debe mostrar regla fallida: availableFrom, franja, quincena o proyecto.
4. Override debe pedir justificacion y autorizador.
5. Realizada, cuestionario completado, revision, submitido, liquidacion y pago deben estar separados.
6. Visita reservada/asignada no debe seguir disponible duplicada.

## Impacto Academia

Se creo documento especifico de Academia para visit lifecycle/reservas, agenda, reprogramacion, cancelacion, performed, questionnaire completed, overrides y glosario.

## Siguiente bloque recomendado

Preview validator de ficha postulacion dinamica, usando gates de datos sensibles, assignment sync y visit lifecycle/reservas.

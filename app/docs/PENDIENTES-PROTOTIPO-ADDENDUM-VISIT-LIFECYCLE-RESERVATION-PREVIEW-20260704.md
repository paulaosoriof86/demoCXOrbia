# Pendientes prototipo addendum - Visit lifecycle reservation preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para ciclo de visita y reservas. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes Mis visitas

1. No mostrar que agenda/reprogramacion sincroniza HR si gate esta apagado.
2. Mostrar reserva como `preparada`, `preview` o `pendiente HR sync`.
3. Mostrar fuera de rango con regla fallida:
   - availableFrom;
   - franja;
   - quincena;
   - regla de proyecto.
4. Separar etapas:
   - disponible;
   - reservada;
   - agendada;
   - reprogramacion solicitada;
   - realizada;
   - cuestionario completado;
   - revision;
   - submitido;
   - liquidacion;
   - pago.
5. No dejar disponible una visita reservada/asignada.

## Pendientes Postulaciones / agenda

1. Validar fecha propuesta contra availableFrom, franja y quincena.
2. Si falla, mostrar razon y pedir revision/override.
3. Si assignment sync tiene conflicto, bloquear agenda hasta revision.
4. No confirmar agenda como HR sync real mientras Make/HR esten apagados.

## Pendientes Admin / Ops

1. Mostrar cola de fuera de rango.
2. Pedir autorizador y razon para override.
3. Mostrar scope de override: availableFrom, franja, quincena o proyecto.
4. Mostrar conflicto de assignment sync antes de permitir agenda.
5. No resolver conflictos automaticamente.

## Pendientes Liquidaciones

1. Visita realizada no habilita liquidacion automaticamente.
2. Cuestionario completado no es submitido.
3. Submitido/revision deben cumplirse antes de liquidacion.
4. Pago debe seguir separado del estado de visita.

## Pendientes textos honestos

Usar:

- preparada;
- preview;
- pendiente HR sync;
- fuera de rango;
- requiere override;
- requiere revision;
- pendiente backend.

No usar:

- HR sincronizada;
- Make ejecutado;
- finalizado real si no hay gate activo.

## Pendientes Academia

1. Curso Shopper: agenda, reprogramacion, cancelacion, realizada y cuestionario completado.
2. Curso Ops: seguimiento de agenda y fuera de rango.
3. Curso Admin: override fuera de ventana.
4. Manual de reservas.
5. Manual availableFrom/franja/quincena.
6. Checklist antes de confirmar agenda.
7. Checklist antes de aprobar override.
8. Checklist antes de marcar realizada.
9. Checklist antes de marcar cuestionario completado.
10. Glosario de visit lifecycle/reservas.

## No corresponde a Claude

- Implementar validator backend.
- Activar Make real.
- Escribir HR.
- Escribir Firestore.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: estados honestos, sin duplicar disponibilidad, fuera de rango y separacion realizada/cuestionario/submitido/liquidacion/pago.

P1: bandejas Admin/Ops para override y conflictos.

P2: Academia profunda con manuales, checklists y glosario.

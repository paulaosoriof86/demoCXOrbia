# Postulation management decision grouping Phase A TyA

Fecha: 2026-07-04

## Objetivo

Documentar el flujo operativo real de gestion de postulaciones que Paula describio: aprobacion estrategica por sucursal, shopper, quincena/periodo, fecha propuesta, solicitudes de ajuste, confirmacion, reprogramacion y notificaciones.

Este bloque no modifica frontend, no activa WhatsApp API ni Make y no escribe Firestore.

## Contrato creado

- `app/contracts/postulation-management-decision-phase-a.tya.contract.json`

## Agrupaciones necesarias en gestion de postulaciones

La bandeja de operaciones/admin debe permitir agrupar y filtrar por:

- sucursal / visita;
- shopper;
- proyecto;
- quincena o periodo cuando aplique;
- estado;
- fecha propuesta;
- conflicto de restriccion;
- responsable operativo.

## Vista por sucursal

Debe ayudar a decidir entre varios shoppers postulados a la misma sucursal.

Debe mostrar:

- todos los postulados para esa sucursal/visita;
- si corresponde Q1/Q2 o periodo equivalente;
- fecha propuesta de cada shopper;
- advertencias de restricciones;
- historial de shopper en esa sucursal/proyecto;
- riesgo de duplicidad;
- quien ya fue aprobado si aplica.

## Vista por shopper

Debe ayudar a ver si un shopper se postulo a varias visitas y decidir donde conviene asignarlo.

Debe mostrar:

- todas las postulaciones del mismo shopper;
- visitas con menos postulados;
- frecuencia/ultima visita;
- asignaciones actuales;
- score/ranking cuando exista contrato aprobado;
- conflictos o alertas.

## Decisiones posibles

- Aprobar con la fecha propuesta.
- Aprobar y pedir que programe fecha.
- Aprobar en otra quincena/periodo o visita compatible.
- Solicitar ajuste de fecha con motivo.
- Solicitar confirmacion de fecha.
- Pedir reprogramacion desde operaciones/admin.
- No seleccionar en esta ocasion con mensaje suave.
- Rechazar solo si hay ineligibilidad real.
- Enviar a revision manual.

## Mensaje no seleccionado

Cuando un shopper no se elige porque otro fue asignado, no debe recibir un mensaje duro de rechazo salvo que sea realmente inelegible.

Mensaje recomendado:

- `En esta ocasion no fue posible asignarte esta visita. Puedes postularte a otras visitas disponibles.`

Esto mantiene buena relacion con shoppers.

## Solicitud de ajuste de fecha

Operaciones/admin debe poder pedir ajuste de fecha propuesta indicando motivo.

Ejemplos:

- fuera de franja;
- fuera de quincena;
- antes de disponible desde;
- se requiere otro dia por autorizacion del cliente;
- se necesita confirmacion adicional.

Debe notificar al shopper y conservar la postulacion abierta.

## Solicitud de confirmacion de fecha

Operaciones/admin debe poder pedir confirmacion cuando:

- el shopper no propuso fecha;
- propuso fecha pero no ha confirmado;
- hay dudas sobre asistencia;
- se requiere reconfirmacion por riesgo operativo.

Debe quedar registro de quien solicito, fecha, motivo y respuesta.

## Reprogramacion solicitada por operaciones/admin

Tambien debe poder pedirse reprogramacion con motivo cuando la visita ya esta asignada/agendada.

Debe notificar al shopper y registrar seguimiento.

## Notificaciones

Canales previstos:

- in-app;
- WhatsApp Web actual;
- Make/mensajeria futura cuando se autorice;
- email futuro si aplica.

Regla:

- Si Make/API no esta activa, preparar WhatsApp Web e in-app.
- No mostrar que WhatsApp API o Make enviaron algo si no estan activos.
- Toda notificacion futura debe registrar canal previsto y estado.

## Aprobacion y doble trabajo

Cuando se aprueba una postulacion:

- registrar quien aprobo;
- registrar fecha de aprobacion;
- sacar la visita de disponibles/gestiones para evitar doble aprobacion;
- notificar al shopper;
- marcar otras postulaciones de esa visita segun decision: no seleccionado suave, alternar quincena/periodo o revision manual.

## Pendientes backend

- Preparar preview validator de cola de postulaciones agrupada.
- Integrar con assignment sync, reservas y restricciones.
- Definir estados canonicos de notificacion.
- Preparar payload Make futuro sin activarlo.

## Pendientes prototipo

- Bandeja por sucursal.
- Bandeja por shopper.
- Acciones: pedir ajuste de fecha, pedir confirmacion, pedir reprogramacion.
- Mensajes suaves para no seleccionados.
- Fallback WhatsApp Web si API/Make esta apagado.
- Evitar doble aprobacion por otro usuario.

## Impacto Academia

Academia debe explicar:

### Operativo / coordinador

- Como agrupar postulaciones por sucursal.
- Como agrupar por shopper.
- Como decidir a quien asignar.
- Como pedir ajuste de fecha.
- Como pedir confirmacion.
- Como pedir reprogramacion.
- Como usar mensaje suave de no seleccionado.

### Admin

- Como supervisar decisiones de asignacion.
- Como revisar doble aprobacion.
- Como auditar quien aprobo.
- Como manejar Q1/Q2 o periodos.

### Shopper

- Que significa no ser seleccionado en esta ocasion.
- Como responder a ajuste/confirmacion de fecha.
- Que pasa cuando es aprobado.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin WhatsApp API real.
- Sin Make real.
- Sin deploy.
- Sin produccion.

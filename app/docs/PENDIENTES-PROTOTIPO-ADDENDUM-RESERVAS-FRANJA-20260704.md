# Pendientes prototipo - Reservas, franja y rango Phase A

Fecha: 2026-07-04

## Pendientes visuales derivados del contrato backend

1. En postulaciones, la fecha propuesta debe validar:
   - `Disponible desde` / `availableFrom`;
   - franja WK/WKND;
   - quincena asignada.

2. En agendamiento, la fecha seleccionada debe validar:
   - `Disponible desde`;
   - franja;
   - quincena;
   - reglas del proyecto.

3. En reprogramacion, la nueva fecha debe validar las mismas reglas.

4. Si la fecha queda fuera de rango/franja/quincena:
   - mostrar alerta;
   - permitir aprobacion especial solo para admin/ops;
   - pedir motivo;
   - registrar quien autoriza;
   - distinguir si afecta o no puntaje shopper.

5. La reserva no debe mostrarse como HR sincronizada si el gate real esta apagado.

## Pendientes Academia asociados

- Curso shopper: agendar y reprogramar correctamente.
- Curso ops: validar fechas y reservas.
- Curso admin: autorizar excepciones.
- Glosario: reserva, disponible desde, franja, WK, WKND, quincena, autorizacion especial, ranking shopper.

## Pendiente futuro

Crear contrato dedicado de puntaje/ranking shopper antes de aplicar penalizaciones automaticas.

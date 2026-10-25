# Pendientes prototipo - Addendum Phase A colas auditables TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Objetivo

Registrar pendientes de prototipo derivados de los contratos backend de colas operativas y acciones auditables, para que Claude los implemente cuando corresponda sin que backend toque `/app/modules` ni `/app/core`.

## Pendientes UI/UX criticos

1. Crear tablero de colas operativas.
2. Separar colas por tipo: sync/conflictos, HR/plataforma, certificaciones, pagos, cuestionario, correcciones.
3. Mostrar severidad y estado sin prometer automatizacion real.
4. Agregar drill por item con stable keys no sensibles.
5. Mostrar sourceRef opaca, no URL ni datos crudos.
6. Agregar razon obligatoria para resolver conflicto/correccion/pago.
7. Mostrar bitacora o historial de decisiones.
8. Mostrar badges: preview, no write, no sync real, no pago real, gate apagado.
9. Botones futuros deben quedar preparados/deshabilitados si gate apagado.
10. No usar textos como enviado, pagado, sincronizado o importado si solo esta preparado.

## Pendientes por modulo probable

La ubicacion exacta debe definirla Claude segun la candidata vigente/source lock, sin tocar backend:

- Dashboard/admin: resumen de colas por severidad.
- Postulaciones/asignaciones: cola de asignaciones pendientes y conflictos.
- Shoppers/certificaciones: preservacion y revision.
- Finanzas/liquidaciones: control de pagos junio.
- Proyectos/configuracion: rutas de cuestionario por proyecto/visita.
- Academia: contenido explicativo de colas, gates y auditoria.

## Textos honestos esperados

- `Accion preparada · pendiente gate backend`
- `Sync real desactivado`
- `Pago no ejecutado por CXOrbia`
- `Revision humana requerida`
- `Fuente segura / sourceRef opaca`
- `No se muestran datos sensibles`

## No hacer

- No mostrar fixtures como datos reales.
- No mostrar `.tmp` derivado como fuente real.
- No decir pagado si es solo control.
- No decir enviado si no hay envio real.
- No decir sincronizado si no hay write HR/plataforma.
- No borrar postulaciones rechazadas sin trazabilidad.
- No pedir certificacion otra vez si esta preservada sin revision.

## Academia pendiente

Agregar lecciones/manuales sobre:

- colas operativas;
- severidad blocker/warning/info;
- sourceRef opaca;
- stable keys;
- revision humana;
- auditoria;
- pagos como control;
- diferencia entre preview y produccion.

## Estado

Pendiente para Claude/prototipo. Backend solo preparo contratos/documentacion, sin cambios UI.
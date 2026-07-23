# RESUMEN PARA CLAUDE — V174 VISUAL FREEZE E INICIO CORTE 3

**Fecha:** 2026-07-23

## Estado aprobado

V174 fue validada visualmente por Paula en Hosting DEV. No generar nueva candidata ni reabrir M1/Corte 1/Corte 2A.

## Pendientes frontend localizados, no bloqueantes

1. **Responsive P1:** revisar tablas y fichas que mantienen ancho rígido o desaprovechan el viewport móvil. La corrección debe ser reusable, sin alterar datos ni lógica de negocio.
2. **PDF P1:** las exportaciones deben incluir las gráficas correspondientes al reporte visible y conservar títulos, filtros, periodo, proyecto y fuente.
3. **Excel P2:** aplicar formato legible: encabezados, anchos, tipos, moneda/fecha, filtros y congelación de encabezado, sin cambiar datos.

No aplicar estos cambios ahora ni mezclarlos con Corte 3 Finanzas. Quedan para una candidata incremental localizada cuando corresponda el corte de UX/exportaciones.

## Corte 3

Backend continúa con verdad financiera, liquidaciones y pagos. Claude no debe inferir pago desde realizada, cuestionario, submitido o liquidada. La UI deberá consumir estados canónicos y referencias opacas cuando el backend los publique.

## Preservar

- seis módulos V174;
- `CX.data` y punto único de conexión;
- adapters HR live;
- source lock y aggregate vigentes;
- multi-tenant/multi-proyecto;
- Academia y rutas por rol.

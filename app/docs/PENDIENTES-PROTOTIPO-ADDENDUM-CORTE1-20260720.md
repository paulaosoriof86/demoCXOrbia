# Pendientes de prototipo — Corte 1

Fecha: 2026-07-20

## Bloqueantes del freeze

- Unificar la lógica y la revisión de fuente que usan el KPI y el modal de detalle.
- En `Sin submitir`, no rotular como `Pend. cuestionario` una visita con cuestionario confirmado.
- Al cambiar periodo, actualizar de forma coherente Dashboard, Panorama, Histórico, detalle y reportes.
- En administración, exportar o imprimir el reporte específico y no la página completa.
- La personalización debe permitir seleccionar, agregar, quitar, reordenar y renombrar columnas.

## Mejora reusable de producto

- Aplicar branding configurable por tenant en reportes: logo, colores y tipografía.
- Incorporar gráficas y tablas según la fuente disponible.
- Mantener plantillas y alcances por rol.
- Mostrar claramente fuente viva, fuente vencida y pendiente de fuente.

## Validación esperada

- Los datos operativos no se aceptan por conteos fijos.
- Una actualización de la HR debe reflejarse después de la actualización runtime.
- Cuestionario completado y submitido se validan como estados diferentes.
- JUN/JUL y GT/HN deben cambiar de forma coherente en KPI, filas, detalle y exportación.
- PDF, Excel y PPT deben generarse desde el reporte.

Backend ya preparó el bloque de lectura HR viva. No se requiere otra candidata por rutina.

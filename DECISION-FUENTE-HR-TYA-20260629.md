# DECISION-FUENTE-HR-TYA-20260629

## Decision operativa

Para la migracion y pruebas DEV se usara la hoja sincronizada en Google Sheets como fuente operativa inmediata de HR, porque esta disponible para automatizaciones y se puede leer desde integraciones controladas.

Las hojas originales externas se conservaran como referencia operativa y fuente de comparacion. No se conectaran como backend vivo hasta tener un acceso estable y auditable.

## Motivo

La hoja compartida contiene columnas necesarias para reconstruir estado operativo de visitas: pais, id de cinema, ciudad, sucursal, franja, quincena, shopper asignado, fecha programada, fecha realizada, cuestionario completado, fecha submitido y liquidado.

## Criterio de mapeo

- Fecha realizada con valor: visita realizada.
- Cuestionario completado con valor: cuestionario realizado.
- Fecha submitido con valor: visita submitida.
- Liquidado igual a SI: visita liquidada.
- Shopper asignado con valor: visita asignada.
- Fecha programada con valor: visita agendada.

## Restricciones

- No migrar archivos ni evidencias desde HR hasta resolver Storage.
- No tomar dashboard antiguo como fuente confiable.
- No usar capturas como fuente primaria de migracion.
- No escribir produccion.
- No Hosting.
- No merge.
- No cambios en `/app/modules`.

# RESUMEN PARA CLAUDE — periodos/histórico V103

Backend ya garantiza 14 periodos ordenados, 13 cerrados, 1 activo y visitas separadas. No volver a crear lógica de agrupación ni IDs.

Pendiente frontend exacto:

- `modules/historico.js`: por defecto debe mostrar históricos cerrados/archivados y ofrecer incluir activo de forma explícita.
- `modules/periodos.js`: acciones de cerrar/archivar sobre fuente HR deben mostrarse como solicitud pendiente backend, no como cambio confirmado local.
- Manual/Academia: explicar Proyecto ≠ Periodo, fuente HR histórica y warnings sin inventar fechas.

El backend expone `visitsForPeriod`, `historicalPeriodsForProgram`, `activePeriodsForProgram` y `historicalVisitsForProgram`. La UI debe consumirlos y no reconstruir periodos desde nombres de tabs.

# RESULTADO-CARGA-HR-HISTORICO-V4-FIRESTORE-DEV-20260629

## Resultado

Carga autorizada del histórico HR GT/HN V4 en Firestore DEV completada.

## Alcance autorizado

- 573 visitas.
- 188 shoppers.
- 26 periodos/proyectos.
- 556 cuestionarios.
- 524 liquidaciones.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin Storage/evidencias.
- Sin activar adapter global.
- Sin modificar /app/modules.

## Escrituras

- Escrituras preparadas y ejecutadas:

## Lectura validada en Firestore DEV

- clients leídos:
- projects leídos:
- shoppers leídos:
- visits leídas en 26 periodos:
- questionnaires leídos en 26 periodos:
- liquidations leídas en 26 periodos:

## Nota de arquitectura

Esta carga es la base histórica inicial. No reemplaza la sincronización viva de HR. La sincronización incremental mensual queda pendiente para leer cambios futuros, nuevas hojas, nuevos shoppers y nuevas asignaciones sin duplicar.

## Restricciones conservadas

- No se hizo deploy de Hosting.
- No se hizo merge.
- No se tocó producción.
- No se cargó Storage/evidencias.
- No se activó adapter global.
- No se modificó /app/modules.

# ACADEMIA — Impacto C6 diagnóstico control-plane HR v3

## Patrón reusable

Agregar al contenido de integraciones externas:

- diferencia entre ausencia de run recuperable y prueba de no ejecución;
- checkpoints antes de la frontera provider;
- control positivo para validar que la consulta de statuses funciona;
- `STOP_RETRY` cuando la existencia del run es inconclusa;
- prohibición de convertir ausencia de evidencia en consumo cero.

## Caso TyA

El request v3 no publicó `WORKFLOW_STARTED_PROVIDER_READS_0` ni `PROVIDER_READ_BOUNDARY_ENTERED_MAX1`. No se confirma agosto, tabs GT/HN ni revisión viva.

## Manuales y cursos

- Incluir troubleshooting de workflow `push` no enumerado por una herramienta limitada a `pull_request`.
- Mantener separados el diagnóstico del control-plane y la validación de datos HR.
- No presentar estados técnicos al usuario final.

## Seguridad

El diagnóstico no tocó request, HR, provider, Firestore, Auth, Rules, Storage, deploy, merge o producción.

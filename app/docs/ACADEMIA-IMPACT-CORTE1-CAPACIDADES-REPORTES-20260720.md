# ACADEMIA IMPACT — CORTE 1.2 REPORTES V164

Fecha: 2026-07-20
Estado: `DEV_PASS_PENDING_VISUAL`

## Contenido confirmado

Academia debe explicar:

- diferencia entre proyecto, periodo, país y sucursal;
- origen source-safe y datos protegidos;
- diferencia entre reporte disponible y pendiente de fuente;
- cambio de periodo y país;
- resumen operativo, estado por sucursal, cobertura y tendencia;
- por qué no se muestran score, NPS, benchmark, planes o brechas sin fuente validada;
- exportación PDF, Excel y presentación;
- verificación del alcance antes de compartir un archivo;
- diferencia entre “Ver como” y Auth/RBAC real.

## Rutas por rol

- Director: proyecto/periodo y Todos/GT/HN.
- Regional: reportes bloqueados hasta mapping estable.
- Sucursal: reportes limitados a su `branchName`.
- Sin periodo verificable: estado fail-closed.

## Fixes reutilizables

- Los formatos usan una única proyección.
- El periodo activo se excluye de Tendencia por defecto.
- La resolución de sucursal exige coincidencia estable y única.
- Reportes sin fuente permanecen visibles pero deshabilitados con explicación.

## Certificaciones y recursos

- Certificaciones: cierre funcional Corte 2, permisos Corte 6 y sincronización Corte 7.
- Recursos: contexto Corte 1, entrega por visita Corte 2, permisos Corte 6 y almacenamiento/versionado Corte 7.

## Evidencia DEV

- Run `29771355833`: SUCCESS.
- Admin, Cliente y Shopper: PASS.
- Ruta `cli_reportes`: renderizada correctamente.
- Cero errores de página y consola.

## Revisión visual pendiente

Paula debe revisar Reportes, Histórico, selector de país, roles, archivos exportados y contenido relacionado de Academia antes del freeze de Corte 1.

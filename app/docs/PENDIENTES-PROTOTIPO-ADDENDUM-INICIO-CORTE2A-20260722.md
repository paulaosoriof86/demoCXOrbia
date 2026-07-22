# PENDIENTES PROTOTIPO — Inicio Corte 2A

Fecha: 2026-07-22  
Estado: `P1_FRONTEND_LOCALIZED_PENDING_CLAUDE`

## Corte 2A — Pendientes activos

1. `app/modules/visitas.js`
   - estado visible no canónico;
   - filtros/detalle/exportación aún dependen de `v.estado` crudo;
   - monto ausente puede mostrarse como cero.

2. `app/modules/postulaciones.js`
   - reasignación sin decisión de fecha/franja;
   - botón Exportar sin implementación;
   - `undefined` visible cuando falta teléfono;
   - copy de sincronización debe ser honesto y read-only.

3. `app/core/tya-phase-a-source-safe-preview.js`
   - preservar ausencia/null financiero, sin fallback automático a cero.

## Pendientes transversales que no bloquean Corte 2A

- calidad multiformato de Excel/PPT/PDF;
- logo, branding, gráficas y anchos;
- catálogo de columnas por reporte/fuente;
- definición y gate del KPI Efectividad;
- copy menor duplicado de países.

## No reabrir

- lectura HR;
- histórico y periodos;
- refresco in-place;
- sourceRevision única;
- canary y coherencia transversal;
- seguridad fail-closed de Mis Reportes shopper sin identidad.

## Gate de salida

No cerrar Corte 2A sin contrato, gates M1, canary, Hosting DEV autorizado, validación visual y freeze documentado.

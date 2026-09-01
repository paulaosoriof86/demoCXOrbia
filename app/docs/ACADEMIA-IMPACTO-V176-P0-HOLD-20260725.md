# ACADEMIA — Impacto V176 P0 HOLD

## Estado

V176 no cambia todavía cursos ni manuales funcionales porque no fue aplicada. Corte 3 permanece HOLD.

## Contenido que deberá actualizarse después de aprobar V177

### Finanzas por periodo

- Proyecto y periodo son entidades distintas.
- Un “mes local” de una herramienta no puede sustituir el periodo canónico del proyecto.
- Cambiar de periodo debe cambiar movimientos, presupuesto, liquidaciones, revisiones y exportaciones.

### Multimoneda

- Q y L nunca se suman sin una tasa y fuente explícitas.
- Cada fila conserva país y moneda.
- Los resúmenes deben agruparse por moneda.
- Una fila sin moneda queda pendiente; no hereda la primera moneda del proyecto.

### Presupuesto

- Debe explicarse la llave `tenant + proyecto + periodo`.
- Un gasto fijo sin distribución no pertenece todavía a Guatemala ni Honduras.
- No se repite por país ni se usa en margen hasta asignarlo.

### Liquidación y pago

- Devengado, por pagar y pagado siguen siendo estados diferentes.
- Pago exige confirmación y referencia de fuente.
- V176 preserva cero pagos y cero lotes.

### Revisión financiera

- `reviewRequired`, `financialSourceStatus`, `liquidationState` y `paymentState` activan revisión fail-closed.
- Una revisión no habilita pago o lote.
- En mayo deben visualizarse las dos revisiones GT de la fuente canónica.

### Entornos y roles

- El selector Shopper DEV es una herramienta de validación, no Auth real.
- Solo puede aparecer en un entorno explícitamente autorizado.
- Debe probarse también el host no autorizado.

### Exportaciones y evidencia

- Un PASS de tokens no sustituye PDF/Excel abiertos.
- La validación debe incluir viewport móvil y datos canónicos.
- Las evidencias deben corresponder a pantallas diferentes y al mismo build.

## Rutas por rol

- Admin: Dashboard Financiero, Movimientos/Tesorería y bandeja de revisión.
- Shopper: Mis Beneficios con moneda real de su liquidación.
- Superadmin/operación: periodo canónico, fuente y estados fail-closed.

## Notificaciones pendientes

Después de V177 aprobada, documentar notificaciones para:

- fila enviada a revisión financiera;
- presupuesto pendiente de asignación;
- intento de exportar sin filas;
- periodo sin fuente financiera;
- pago sin referencia bloqueado.

## Estado seguro

Este documento no autoriza deploy, producción, pagos, lotes, Firebase, Make o Gemini.

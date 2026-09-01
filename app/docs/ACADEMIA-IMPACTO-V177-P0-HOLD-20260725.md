# ACADEMIA — Impacto V177 P0 HOLD

## Estado

V177 no se incorpora a manuales ni cursos como comportamiento aprobado. Corte 3 continúa en HOLD.

## Conceptos que deben actualizarse después de V178 aprobada

### Presupuesto

- presupuesto planeado;
- presupuesto pendiente de asignación;
- gasto real ejecutado;
- diferencia entre presupuesto y ejecución;
- asignación de país y moneda;
- prohibición de crear cifras de ejemplo cuando falta fuente.

### Moneda

- una fila sin país/moneda no hereda la moneda del proyecto;
- la fila pasa a revisión;
- GTQ y HNL nunca se suman;
- financiamientos, CxP, CxC, movimientos y beneficios se agrupan por moneda real.

### Periodo

- una sola verdad `tenantId + projectId + periodId`;
- toda lectura y escritura financiera usa el periodo canónico;
- un adapter debe respetar el contexto `data` recibido y no usar un global distinto.

### Pagos

- devengado, por pagar y pagado son estados diferentes;
- `pagado` requiere confirmación y referencia de fuente;
- el estado actual sigue en cero pagos y cero lotes.

### Revisión

- `reviewRequired`, `financialSourceStatus`, `liquidationState` y `paymentState` producen una bandeja fail-closed;
- filas con moneda incompleta no pueden habilitar pago, lote ni exportación engañosa.

## Rutas por rol

- Admin: Dashboard Financiero, Movimientos/Tesorería, revisiones y exportaciones.
- Shopper: Beneficios por moneda y pago confirmado.
- Validación DEV: identidad controlada; no equivale a Auth real.

## Regla de publicación académica

No actualizar manuales finales hasta que V178 pase R26/R27/R28/R29, se valide con la fuente TyA, se abran PDF/Excel y Paula apruebe visualmente Corte 3.

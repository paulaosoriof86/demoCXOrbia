# ACADEMIA — Impacto V178 P0 HOLD

## Estado

V178 no se incorpora a Academia como comportamiento aprobado. Sus mejoras se conservan como referencia, pero los P0 residuales deben corregirse en V179 y validarse sobre la fuente TyA.

## Conceptos que deben quedar explícitos después de V179

### Moneda faltante

- una fila sin país/moneda no hereda la moneda del proyecto;
- queda `Pendiente de moneda`;
- no participa en totales, margen, pago, lote ni export monetario;
- pasa a revisión humana.

### Multimoneda en reportes

- tablas y gráficas se separan por moneda;
- GTQ y HNL nunca se suman sin tasa y fuente autorizadas;
- una gráfica Ingreso/Egreso debe tener serie por moneda o reporte separado.

### Presupuesto

- presupuesto planeado no es gasto ejecutado;
- presupuesto sin país/moneda permanece sin asignación;
- no se rotula con la primera moneda;
- no afecta margen hasta tener distribución confirmada.

### Financiamientos y CxP/CxC

- país/moneda debe definirse antes del monto;
- un registro incompleto queda en revisión;
- devolución, abono y pago se bloquean sin moneda.

### Lotes

- moneda es parte del contrato del lote;
- un lote sin moneda no puede presentarse como Q o L ni marcarse pagado;
- lote preview y pago confirmado son estados diferentes.

### Exportación

- PDF/Excel/PPT no deben incluir moneda no resuelta como valor monetario válido;
- filas pendientes se bloquean o se llevan a una sección de revisión separada;
- el archivo real debe abrirse y conservar proyecto, periodo, país y moneda.

## Rutas por rol

- **Admin/Finanzas:** revisión de moneda, presupuesto, CxP/CxC, financiamientos, lotes y exportación.
- **Shopper:** Beneficios conserva moneda real y pago confirmado.
- **Cliente:** reportes financieros solo con fuentes y monedas confirmadas.

## Manuales y cursos pendientes

Actualizar únicamente después de V179 GO y validación visual:

- Manual de Finanzas;
- Manual de Movimientos y Tesorería;
- Manual de Liquidaciones y Lotes;
- curso de operación financiera source-safe;
- errores frecuentes de moneda, presupuesto y exportación.

## Sin impacto aprobado todavía

No cambiar cursos publicados ni afirmar que Corte 3 está cerrado mientras R30 permanezca HOLD.

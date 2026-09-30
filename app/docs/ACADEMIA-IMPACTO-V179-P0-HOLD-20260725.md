# ACADEMIA — Impacto V179 P0 HOLD

## Estado

V179 no se incorpora como comportamiento aprobado. Sus mejoras de bandeja y agrupación por moneda se preservan, pero los P0 operativos deben corregirse en V180 y validarse sobre la fuente TyA.

## Conceptos que deben quedar explícitos después de V180

### Periodo financiero único

- Dashboard, Movimientos y presupuesto usan la misma identidad canónica;
- no se mezcla id de proyecto, id de periodo y mes `YYYY-MM`;
- cambiar el periodo cambia todas las lecturas coherentemente.

### Moneda pendiente

- una fila sin moneda existe solo en revisión;
- no entra a KPI, tabla monetaria, drill, gráfica ni export;
- no se presenta como `pending_currency` dentro de `ui.money`;
- no habilita guardar, abonar, devolver, pagar o agrupar lote.

### Formularios financieros

- país/moneda se elige antes del monto;
- el rótulo monetario cambia según país;
- un formulario incompleto falla cerrado;
- una fila histórica incompleta puede corregirse desde edición.

### Estados honestos

- financiamiento con saldo y moneda pendiente no está saldado;
- lote sin moneda no está pagado;
- bandeja visible y acción bloqueada deben expresar el mismo contrato.

### Exportación

- el export se bloquea mientras existan revisiones no resueltas;
- el conteo del resumen coincide con las filas exportadas;
- PDF y Excel se descargan y abren realmente;
- no se depende de secciones custom no soportadas por el runtime.

## Rutas por rol

- **Admin/Finanzas:** revisión de moneda, presupuesto, movimientos, CxP/CxC, financiamientos, lotes y exportación.
- **Shopper:** Beneficios conserva moneda real y pago confirmado.
- **Cliente:** reportes financieros únicamente con periodo, fuente y moneda confirmados.

## Manuales y cursos pendientes

Actualizar solo después de V180 GO y validación visual:

- Manual de Finanzas;
- Manual de Movimientos y Tesorería;
- Manual de Liquidaciones y Lotes;
- curso financiero source-safe;
- errores frecuentes de periodo, moneda, presupuesto y exportación.

## Sin impacto aprobado todavía

No cambiar cursos publicados ni afirmar que Corte 3 está cerrado mientras R31 permanezca HOLD.

# PENDIENTES PROTOTIPO — Addendum V179 P0 HOLD

## P0 vivos para V180

1. Unificar presupuesto con una sola identidad de periodo en Dashboard y Movimientos.
2. Eliminar totales crudos anteriores al filtro de moneda.
3. Excluir `pending_currency` de ingresos por tipo, tablas, drill y KPIs.
4. Financiamientos: listener de país, moneda reactiva y guardado fail-closed.
5. Movimientos: listener de país, moneda reactiva y guardado fail-closed.
6. CxP/CxC nuevas: exigir país/moneda antes del monto.
7. CxP/CxC existentes: permitir resolver país/moneda desde edición.
8. Bloquear Abonar sin moneda.
9. Financiamiento activo sin moneda: revisión, nunca `saldado`.
10. Bloquear Devolver sin moneda.
11. Bloquear `Pagar lote` cuando exista revisión de moneda.
12. Lote `pending_currency`: revisión, sin estado pagado ni monto Q/L.
13. Bloquear export mientras existan filas sin moneda.
14. Hacer coincidir conteo del resumen con filas realmente exportadas.
15. Eliminar texto residual `y queda editable` y corregir markup.

## Evidencia todavía pendiente

- mayo 2026 con 42 exactas y 2 revisiones GT;
- cambio mayo ↔ julio;
- mismo presupuesto en Dashboard/Movimientos;
- formulario monetario bloqueado sin país;
- fila pendiente fuera de KPIs y drill;
- Abonar/Devolver/Pagar lote bloqueados;
- lote sin moneda en revisión;
- PDF y Excel reales abiertos;
- viewport móvil;
- host DEV autorizado y host no autorizado;
- shopper HNL sin Q 0.

## P1/P2 observados

- `Preview operativo` y acciones de pago deben distinguir claramente simulación de ejecución;
- revisar series financieras derivadas para que no se presenten como histórico confirmado;
- armonizar copy de presupuesto planeado, asignado y ejecutado después del GO.

## Bloqueo

V179 no puede empalmarse. Corte 3 permanece HOLD y Corte 4 no inicia.

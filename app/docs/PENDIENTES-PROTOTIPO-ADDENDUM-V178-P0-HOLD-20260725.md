# PENDIENTES PROTOTIPO — Addendum V178 P0 HOLD

## P0 vivos para V179

1. Movimiento sin moneda debe entrar a revisión antes de `bump()`.
2. `pendingCurrencyRows` debe ser visible, contable y accionable solo como revisión.
3. Export de Movimientos debe bloquear o separar filas sin moneda.
4. Gráfica de exportación debe agrupar por moneda y nunca sumar GTQ/HNL.
5. Presupuesto mensual no puede usar la primera moneda del proyecto.
6. El formulario de presupuesto debe exigir asignación de país/moneda o mantenerse sin moneda.
7. Eliminar copy de `＋ Mes siguiente` ya retirado.
8. Financiamientos no pueden usar `p.currency[f.pais] || cur`.
9. Alta/devolución de financiamiento debe resolver moneda según país.
10. CxP/CxC manuales y edición deben exigir país/moneda antes del monto.
11. Lote con moneda faltante debe permanecer en revisión, sin fallback Q/L.
12. Dashboard debe leer presupuesto desde el contexto `data` recibido.

## Evidencia todavía pendiente

- mayo 2026 con 42 exactas y 2 revisiones GT;
- cambio mayo ↔ julio;
- prueba de registro sin moneda;
- export fail-closed;
- gráfica por moneda;
- presupuesto sin moneda inventada;
- financiamientos GT/HN y sin moneda;
- CxP/CxC sin moneda;
- lote sin moneda;
- PDF y Excel abiertos;
- viewport móvil;
- host DEV autorizado y host no autorizado.

## P1/P2 observados

- textos de Dashboard todavía hablan de semáforo `real vs presupuestado` aunque no existe ejecución financiera confirmada;
- `CX.fin.serieMensual()` y `serieAnual()` conservan series derivadas/estimadas; no deben exponerse como histórico confirmado;
- revisar labels de `Preview operativo` y acciones de pago/lote para que no parezcan ejecución real.

## Bloqueo

V178 no puede empalmarse. Corte 3 permanece HOLD y Corte 4 no inicia.

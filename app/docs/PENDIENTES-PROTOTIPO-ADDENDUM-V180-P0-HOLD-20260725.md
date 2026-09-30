# PENDIENTES PROTOTIPO — Addendum V180 P0 HOLD

## P0 vivos para V181

1. Excluir filas review/pending de todas las métricas y exports monetarios.
2. Eliminar herencia automática de presupuesto al leer un periodo vacío.
3. Eliminar doble conteo de CxP, liquidaciones y financiamientos.
4. Resolver moneda en edición de liquidaciones.
5. Export de liquidaciones con moneda y bloqueo fail-closed.
6. Eliminar fallback de primera moneda en CxP histórica.
7. Bloquear pago de CxP histórica sin moneda.
8. Lote en revisión: sin monto monetario, pago ni export.
9. Beneficios: superficie visible para moneda faltante y exclusión de agregados.
10. Ejecutar R26–R32 hasta PASS.

## Pruebas post-apply, no otra candidata

Después de V181 source-GO y empalme directo:

- 44/42/2/32/10/209/207 sobre mayo TyA;
- mayo ↔ julio;
- viewport móvil;
- host DEV autorizado/no autorizado;
- PDF y Excel descargados y abiertos;
- shopper HNL sin Q 0.

La ausencia previa de estas evidencias no habilita R33 ni otra ronda frontend.

## P1/P2

- revisar el botón de comprobante de Beneficios;
- mantener fixtures de lotes inequívocamente demo;
- no presentar series derivadas como histórico confirmado.

## Bloqueo

V180 no puede empalmarse. Corte 3 permanece HOLD y Corte 4 no inicia.

# PENDIENTES PROTOTIPO — Addendum V181 P0 HOLD

## P0 vivo para V182

1. `PENDING_CURRENCY` no puede usarse en Lotes si solo existe dentro de Movimientos.
2. `currencyOf` no puede usarse en Liquidaciones/CxP histórica si solo existe dentro de Movimientos.
3. Cada callback `CX.module` debe tener sus helpers en scope propio o usar un helper top-level explícito sin closures ajenos.
4. Lotes debe renderizar con fixtures y con lotes reales sin `ReferenceError`.
5. `Incluir CxP de meses anteriores` debe abrir con al menos una fila y mantener el bloqueo fail-closed.
6. R32 vigente debe pasar 25/25.

## Correcciones válidas que deben preservarse

- revisiones excluidas de métricas;
- presupuesto vacío sin copia automática;
- CxP sin doble contabilización;
- liquidaciones/CxP histórica con moneda fail-closed;
- lotes en revisión sin pago/export;
- Beneficios con revisión visible;
- 0 pagos y 0 lotes reales.

## Evidencia post-apply todavía pendiente

- mayo 2026: 44/42/2/32/10/209/207;
- mayo ↔ julio;
- viewport móvil;
- host DEV autorizado y no autorizado;
- PDF y Excel descargados y abiertos;
- shopper HNL sin Q 0.

Estas evidencias no justifican R33 ni otra candidata cuando R26–R32 vigentes pasen.

## Bloqueo

V181 no puede empalmarse. Corte 3 permanece HOLD y Corte 4 no inicia.

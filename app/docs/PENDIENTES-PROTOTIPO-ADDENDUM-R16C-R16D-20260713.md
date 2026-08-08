# Pendientes prototipo — R16C y R16D

Fecha: 2026-07-13

## P0

No existe P0 frontend nuevo.

El bloque R16C/R16D es backend/source-safe y no requiere nueva candidata Claude.

## P1 acumulado

1. Mantener separados visualmente:
   - control de liquidación;
   - fila financiera exacta enlazada;
   - pendiente de fuente financiera;
   - revisión requerida;
   - pago confirmado.
2. No presentar 572 controles como 572 pagos.
3. No presentar 196 overlays exactos como pagos confirmados.
4. Mostrar 51 filas financieras en revisión y cola financiera total 92 solo donde corresponda a roles administrativos.
5. Mantener gap shopper 210/213 sin fusionar por nombre.
6. Mantener certificaciones carryover como pendientes de fuente materializable.
7. Conservar copy honesto: `not_confirmed`, `review_required`, `pending_exact_source_link`.

## No tocar

- contracts/adapters/tools/workflows;
- source lock V110;
- materialization plans;
- provider gates;
- rules, secrets o datos source-safe;
- pagos o certificaciones reales.

## Clasificación

- **Reusable CXOrbia:** representación de estados de materialización.
- **Exclusivo cliente:** conteos TyA/Cinépolis.
- **Claude/prototipo:** P1 de copy y estados.
- **Academia:** flujo control → overlay → revisión → confirmación.
- **Sin impacto Claude:** cuota Firestore, CI y artifacts.

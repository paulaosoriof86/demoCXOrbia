# RESUMEN PARA CLAUDE — R18C OVERLAYS EXISTENTES EN PLAN FIRESTORE

Fecha: 2026-07-15

Este bloque es backend/CI y no requiere nueva candidata ni cambios del prototipo.

## Estado consumible por frontend futuro

- V131 continúa como baseline activa.
- 196 visitas/liquidaciones tienen enlace financiero exacto R14C.
- Ese enlace no equivale a pago.
- Estado visible correcto: `pending_financial_review` o equivalente honesto.
- No mostrar `pagado`, lote confirmado ni fecha de pago sin evidencia de fecha, lote y actor.
- 92 casos financieros permanecen en revisión.
- Certificaciones carryover siguen pendientes de fuente; no volver a solicitarlas automáticamente hasta revisar la fuente real.
- 216 shoppers protegidos en el snapshot canónico actual.

## Acción Claude

Ninguna derivada de este bloque. No crear importadores, no recalcular R14C, no modificar `core` ni módulos y no generar nueva candidata.

## Academia

Conservar la explicación de:

- enlace financiero exacto vs pago confirmado;
- revisión humana;
- certificación presentada pendiente de carryover materializable;
- dry-run vs importación ejecutada.

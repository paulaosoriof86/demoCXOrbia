# Cambios outbox sync asignaciones

Fecha: 2026-07-07

Bloque completado:

- Se agrego contrato seguro de outbox para futura integracion plataforma ↔ HR.
- Se documento envelope minimo y estados permitidos.

Archivos creados:

- `tools/migration/tya-assignment-sync-outbox-contract.mjs`
- `app/docs/ASSIGNMENT-SYNC-OUTBOX-CONTRACT-PHASE-A-20260707.md`
- `app/docs/CAMBIOS-ASSIGNMENT-SYNC-OUTBOX-20260707.md`

Reglas:

- `queued_reviewed` requiere shopperId.
- `blocked_conflict` no se envia.
- `blocked_missing_key` no se envia.

Claude:

- No hay pendiente importante nuevo para Claude.
- Solo avisar si se necesita UI adicional para estados de sync, revision o conflictos.

Estado seguro: sin proveedores, sin HR writes, sin Firestore writes, sin imports y sin produccion.

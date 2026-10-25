# Cambios assignment sync conflict preview

Fecha: 2026-07-07

Bloque completado:

- Se agrego herramienta segura de preview para sincronizacion plataforma ↔ HR.
- Se documento la politica de llaves estables y revision de conflictos.

Archivos creados:

- `tools/migration/tya-assignment-sync-conflict-preview.mjs`
- `app/docs/ASSIGNMENT-SYNC-CONFLICT-PREVIEW-PHASE-A-20260707.md`
- `app/docs/CAMBIOS-ASSIGNMENT-SYNC-CONFLICT-PREVIEW-20260707.md`

Decisiones modeladas:

- platform_to_hr.
- hr_to_platform.
- already_synced_noop.
- conflict_review_required.
- missing_stable_key.

Regla:

- No deduplicar por coincidencia visual simple.
- No sobrescribir conflictos silenciosamente.
- Conflictos van a revision.

Claude:

- No hay pendiente nuevo importante para Claude.
- Solo avisar si se necesita nueva UI para mostrar conflictos o estados de revision.

Estado seguro: sin HR writes, sin Firestore writes, sin imports, sin proveedores y sin produccion.

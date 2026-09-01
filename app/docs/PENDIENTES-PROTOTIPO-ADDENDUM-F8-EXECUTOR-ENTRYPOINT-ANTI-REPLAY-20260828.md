# PENDIENTES PROTOTIPO — ADDENDUM F8 ENTRYPOINT Y ANTI-REPLAY

Fecha: 2026-08-28

No se abre ningún pendiente nuevo de prototipo por este bloque. El hallazgo y la reparación pertenecen al mecanismo backend F8.

Pendiente real único del camino crítico: ejecutar la autorización F8 vigente cuando exista un canal provider seguro, usando el entrypoint `tools/release/tya-f8-backup-restore-cutover-cli.mjs`, y reconciliar inmediatamente el resultado canónico. No hay autorización consumida ni mutación provider iniciada en este bloque.

No modificar UI, `app/modules`, `app/core`, Academia ni solicitar nueva candidata por este repair.

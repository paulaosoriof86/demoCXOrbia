# RESUMEN PARA CLAUDE — Addendum F8 executor source repair

Fecha: 2026-08-28

Este bloque es exclusivamente backend/tooling de F8 y **no requiere modificación frontend**.

Se reparó `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` para que el gate de linaje use la evidencia de autorización inmutable y la ancestry real de Git, y para que la autorización single-use solo se marque consumida cuando vaya a iniciarse la primera mutación provider.

No tocar:
- `/app/modules`;
- `/app/core`;
- login, roles, vistas, Academia o flujos visuales por este cambio;
- release funcional congelado.

Estado: Phase A `100/100`, Production Real Readiness `95/100`, autorización F8 vigente/no consumida, provider writes `0`.

No hay tarea para Claude derivada de este repair.

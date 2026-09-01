# PHASE A — Tracker · Corte 4 VIS-02 P0

**Fecha:** 2026-07-29

## Corte 3

`FROZEN_ACTIVE_BASELINE` — sin cambio.

## Corte 4

Objetivo vigente: Firebase nuevo/vacío + `CX.data` read-only + misma interfaz + cero writes.

- Firebase nuevo/vacío: PASS.
- Rules/Auth bootstrap: PASS.
- Protected read smoke: PASS.
- Hosting inicial: PASS.
- P0-C4-VIS-01 demo fallback: corregido y revalidado PASS.
- Revalidación humana posterior: detecta P0-C4-VIS-02.

### P0 activo

`P0-C4-VIS-02 — EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`.

### Gates pendientes

1. autorización expresa VIS-02;
2. patch shell/core focalizado;
3. gate browser backend vacío + cambio de rol;
4. un Hosting DEV controlado si Paula lo autoriza;
5. revalidación humana;
6. freeze Corte 4 si PASS;
7. IAM temporal a Viewer;
8. Corte 5 materialización DEV.

Corte 5 no se adelanta para tapar el bug del backend vacío.

# CHECKPOINT OPERATIVO — Corte 4 · VIS-02 P0

**Fecha:** 2026-07-29  
**Estado vivo:** `CORTE3_FROZEN__CORTE4_VIS01_FIXED__VIS02_P0_PROVEN__FREEZE_BLOCKED__NO_DATA_WRITES`

## Corte 3

Permanece `FROZEN_ACTIVE_BASELINE`. No se reabre.

## Corte 4

P0-C4-VIS-01 quedó corregido: no hay fallback demo, Firestore aparece activo, fixtures=false, 0/0/0/0.

La revalidación humana demostró un segundo P0:

`P0-C4-VIS-02 — EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`.

Administración queda en blanco con backend vacío. La causa está localizada en el shell/core: router y vista inicial presuponen periodo/proyecto; además el shell previo no se limpia al cambiar de rol, por lo que un fallo Admin puede dejar visible el DOM Shopper anterior.

## Estado seguro

- PR #7 draft/open/no merge.
- Firestore sigue vacío.
- No materialización.
- No data writes.
- No Hosting adicional autorizado.
- Producción/merge/imports/pagos/HR/Make/Gemini: 0.

## Gate vivo exacto

`AUTORIZACIÓN EXPRESA P0-C4-VIS-02 → PATCH CORE FOCALIZADO → GATE EMPTY-BACKEND + ROLE-SWITCH → UN HOSTING DEV CONTROLADO → REVALIDACIÓN HUMANA → FREEZE CORTE 4 SI PASS → IAM Viewer → CORTE 5`.

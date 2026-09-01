# CHECKPOINT OPERATIVO — Corte 4 VIS-02 · deploy 1 consumido · dangling script localizado

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN__CORTE4_VIS01_FIXED__VIS02_CORE_FIX_LOCAL_PASS__VIS02_DEPLOY1_CONSUMED__REMOTE_BLOCKED_BY_DANGLING_SCRIPT__REDEPLOY_NOT_AUTHORIZED`

## Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción/merge: 0.

## Corte 3
Permanece `FROZEN_ACTIVE_BASELINE` sobre `CXORBIA-TYA-CORTE3-V182-20260729`. No se reabre.

## Corte 4 — seguridad preservada
- Firebase DEV: `cxorbia-tya-dev-260729-c4`.
- Firestore vacío.
- Firestore document writes: 0.
- Auth users permanentes: 0.
- Email/Password: deshabilitado.
- Storage/Rules/Functions/imports/HR/Make/Gemini/pagos: 0 writes en este bloque.
- Producción: false.
- Merge: false.

## P0-C4-VIS-02 — corrección core
Autorización consumida: `Autorizo corrección focalizada de P0-C4-VIS-02 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`.

Corrección aplicada sin tocar `app/modules`:
- `app/core/backend-corte4-empty-shell-guard.js`: empty-backend first-class, null guards, shell estable y limpieza de DOM entre roles.
- `app/index-backend-dev.html`: carga del guard antes de `app.js`.

Gate local final antes del deploy:
- preflight: PASS;
- `cxorbia/c4p0vis02-diag-local-pass`: PASS;
- secuencia probada: Admin vacío → logout → Shopper vacío → logout → Admin vacío, sin shell Shopper residual.

## Único Hosting autorizado
El request `c4-p0-vis02-revalidate-20260729-01` ejecutó exactamente un Hosting DEV.

Deployed source: `548e5f89c5d077686611d1904f4166d3188a2ccd`.

Statuses:
- `cxorbia/c4p0vis02-deploys1=success`;
- `cxorbia/c4p0vis02-revalidation=error`.

La autorización de Hosting quedó consumida. No se permite un segundo deploy con esa autorización.

## Causa exacta del error remoto
El error remoto no reabrió el crash de shell: el probe funcional no reportó fallos Admin/Shopper/role-switch; reportó `Unexpected token '<'`.

El probe HTTP read-only demostró una única referencia de script rota:

`adapters/tya-phase-a-source-safe-dev-adapter.js`

- el archivo no existe en el repo/deployed source;
- `index-backend-dev.html` sí lo referenciaba;
- Firebase Hosting, por el rewrite `** → index-backend-dev.html`, respondía `200` a la URL `.js` con cuerpo `<!DOCTYPE html...>`;
- el navegador intentaba parsear HTML como JavaScript y generaba el pageerror.

Esto es `P0-C4-VIS-02B — DANGLING_ENTRYPOINT_SCRIPT_REWRITTEN_AS_HTML` y explica el bloqueo remoto reproducible.

## Corrección ya aplicada en repo, aún no desplegada
- se eliminó exclusivamente la referencia muerta `adapters/tya-phase-a-source-safe-dev-adapter.js` de `app/index-backend-dev.html`;
- no se creó un adapter ficticio ni se reactivó source-safe legacy;
- se agregó gate reutilizable `tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs`;
- gate CI `cxorbia/c4-entrypoint-script-integrity=success`: todas las referencias locales de scripts del entrypoint resuelven; única excepción explícita es `core/backend-dev-auth.local.js`, generado por el runner.

## Gate vivo exacto
La fuente corregida está preparada pero NO se ha vuelto a desplegar.

Siguiente paso: **nueva autorización expresa para exactamente 1 Hosting DEV de revalidación final de VIS-02B**, sin Firestore/Auth/Storage/Rules/Functions/HR/imports/Make/Gemini/pagos/producción/merge writes.

Después: remote browser PASS + validación visual humana → freeze Corte 4 → retirar IAM temporal a Viewer → Corte 5 materialización DEV.

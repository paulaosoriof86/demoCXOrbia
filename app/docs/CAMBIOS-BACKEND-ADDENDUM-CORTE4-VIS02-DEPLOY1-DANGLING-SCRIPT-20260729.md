# CAMBIOS BACKEND — Corte 4 · VIS-02 deploy 1 + dangling script

**Fecha:** 2026-07-29  
**Estado:** `CORE_FIX_LOCAL_PASS__DEPLOY1_CONSUMED__REMOTE_DANGLING_SCRIPT_FIXED_IN_REPO__FINAL_REDEPLOY_PENDING_AUTH`

## Archivos funcionales tocados
- `app/core/backend-corte4-empty-shell-guard.js`: empty-backend como estado válido; no monta módulos dependientes de proyecto cuando `projects=[]`; null-guards; limpia rail/view/crumb y clase Shopper al cambiar de rol.
- `app/index-backend-dev.html`: carga el guard antes de `app.js`; posteriormente se eliminó referencia inexistente a `adapters/tya-phase-a-source-safe-dev-adapter.js`.

No se modificó ningún archivo de `app/modules/`.

## Gates y runner
- `tools/release/cxorbia-corte4-p0-vis02-hosting-prepare.mjs`.
- `.github/workflows/cxorbia-corte4-p0-vis02-revalidate.yml`.
- diagnostics read-only de VIS-02.
- `tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs` + workflow CI.

## Resultado
- role-switch local: PASS.
- un único Hosting DEV autorizado: ejecutado y consumido.
- deployed source: `548e5f89c5d077686611d1904f4166d3188a2ccd`.
- deploy count: PASS=1.
- remote gate: bloqueado por `Unexpected token '<'`.
- probe de scripts: una única ruta mala, `adapters/tya-phase-a-source-safe-dev-adapter.js`, inexistente y reescrita por Hosting a HTML con 200.
- referencia muerta eliminada del repo.
- gate de integridad de entrypoint posterior: PASS.

## Seguridad
Firestore/Auth/Storage/Rules/Functions/imports/HR/Make/Gemini/pagos/merge/producción: 0 writes. No segundo deploy ejecutado.

## Clasificación
- **Reusable CXOrbia:** empty-backend shell + gate anti-dangling-script para Hosting con rewrites.
- **Exclusivo cliente:** projectId DEV `cxorbia-tya-dev-260729-c4`.
- **Claude/prototipo:** sin módulos UI; no nueva candidata.
- **Academia:** documentar que un rewrite puede convertir un 404 JS en `200 text/html`/HTML y que los entrypoints deben validar existencia de todos los assets.
- **Sin impacto Claude:** runners, provider preflight, proof y autorización one-shot.

## Pendiente real
Un nuevo Hosting DEV requiere nueva autorización porque el único deploy permitido ya se consumió antes de descubrir el asset roto remoto.

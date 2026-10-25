# Cambios backend addendum - smoke workflow noise reduction

Fecha: 2026-07-06

## Bloque completado

Se redujo el ruido de ejecuciones del workflow `CXOrbia Phase A RC Smoke Gate` para evitar que cada documento en `app/docs/**` dispare un nuevo run.

## Archivo modificado

- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`

## Archivos creados

- `app/docs/SMOKE-WORKFLOW-NOISE-REDUCTION-POST-V89-20260706.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-SMOKE-WORKFLOW-NOISE-REDUCTION-20260706.md`

## Qué cambió

El workflow ya no escucha todo `app/**`. Ahora escucha solo archivos y carpetas con impacto de runtime/gate:

- `app/index.html`
- `app/app.js`
- `app/core/**`
- `app/modules/**`
- `app/styles/**`
- `app/manifest.webmanifest`
- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`
- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`

## Por qué

La documentación obligatoria vive en `app/docs/**`. Como se están creando muchos addenda para continuidad, esos commits no deben producir runs del smoke gate si no tocan runtime.

## Estado seguro

Sin deploy, sin producción, sin merge final, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real, sin import real y sin datos sensibles.

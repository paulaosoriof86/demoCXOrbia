# Smoke workflow noise reduction post V89 - CXOrbia TyA

Fecha: 2026-07-06

## Bloque completado

Se ajustó el workflow `CXOrbia Phase A RC Smoke Gate` para reducir correos y ejecuciones fallidas/noisy cuando solo se agregan documentos.

## Causa del ruido

El workflow estaba configurado para correr con cualquier cambio bajo `app/**`.

Como la documentación del proyecto vive en `app/docs/**`, cada addendum/documento creado disparaba un nuevo smoke run, aunque no cambiara runtime.

Esto generaba múltiples notificaciones y podía confundir el diagnóstico de fallos reales.

## Corrección aplicada

Archivo modificado:

- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`

Antes:

- `app/**`

Después:

- `app/index.html`
- `app/app.js`
- `app/core/**`
- `app/modules/**`
- `app/styles/**`
- `app/manifest.webmanifest`
- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`
- `.github/workflows/cxorbia-phase-a-rc-smoke.yml`

## Efecto esperado

- Los cambios documentales en `app/docs/**` ya no deberían disparar el workflow por sí solos.
- Los cambios de runtime sí siguen disparando el smoke gate.
- El workflow conserva `workflow_dispatch` para ejecución manual cuando se necesite.

## Decisión técnica

No se eliminó el smoke gate. Solo se restringió a cambios con impacto real en runtime o gate.

## Estado seguro

Sin deploy, sin producción, sin merge final, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real, sin import real y sin datos sensibles.

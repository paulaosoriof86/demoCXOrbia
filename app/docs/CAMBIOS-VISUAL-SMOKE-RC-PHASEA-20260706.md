# Cambios visual smoke RC Phase A

Fecha: 2026-07-06

Se agrego smoke visual automatizado para avanzar desde gate tecnico hacia RC Phase A controlada.

Archivos:

- `tools/qa/tya-phase-a-visual-smoke.mjs`
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`
- `app/docs/PHASE-A-VISUAL-SMOKE-WORKFLOW-20260706.md`
- `app/docs/CAMBIOS-VISUAL-SMOKE-RC-PHASEA-20260706.md`

El smoke visual usa Playwright y servidor local. No hace deploy, no usa produccion, no escribe base de datos, no importa datos y no llama proveedores reales.

Cubre login, pantallas admin, pantallas shopper, Academia, funcion de cuestionario, errores de consola, vistas en blanco y textos visibles no honestos.

Siguiente paso: revisar el run `CXOrbia Phase A Visual Smoke`. Si pasa, preparar RC Phase A controlada. Si falla, corregir causa puntual.

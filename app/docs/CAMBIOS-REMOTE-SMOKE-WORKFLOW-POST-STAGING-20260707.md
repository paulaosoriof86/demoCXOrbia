# Cambios remote smoke workflow post-staging

Fecha: 2026-07-07

## Bloque completado

Se agrego workflow manual para smoke remoto post-staging.

## Archivos creados

- `.github/workflows/cxorbia-phase-a-remote-smoke.yml`
- `app/docs/REMOTE-SMOKE-WORKFLOW-POST-STAGING-CXORBIA-20260707.md`
- `app/docs/CAMBIOS-REMOTE-SMOKE-WORKFLOW-POST-STAGING-20260707.md`

## Reusable CXOrbia

- Workflow reusable para validar cualquier URL staging/preview.
- Reduce pasos manuales.
- Genera artifact de evidencia.

## Exclusivo cliente

- El script de smoke mantiene nombre TyA por Phase A actual, pero el workflow es reusable.

## Claude/prototipo

- No cambia UI.
- Ayuda a detectar si nuevas candidatas rompen rutas, roles, copy honesto o Academia.

## Academia

- Valida carga de Academia en staging.

## Necesito de Paula

Solo si aparece URL de staging o falla GitHub Actions.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports, sin lectura de secrets y sin datos sensibles.

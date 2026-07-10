# P0 DEV root TyA source-safe preview deployed

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Resultado

La observacion de Paula fue correcta: el primer smoke sobre la URL DEV mostro datos demo/comerciales y no TyA/Cinepolis.

Ese resultado se clasifica como `NO_GO_DATA_SOURCE`.

## Correccion aplicada

Se implemento y desplego una vista DEV root con overlay source-safe TyA/Cinepolis.

URL DEV:

`https://cxorbia-backend-dev.web.app`

## Archivos clave

- `app/core/tya-phase-a-source-safe-preview.js`
- `app/index.html`
- `app/sw.js`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`

## Workflow verificado

Run: `29061976427`
Job: `RC Phase A DEV root deploy hosting only`

Pasos en success:

- Predeploy gate.
- Drift gate.
- Secret availability and JSON sanity check.
- Firebase CLI access check.
- Deploy Hosting DEV root.
- Verify DEV root URL.

## Contenido esperado en la URL

La URL DEV debe mostrar TyA/Cinepolis source-safe:

- tenant visible: TyA;
- proyecto visible: Cinépolis Junio 2026;
- periodo: JUN 2026;
- 44 visitas;
- GT 34 / HN 10;
- shoppers con referencias opacas;
- sin DPI, banco, telefono, correo, HR URL privada, workbook crudo ni evidencia cruda.

## Alcance seguro

No es produccion. No es merge final. No activa Firestore/Auth/Storage reales. No activa HR/Make/Gemini. No importa datos. No ejecuta pagos.

## Siguiente paso

Paula debe recargar la URL con hard refresh si ve cache viejo. Si la vista muestra TyA/Cinepolis, se puede repetir smoke focalizado sobre datos source-safe.

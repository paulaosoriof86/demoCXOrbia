# Drift gate fix - staging workflow allowlist

Fecha: 2026-07-07

## Bloque completado

Se detecto que el workflow de staging podia quedar bloqueado por el drift gate porque el allowlist inicial solo permitia documentacion, el workflow del drift gate y sus tools directos.

## Causa

Despues del runtime validado `009c5958fed878a739b129916d1958ef22d4267b`, se agrego el workflow:

- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`

Ese archivo es release/staging controlado, no runtime de la app, pero no estaba incluido en el allowlist del drift gate.

## Correccion aplicada

Archivo modificado:

- `tools/release/tya-rc-phase-a-drift-gate.mjs`

Se agregaron al allowlist:

- `.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml`
- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`

## Decision

Esto no cambia runtime de la app.

Permite que cambios de release/predeploy/staging no bloqueen el drift gate mientras no haya cambios en `app/index.html`, `app/app.js`, `app/core/**`, `app/modules/**`, `app/styles/**` o `app/manifest.webmanifest` posteriores al runtime validado.

## Claude

No hay pendiente nuevo importante para Claude.

Es ajuste de release/gate, no UX/prototipo.

## Estado seguro

Sin produccion real, sin merge final, sin reglas, sin proveedores reales, sin imports y sin datos sensibles.

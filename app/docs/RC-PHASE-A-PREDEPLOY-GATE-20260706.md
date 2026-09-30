# RC Phase A predeploy gate

Fecha: 2026-07-06

## Bloque completado

Se agrego un predeploy gate seguro para validar configuracion antes de cualquier movimiento de preview/staging o produccion controlada.

## Archivos creados

- `tools/release/tya-rc-phase-a-predeploy-gate.mjs`
- `.github/workflows/cxorbia-rc-phase-a-predeploy-gate.yml`
- `app/docs/RC-PHASE-A-PREDEPLOY-GATE-20260706.md`

## Que valida

El gate revisa:

- `firebase.json` presente.
- `.firebaserc` presente.
- Hosting public = `app`.
- Target hosting esperado = `cxorbia-dev`.
- Rewrite SPA hacia `/index.html`.
- Headers UTF-8 para HTML, JS, CSS, JSON y webmanifest.
- `app/index.html` con `<meta charset="UTF-8">`.
- `app/core/production-copy-guard.js` cargado.
- Orden del guard despues de `core/ui.js` y antes de modulos.
- Presencia de herramientas de smoke tecnico, visual y drift.
- Presencia de documentos de decision/predeploy.
- Escaneo basico de secretos o patrones sensibles.

## Resultado esperado

### GO_PREDEPLOY_CONTROLLED_WITH_GATES_CLOSED

Permite preparar preview/staging controlado, siempre con gates cerrados.

### NO_GO_PREDEPLOY

Bloquea si falta configuracion esencial, si hay riesgo de target productivo, si falta el guard o si aparece patron sensible.

## Advertencias esperadas

Es normal que el gate advierta que `firebase.json` declara reglas Firestore/Storage. Eso no significa que se vayan a desplegar.

La regla operacional sigue siendo:

- deploy hosting solamente cuando se autorice;
- no deploy de reglas;
- no imports;
- no proveedores reales.

## Estado Firebase actual observado

`firebase.json` usa:

- hosting target `cxorbia-dev`;
- public `app`;
- headers UTF-8 configurados.

`.firebaserc` apunta a:

- `cxorbia-backend-dev`.

## Impacto Claude

No hay pendientes nuevos importantes para Claude en este bloque.

Este bloque es release/backend/predeploy, no UX.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.

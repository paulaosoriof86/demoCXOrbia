# CAMBIOS BACKEND - V161C EMPALME DIRECTO

Fecha: 2026-07-19

## Que se hizo

- Se aplico V161C por `APPLY_DELTA_DIRECTLY` sobre un worktree limpio de `docs-tya-v6-v71-audit`.
- Se limito el delta a `app/app.js`, `app/core/config.js`, `app/core/router.js`, `app/modules/visita-detalle.js`, `app/modules/visitas.js` y `app/REPORTE-DE-CAMBIOS.md`.
- `app/index-test-base.html` no existia en la rama.
- Se genero `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Se actualizo `app/core/build-lock.js`.
- Se agrego `tools/release/tya-v161c-empalme-directo-verify.mjs`.

## Preservacion

- `app/core/data.js`, `app/core/store.js` e `app/index.html` quedaron intactos.
- Backend, adapters, tools, contratos, source-safe, integraciones, overlays y documentacion viva quedan preservados.
- `CX.data` no cambia de interfaz.

## Clasificacion

- Reusable CXOrbia: delta R21 restringido, manifest y build-lock verificables.
- Exclusivo TyA: validacion Corte 0B con semantica GT/HN, Q1/Q2 y P1Q.
- Claude/prototipo: correccion frontend localizada aplicada, sin pedir V162.
- Academia: actualizar explicacion de login/tenant/postulacion y separacion Academia/Capacitacion.
- Sin impacto Claude: preservacion backend/tools/contratos.

## Estado

`EMPALMED_PENDING_POST_GATES`

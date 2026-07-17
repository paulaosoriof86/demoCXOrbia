# CAMBIOS BACKEND - V159 EMPALME DIRECTO

Fecha: 2026-07-17

## Que se hizo

- Se ejecuto `APPLY_DELTA_DIRECTLY` sobre un worktree limpio derivado de `docs-tya-v6-v71-audit`.
- Se aplicaron runtime, modulos y evidencias historicas de la candidata V159.
- Se preservo `app/modules/importador.js` para mantener `CX.dataSource.sourceContract()`.
- Se genero `app/docs/MANIFEST-V159-EMPALME-DIRECTO-20260717.json`.
- Se actualizo `app/core/build-lock.js`.
- Se agrego `tools/release/tya-v159-empalme-directo-verify.mjs`.

## Preservacion

- Backend, contratos, adapters, tools y overlays TyA quedan preservados.
- `CX.data` mantiene tenant/proyecto/periodo como ejes separados.
- Finanzas conserva `data.project()` en `porPais()`.
- Cinepolis sigue como proyecto configurable; no se introdujo logica global.
- No se activaron proveedores reales, writes, deploy, merge ni pagos.

## Clasificacion

- Reusable CXOrbia: carril file-aware, manifest runtime y verificador reproducible.
- Exclusivo cliente: gates TyA/Cinepolis posteriores.
- Claude/prototipo: V159 queda aplicada; no pedir V160.
- Academia: validar rutas por rol y contenido tecnico protegido en smoke.
- Sin impacto Claude: preservacion de backend y locks.

## Estado

`EMPALMED_PENDING_POST_GATES`

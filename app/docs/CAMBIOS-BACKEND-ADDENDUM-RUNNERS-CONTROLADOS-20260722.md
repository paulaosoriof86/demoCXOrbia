# CAMBIOS BACKEND — ADDENDUM RUNNERS CONTROLADOS

**Fecha:** 2026-07-22  
**Estado:** `CONTROLLED_RUNNERS_BOOTSTRAPPED_NOT_ACTIVATED_NO_DEPLOY`

## Qué se hizo

Paula autorizó expresamente la creación exclusiva de:

- `CXORBIA_ATOMIC_APPLY_RUNNER`;
- `CXORBIA_READONLY_POST_GATES_RUNNER`.

Se instalaron:

- `backend/contracts/cxorbia-controlled-runners-v1.json`;
- `tools/release/cxorbia-atomic-apply-runner.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`;
- `.github/workflows/cxorbia-atomic-apply-runner.yml`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `.github/cxorbia-gate-requests/request.json` desactivado.

Se actualizaron:

- addendum maestro prevalente;
- índice de fuentes vigentes;
- checkpoint operativo.

## Función del carril atómico

El runner recibe una solicitud de control ligada a candidate/package SHA y HEAD exacto, verifica bytes por Git blob SHA y SHA-256, protege rutas, crea un único commit funcional y hace push no forzado a `docs-tya-v6-v71-audit`.

No utiliza Contents API secuencial para el delta funcional. El request se elimina en el mismo commit funcional.

## Función del carril read-only

El runner instala Playwright/Chromium únicamente en el entorno efímero y ejecuta el perfil fijo R20 + M1 + Corte 2A + verificador.

Tiene `contents: read` y no puede hacer commit/push, deploy, merge, producción, imports o writes reales.

## Validación

Gate local ejecutado:

`PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`

- blockers: 0;
- warnings: 0;
- deploy/merge/producción/data writes: false.

Los runners están instalados, pero su primera ejecución real controlada todavía está pendiente.

## Bootstrap

Los commits de instalación mediante Contents API fueron una excepción única de infraestructura autorizada porque los runners no existían. No aplicaron candidata ni delta funcional.

Desde el cierre del bootstrap, futuras candidatas frontend GO deberán usar checkout Git nativo o `CXORBIA_ATOMIC_APPLY_RUNNER`.

## Preservado

- V174 funcional;
- `CX.data`;
- backend y adapters live;
- contratos operativos;
- HR source-safe;
- overlays V174;
- PR #7 draft/open/no merge;
- producción y datos reales sin cambios.

## Clasificación

- **Reusable CXOrbia:** runners atómico y QA read-only.
- **Exclusivo cliente:** perfil inicial R20/M1/Corte 2A TyA.
- **Claude/prototipo:** sin cambio frontend; elimina dependencia de Codex para futuros empalmes.
- **Academia:** documentar integridad, evidencia y separación entre aplicación y validación.
- **Sin impacto Claude:** GitHub Actions, Playwright efímero, artifacts y permisos.

## Pendiente real

Reproducir en remoto la corrección del builder R20, activar el runner read-only contra el HEAD exacto y completar el compuesto M1 antes de cualquier Hosting DEV.

## Estado seguro

Cero deploy, merge, producción, imports, Firestore/Auth/Storage/HR writes, Make/Gemini y pagos.

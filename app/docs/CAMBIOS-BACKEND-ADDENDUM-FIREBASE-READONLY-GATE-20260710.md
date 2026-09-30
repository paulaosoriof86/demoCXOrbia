# CAMBIOS-BACKEND addendum — Firebase DEV clean-state read-only gate

Fecha: 2026-07-10

## Bloque

`Firebase DEV clean-state + Auth configuration read-only gate`.

## Archivos creados

- `backend/contracts/phase-a-firebase-dev-clean-state-read-only-gate-v1.json`;
- `backend/config/phase-a-firebase-dev-clean-state-read-only.source-safe.json`;
- `tools/release/tya-firebase-dev-clean-state-read-only.mjs`;
- `tools/release/tya-firebase-dev-clean-state-read-only-gate-validate.mjs`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml`;
- `.github/workflows/cxorbia-firebase-dev-clean-state-read-only-gate.yml`;
- `app/docs/FIREBASE-DEV-CLEAN-STATE-AUTH-READONLY-GATE-TYA-20260710.md`;
- `app/docs/CAMBIOS-FIREBASE-DEV-CLEAN-STATE-READONLY-GATE-20260710.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-FIREBASE-READONLY-GATE-20260710.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-FIREBASE-READONLY-GATE-20260710.md`;
- `app/docs/ACADEMIA-IMPACT-FIREBASE-DEV-CLEAN-STATE-READONLY-GATE-20260710.md`;
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-FIREBASE-READONLY-GATE-20260710.md`;
- este addendum.

## Qué se preparó

- gate manual-only para consultar el proveedor en modo read-only;
- verificación de proyecto y dominio de service account antes de lecturas;
- conteos sanitizados de Auth;
- configuración Auth reducida a booleanos;
- detección de contenido Firestore sin leer campos/IDs;
- detección de objetos Storage y Functions sin nombres;
- conteo de releases de reglas sin contenido;
- decisiones clean, nonempty, inconclusive y target mismatch;
- credencial temporal con cleanup obligatorio;
- artifact limitado a reporte sanitizado;
- validador estático automático sin secret ni provider calls.

## Qué permanece bloqueado

- ejecución del workflow read-only sin autorización explícita;
- usuarios y claims;
- lecturas de PII o datos de negocio;
- writes/deletes;
- reglas y Hosting deploy;
- Functions write/invoke;
- imports y producción.

## Seguridad

- el workflow proveedor solo acepta `workflow_dispatch`;
- exige `VERIFY_FIREBASE_DEV_READ_ONLY`;
- no tiene triggers push, pull_request o schedule;
- no persiste respuestas crudas;
- no exporta identificadores;
- no borra recursos detectados;
- estado inconcluso no se considera limpio.

## Impacto Phase A TyA

Protege la conexión futura de HR, shoppers, certificaciones, liquidaciones, cliente multi-proyecto, reviewQueue y `CX.data` contra un entorno DEV con residuos desconocidos. No consulta datos TyA.

## Clasificación

- **Reusable CXOrbia:** clean-state read-only, reporte count-only y no-deletion.
- **Exclusivo cliente:** ninguno.
- **Claude/prototipo:** estados honestos de readiness.
- **Academia:** interpretación del gate y escalamiento.
- **Sin impacto Claude:** APIs, credencial temporal y CI interno.

## Estado real

Gate preparado; provider-run no autorizado ni ejecutado. Sin Auth, Firestore, Storage, Functions, reglas, import, deploy o producción.

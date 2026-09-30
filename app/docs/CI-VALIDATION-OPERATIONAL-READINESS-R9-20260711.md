# CI validation — Operational Readiness R9

Fecha: 2026-07-11

## Commit validado

- Runtime V106/R8 validado previamente: `b0335ff143975abf67d50d9552c97273e15055c0`.
- Head R9 después de reconciliar drift gate: `1bb9812d038ad8bb54452c3e863d87782aeb1863`.

## R9

Workflow: `CXOrbia Phase A Operational Readiness R9`.

Resultado: SUCCESS.

Artefacto sanitizado:

- validación fail-closed: 3 PASS / 0 FAIL;
- reporte actual: `HOLD_REQUIRED_INPUTS_OR_EVIDENCE`;
- baseline/source-safe: READY;
- Firebase DEV clean-state: PENDING EVIDENCE;
- pagos/certificaciones: PENDING SOURCES;
- smoke source-safe: PENDING SMOKE;
- `materializationAuthorized=false`;
- 0 writes/import/producción/providers/pagos.

## Drift gate

La primera ejecución posterior a R9 falló porque el gate seguía anclado a un SHA anterior al empalme V106 y por tanto clasificaba como drift todo R3–R9, incluidos archivos runtime que ya habían sido validados.

No se ocultó ni se reintentó a ciegas. Se corrigió así:

1. se confirmó que `b0335ff...` tenía Visual Smoke, RC Smoke, Source Lock Verify, Runtime Guard, Period History, Materialization Plan/Executor y demás gates en SUCCESS;
2. el drift gate se reancló exactamente a `b0335ff...`;
3. se agregó a la allowlist únicamente el workflow y los dos validadores R9;
4. no se habilitaron prefixes amplios ni runtime app changes;
5. Node se actualizó a 24 por deprecación del runner.

Resultado posterior: `CXOrbia RC Phase A Drift Gate` SUCCESS.

## Matriz de workflows en head R9

SUCCESS:

- RC Phase A Predeploy Gate;
- RC Phase A Smoke Gate;
- RC Phase A Drift Gate;
- Source Safe Importers;
- Period History Integrity;
- Firestore Materialization Plan;
- Operational Readiness R9;
- DEV Auth Firestore Readiness;
- Source Lock Runtime Verify;
- Auth Pre-activation Route Action;
- Firebase DEV Clean-State Read-Only Gate estático;
- Firestore Materialization Executor;
- Liquidation Certification Source Safe;
- Source Safe Runtime Guard;
- Visual Smoke.

## Aclaración del smoke

El Visual Smoke vigente prueba seis perfiles y consola en modo demo/localStorage. Su éxito no sustituye el artefacto source-safe exigido por R9. Por eso el carril `postEmpalmeSmoke` permanece PENDING y no se presenta como cerrado.

## Estado seguro

Sin provider calls reales, sin Firebase/HR writes, sin import, sin pagos, sin deploy y sin producción.

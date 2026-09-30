# SOURCE LOCK — ITERATION 3 PRE-PROVIDER SELF-TEST SELF-REFERENCE FIX PASS — 2026-08-15

**Estado:** `LOCKED__REQUEST05_STOPPED_BEFORE_PROVIDER__ZERO_PROVIDER_WRITES__SELFREFERENTIAL_SELFTEST_FIXED__SOURCE_ONLY_GATE_PASS__REQUEST06_GATE_REQUIRED`

## Carril exacto

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata única: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- Firebase target previsto: `cxorbia-backend-dev`
- Request consumido: `cxorbia-i3-shopper-persistence-20260814-05`
- Provider workflow run: `31902822527`
- Provider workflow job: `95056069906`

## Qué ocurrió en request05

El request autorizado por Paula se ejecutó una sola vez. El gate de carril/scope PASS, pero el workflow se detuvo nuevamente en `Static I3 source preflight before provider credentials`.

La detención ocurrió antes de instalar tooling runtime, antes de cargar la service account y antes de cualquier selección/lectura/escritura de provider. Por tanto quedaron SKIPPED credential recovery, reconciliación Firestore, proxy/E2E histórico, command provider, Administración, alta/edición del Shopper nuevo y provider readback.

Efectos reales certificados por orden de ejecución:

- credential reset histórico: `0`;
- Auth writes: `0`;
- Firestore writes: `0`;
- otras identidades modificadas: `0`;
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- aceptación legal automatizada: `0`;
- deploy: `0`;
- merge: `false`;
- producción: `false`;
- retry automático: `NO`.

## Causa raíz mecánica exacta

El fix anterior había eliminado correctamente el import estático de Playwright y movido `await import('playwright')` al branch `--execute-real`. Sin embargo, el propio `sourceSelfTest()` comprobaba:

`!source.includes("from 'playwright'")`

Ese literal estaba escrito dentro de la misma expresión del test. Por tanto el archivo siempre contenía la cadena que el test pretendía demostrar ausente y el check `playwrightDeferredToRealExecution` se auto-invalidaba.

Clasificación: `I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`.

No fue un fallo de Firebase Auth, identidad, HR, NDA/confidencialidad, datos históricos ni persistencia Admin; ninguno de esos bloques llegó a ejecutarse en request05.

## Corrección source-only aplicada

1. `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`
   - reemplazó la búsqueda literal auto-referencial por un detector de líneas que reconoce únicamente un import estático real de Playwright;
   - conserva `await import('playwright')` exclusivamente dentro de `--execute-real`;
   - conserva Auth exacto, HR authority, historia, reviewQueue y legal-gate-aware;
   - conserva `acceptanceAutomated:false` y cero write APIs en el harness histórico.

2. `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`
   - el workflow existente valida ahora syntax + self-test del harness sin Playwright/provider;
   - valida además `cxorbia-i3-source-patcher.mjs --verify` y la lineage exacta de request05 para el siguiente gate;
   - no se creó workflow nuevo.

3. `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`
   - dejó de depender de literales históricos extensos del checkpoint y verifica las autoridades vivas: índice, checkpoint, plan durable, tracker, auditoría, I1/I2 y harness I3;
   - conserva 35/65 mientras I3 esté abierta.

4. `tools/qa/cxorbia-i3-source-patcher.mjs`
   - prearma la siguiente lineage exacta `request05 + I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK` en el provider materializado;
   - mantiene ACK-aware Admin create/update, exact identity y no-fuzzy.

5. `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`
   - acepta esa lineage únicamente para un futuro request nuevo;
   - imprime la evidencia JSON del source self-test antes de cualquier provider credential;
   - exige `playwrightDeferredToRealExecution:true`;
   - no ejecutó provider por estos cambios source-only.

## Gate source-only independiente

Workflow existente `CXOrbia Phase A Live Execution Checkpoint`:

- run `31903321622`;
- HEAD validado: `64f7aa28d3d3728d2f7a3749d62373cff746ffd2`;
- resultado: `SUCCESS`.

PASS en el mismo run:

- I1 source contract;
- I2 canonical persistence;
- harness histórico syntax;
- `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`;
- `legalGateAware:true`;
- `legalConsentNotAutomated:true`;
- `playwrightDeferredToRealExecution:true`;
- source patcher + next-lineage verify;
- current operational checkpoint verifier.

Este run fue source-only: `0` Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, `0` resets, `0` deploy, merge=false, producción=false.

## Preservar / no reprocesar

- I1 e I2 PASS;
- Auth owner, exact identity, Staff membership y protected HR authority;
- evidencia histórica previa `31835742956`;
- harness legal-gate-aware;
- no nueva candidata/rama/PR/Auth rebuild;
- request05 consumido: no rerun ni segundo intento automático.

## Clasificación

- **Reusable CXOrbia:** un source self-test no puede probar ausencia mediante un literal que él mismo incrusta; el gate debe reconocer la estructura real y poder ejecutarse sin tooling/provider.
- **Exclusivo TyA:** cualquier futuro reset sigue limitado al mismo único Shopper histórico exacto TyA/Cinépolis.
- **Claude/prototipo:** no rediseñar UI; el patch ACK-aware de Administración permanece preparado y todavía no fue materializado por provider execution.
- **Academia:** el gate legal sigue humano; cero aceptación/firma/guardado automatizado.
- **Sin impacto Claude:** QA, workflow, checkpoint verifier y lineage de ejecución.

## Avance

I3 no cerró. **GO-LIVE permanece 35% completado / 65% pendiente.**

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST06_AFTER_SELFREFERENTIAL_PREPROVIDER_MECHANISM_FAILURE`.

Un eventual request06 debe continuar exclusivamente desde `cxorbia-i3-shopper-persistence-20260814-05` con `priorStopRetryCode=I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`, targetear el HEAD vivo exacto posterior a esta documentación y cambiar únicamente el request JSON. Mantiene un único reset del mismo UID histórico exacto, checkpoint histórico legal-gate-aware antes de Administración, un solo Shopper nuevo y todas las prohibiciones previas. No existe autorización actual para ejecutar request06.

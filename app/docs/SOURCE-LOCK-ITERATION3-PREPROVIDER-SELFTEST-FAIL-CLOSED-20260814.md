# SOURCE LOCK — ITERATION 3 PRE-PROVIDER SELF-TEST FAIL-CLOSED — 2026-08-14

**Estado:** `LOCKED__REQUEST04_STOPPED_BEFORE_PROVIDER__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__NEW_GATE_REQUIRED`

## Carril exacto

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata única: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- Firebase target autorizado: `cxorbia-backend-dev`
- Request consumido: `cxorbia-i3-shopper-persistence-20260814-04`
- Workflow run: `31852717413`
- Job: `94931417141`

## Qué ocurrió

El gate de autorización y scope PASS. El run se detuvo en **Static I3 source preflight before provider credentials**, antes de instalar tooling transitorio, antes de cargar la service account y antes de cualquier lectura/escritura de provider.

Error reproducible:

`ERR_MODULE_NOT_FOUND: Cannot find package 'playwright' imported from tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`.

Por diseño fail-closed, quedaron SKIPPED la carga de credenciales provider, selección de identidades, credential reset, reconciliación, proxy, E2E histórico, provider de comandos, Admin create/update, readback y nuevo Shopper.

## Causa raíz mecánica

El harness `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` tiene un modo por defecto **source-only self-test**, pero importaba Playwright de forma estática al cargar el módulo. El workflow endurecido ejecutaba correctamente ese self-test antes del acceso a credenciales provider y antes de instalar Playwright. Por tanto el propio self-test source-only dependía accidentalmente de tooling runtime y falló antes de poder evaluar sus checks.

Esto es un fallo de mecanismo/preflight, no un fallo de Auth, identidad, HR, NDA, Shopper histórico ni Admin.

## Corrección source-only aplicada sin retry

1. `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`
   - eliminado el import estático de Playwright;
   - `await import('playwright')` ocurre únicamente dentro de `--execute-real`, después del gate explícito;
   - el self-test source-only ahora puede ejecutarse sin Playwright instalado;
   - nuevo check `playwrightDeferredToRealExecution`.

2. `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`
   - se conserva el preflight antes de provider credentials;
   - lineage del siguiente request queda prearmada para `request ...-04` + `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`;
   - no se creó workflow nuevo.

3. `tools/qa/cxorbia-i3-source-patcher.mjs`
   - deja preparada la misma lineage exacta en el command provider antes de cualquier provider use del siguiente run;
   - verifica que esa lineage exista en el provider materializado.

## Seguridad certificada por orden de ejecución

En run `31852717413`:

- credential reset histórico: **0**;
- Auth writes: **0**;
- Firestore writes: **0**;
- otras identidades modificadas: **0**;
- HR/Rules/Storage/Make/Gemini/pagos writes: **0**;
- deploy: **0**;
- merge: `false`;
- producción: `false`;
- aceptación legal automatizada: **0**;
- retry automático: **NO**.

El request quedó `consumed=true` por el circuit breaker, aunque el presupuesto provider de un reset **no llegó a utilizarse**.

## Preservar / no reprocesar

- I1 e I2 PASS;
- Auth owner, exact identity y Staff membership;
- legal-gate-aware historical harness;
- el estado alcanzado en run histórico anterior `31835742956`;
- no nueva candidata/rama/PR/Auth rebuild;
- no repetir automáticamente request `...-04`.

## Clasificación

- **Reusable CXOrbia:** source self-tests no deben depender de tooling runtime no instalado; fail-closed antes de provider credentials.
- **Exclusivo TyA:** el futuro reset, si se vuelve a autorizar, continúa limitado al mismo único Shopper histórico exacto.
- **Claude/prototipo:** sin cambio de UI ni diseño funcional.
- **Academia:** sin cambio funcional; el gate legal/NDA sigue separado y nunca se autoacepta.
- **Sin impacto Claude:** workflow, harness QA y lineage provider.

## Porcentaje

I3 no cerró. **GO-LIVE permanece 35% completado / 65% pendiente.**

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

Una siguiente autorización puede mantener exactamente el mismo alcance funcional del request `...-04`. Debe generar un request nuevo `...-05`, ligado a este fallo pre-provider, con un solo reset permitido del mismo UID exacto, cero retry automático y las mismas prohibiciones. No se debe consumir ningún provider gate hasta verificar el HEAD exacto y que el request commit sea el único archivo cambiado.

# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 18:12 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__GO_LIVE_35__NO_PRODUCTION`

## Request I3 `...-04`

Run `31852717413`, job `94931417141`, sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7.

El gate de Paula y de lane PASS. El run se detuvo inmediatamente en `Static I3 source preflight before provider credentials`.

Error:

`ERR_MODULE_NOT_FOUND: Cannot find package 'playwright' imported from tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`.

La falla ocurrió antes de `Install transient provider and browser tooling` y antes de `Load canonical DEV service account privately`. Por tanto, en este run no hubo acceso provider ni modificación de identidad.

## Root fix source-only posterior

### `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`

- eliminado import estático de Playwright;
- Playwright se carga mediante `await import('playwright')` únicamente dentro de `--execute-real`, después del gate explícito;
- el modo default source-only no depende de tooling runtime;
- se agregó check `playwrightDeferredToRealExecution`.

### `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`

- se mantiene preflight antes de provider credentials;
- lineage del siguiente request queda preparada para `cxorbia-i3-shopper-persistence-20260814-04` + `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`;
- no se creó otro workflow.

### `tools/qa/cxorbia-i3-source-patcher.mjs`

- materializa/verifica la misma lineage exacta en `backend/runtime/cxorbia-shopper-command-provider-v1.mjs` antes de cualquier provider use del siguiente run.

### `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`

- ya había sido endurecido para legal-gate-aware lineage y para exigir `otherIdentitiesModifiedMax=0` y `legalAcceptanceAutomated=false`.
- cualquier siguiente run seguirá fail-closed por request exacto, scope y budgets.

### Source lock

`app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

## Writes y seguridad — run `31852717413`

- password reset histórico: **0**;
- Auth writes: **0**;
- Firestore writes: **0**;
- other identities modified: **0**;
- Admin/new Shopper: **NO EJECUTADO**;
- HR/Rules/Storage/Make/Gemini/pagos: **0**;
- deploy: **0**;
- merge: `false`;
- production: `false`;
- legal acceptance automated: **0**;
- retry automático: **NO**.

El request `...-04` quedó consumido por el failure handler. No se hará rerun del mismo request.

## Reusable CXOrbia

Los self-tests source-only no deben requerir dependencias runtime no instaladas. El provider boundary permanece detrás de preflight, gate, exact identity, tenant/project scope, idempotencia y ACK.

## Exclusivo TyA

Un futuro reset, si Paula vuelve a autorizarlo, sigue limitado al mismo único Shopper histórico exacto TyA/Cinépolis.

## Claude/prototipo

No reconstruir Auth/login, NDA, Academia, Certificación ni UI. La corrección actual es únicamente del harness/workflow/lineage QA.

## Academia

Sin cambio funcional. El legal/NDA gate continúa humano y separado de Auth; no se automatiza consentimiento.

## Porcentaje

**35% completado / 65% pendiente.** I3 solo sube a 60% cuando cierre completo.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

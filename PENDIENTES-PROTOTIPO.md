# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 18:23 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 sigue en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 actual: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

**35% completado / 65% pendiente.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1, I2 provider ACK/fail-closed, Mis Visitas, overlay DEV y harness legal-gate-aware.

## Request `...-04`

Run `31852717413`, job `94931417141`: STOP_RETRY en source preflight por import de Playwright antes del paso que lo instala. Fallo antes de provider credentials.

Resultado: reset 0 · Auth 0 · Firestore 0 · other identities 0 · Admin/new Shopper NO · providers prohibidos 0 · deploy/merge/production 0/false/false.

Request consumido; no rerun.

## Fix source-only

1. Playwright dinámico solo en `--execute-real` + check `playwrightDeferredToRealExecution`.
2. Workflow existente prearma lineage exacta desde `...-04` con `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
3. Source patcher materializa/verifica lineage en provider antes de provider use.
4. No provider gate posterior.

## Pendiente I3

Nuevo gate/request `...-05`; un reset exacto histórico; Auth/identity/HR/history legal-gate-aware + checkpoint; Admin create/update un Shopper nuevo + ACK/readback; login/reload/new-tab/second context; cero fuzzy/otras identidades/consent automation.

Academia/Certificación no se declaran PASS si NDA está pendiente; no simular consentimiento.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 13:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST05_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFREFERENTIAL_SELFTEST_FIXED__SOURCE_ONLY_GATE_PASS__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 actual: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md`.

**35% completado / 65% pendiente. I3 0/25.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1, I2 provider ACK/fail-closed, Mis Visitas, protected HR authority, overlay DEV y harness legal-gate-aware.

## Request `...-05`

Run `31902822527`, job `95056069906`: STOP_RETRY en source preflight antes de tooling/service account/provider credentials.

Causa: self-test auto-referencial del import de Playwright. El check de ausencia contenía el mismo literal buscado, aunque el import estático real ya no existía.

Resultado: reset `0` · Auth `0` · Firestore `0` · other identities `0` · Admin/new Shopper `NO` · HR/Rules/Storage/Make/Gemini/pagos `0` · deploy `0` · merge=false · production=false · consentimiento automatizado `0`.

Request consumido; no rerun.

## Fix cerrado source-only

1. Harness v5 usa detector estructural de import estático real y carga Playwright solo en `--execute-real`.
2. Phase A workflow valida el harness sin tooling/provider y conserva fail-closed.
3. Checkpoint verifier fue desacoplado de literales históricos obsoletos.
4. Source patcher y workflow I3 prearman lineage `request05 + I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`.
5. Run source-only `31903321622` sobre `64f7aa28d3d3728d2f7a3749d62373cff746ffd2`: `SUCCESS` en harness + patcher/lineage + checkpoint.

## Pendiente I3 real

1. Gate expreso para request `...-06`; no rerun de request05.
2. Un único reset del mismo Shopper histórico exacto.
3. Auth/identity/HR/history legal-gate-aware + checkpoint sanitizado inmediato antes de Administración.
4. Admin create/update de un único Shopper nuevo con provider ACK/readback.
5. Nuevo Shopper login + reload/new-tab + segundo contexto.
6. Cero fuzzy, otras identidades, consentimiento automatizado y providers prohibidos.

El patch ACK-aware de `app/modules/shoppers.js` sigue preparado por el patcher pero todavía no materializado porque request05 no llegó a esa etapa.

## Academia

Academia/Certificación no se declaran PASS si NDA está pendiente. No aceptar, firmar, guardar ni simular consentimiento automáticamente.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST06_AFTER_SELFREFERENTIAL_PREPROVIDER_MECHANISM_FAILURE`.

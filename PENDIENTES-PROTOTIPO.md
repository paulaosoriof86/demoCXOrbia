# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 18:22 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 cerradas. I3 se termina en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

Lock I3 más reciente: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

Auth owner / exact identity / Staff membership, I1, I2 command boundary/provider ACK, Mis Visitas arrays/facets/ACK, overlay DEV no interactivo y harness histórico legal-gate-aware.

## Último intento I3 — request `...-04`

Run `31852717413` / job `94931417141`.

Gate inicial PASS. STOP_RETRY en source preflight por import estático de Playwright antes de instalar Playwright. Fallo antes de service account/provider access.

Resultado: reset 0; Auth 0; Firestore 0; otras identidades 0; Admin/new Shopper no ejecutado; HR/Rules/Storage/Make/Gemini/pagos 0; deploy/merge/producción 0/false/false.

Request `...-04` consumido/parked y no se rerun.

## Causa corregida source-only

1. Playwright ahora se importa dinámicamente solo en `--execute-real`; source self-test verifica `playwrightDeferredToRealExecution`.
2. Workflow existente prearma lineage exacta desde `...-04` con `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
3. Source patcher materializa/verifica esa lineage en command provider antes de provider use.
4. No se ha ejecutado provider después de este hardening.

## Pendiente I3 real

Futuro request `...-05`, solo con gate nuevo expreso:

1. un único reset del mismo Shopper histórico exacto;
2. Auth/identity/HR/history PASS legal-gate-aware + checkpoint sanitizado inmediato;
3. Admin create/update de un único Shopper nuevo con provider ACK/readback;
4. nuevo Shopper login + reload/new-tab/segundo contexto;
5. cero fuzzy, otras identidades, false success o consentimiento legal automatizado.

## Academia

No declarar Academia/Certificación PASS si están diferidas por NDA pendiente. No simular consentimiento.

## Pendiente heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker actual salvo evidencia nueva.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 18:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE`

No nueva candidata/rama/PR. No reconstruir Auth.

Lock actual: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

## No tocar
Auth owner/exact identity, I1, I2 provider ACK/fail-closed, Mis Visitas arrays/facets/ACK, overlay DEV, harness legal-gate-aware y gate NDA humano.

## Request `...-04`
Run `31852717413` falló antes de provider credentials por import estático de Playwright en source self-test. Reset/Auth/Firestore/identity changes = 0. Admin/new Shopper no ejecutado. Request consumido, no rerun.

## Fix QA
- Playwright dinámico solo con `--execute-real`;
- source self-test independiente de Playwright instalado;
- workflow prearma lineage exacta desde `...-04`;
- source patcher materializa/verifica lineage en provider antes de provider use.

**Sin cambio de UI. Claude no debe corregir login/NDA/Academia/Certificación/shoppers.js por este incidente.**

Shopper nuevo sigue NO creado. Academia/Certificación se difieren si NDA está pendiente; no simular consentimiento.

## Seguridad
Request `...-04` consumido/parked. Reset/Auth/Firestore del run: 0/0/0. No retry. Cero providers prohibidos/deploy/merge/producción.

## Porcentaje
35% / 65% pendiente.

## Siguiente frontera
`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

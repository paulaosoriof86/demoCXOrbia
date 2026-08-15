# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 13:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST05_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFREFERENTIAL_SELFTEST_FIXED__SOURCE_ONLY_GATE_PASS__SAME_CANDIDATE`

No nueva candidata/rama/PR. No reconstruir Auth.

Lock actual: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md`.

## No tocar / no reprocesar

Auth owner/exact identity, Staff membership, I1, I2 provider ACK/fail-closed, Mis Visitas arrays/facets/ACK, overlay DEV, protected HR authority y harness legal-gate-aware.

## Request `...-05`

Run `31902822527` falló en source preflight antes de Playwright/tooling, service account y provider credentials. Causa: el self-test de ausencia de import estático contenía en su propia expresión el literal que buscaba, por lo que se auto-invalidaba.

Reset/Auth/Firestore/other identities = `0/0/0/0`. Admin/new Shopper no ejecutado. Request consumido, no rerun.

## Fix QA/backend source-only

- Harness v5 detecta un import estático real por patrón de línea; Playwright sigue dinámico solo en `--execute-real`.
- Phase A workflow existente prueba el harness sin Playwright/provider.
- Current checkpoint verifier quedó alineado a fuentes vivas y no a textos históricos extensos.
- Source patcher prearma request05 + `I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK` en provider antes de un eventual request06.
- Provider workflow existente acepta esa lineage futura y muestra el JSON de preflight antes de cualquier provider credential.
- Run source-only `31903321622` sobre `64f7aa28d3d3728d2f7a3749d62373cff746ffd2`: PASS completo de harness, patcher/lineage y checkpoint verifier.

## UI / Claude

**No rediseñar login, NDA, Academia, Certificación ni módulos por este incidente.** No fue un defecto funcional de esas vistas.

`app/modules/shoppers.js` sigue sin materializar el patch ACK-aware porque request05 no llegó al paso `Apply exact same-candidate I3 source patch before provider access`. El patch sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs` para el gate provider autorizado correspondiente; no reconstruirlo manualmente ni crear otra candidata.

Shopper nuevo sigue `NO CREADO`.

## Academia

Si NDA/confidencialidad está pendiente, el harness valida el gate legal visible pero no acepta, firma ni guarda consentimiento y difiere rutas. No simular consentimiento para pasar pruebas.

## Seguridad

Request05 consumido/parked: provider writes/resets `0`; providers prohibidos/deploy/merge/producción `0/0/false/false`. No retry automático.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25.**

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST06_AFTER_SELFREFERENTIAL_PREPROVIDER_MECHANISM_FAILURE`.

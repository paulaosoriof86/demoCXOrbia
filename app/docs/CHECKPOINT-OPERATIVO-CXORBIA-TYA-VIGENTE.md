# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 18:12 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__GO_LIVE_35__NEW_GATE_REQUIRED`

## Autoridad vigente

- Auditoría forense: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
- Plan durable: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
- I2 PASS: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
- I3 harness durable: `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`
- I3 legal-gate-aware: `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`
- **I3 lock más reciente:** `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`
- Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

No volver a diagnóstico general, nueva candidata, rama/PR ni Auth rebuild.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Candidata única: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`

## I1 / I2 — cerradas

I1 PASS 15/15. I2 PASS 20/20. No reprocesar Firebase Auth owner, exact identity, Staff membership, HR live/protected overlay, cumulative read model, `CX.data` command boundary, provider ACK, Mis Visitas arrays/facets/ACK ni firewall fail-closed.

## I3 — antecedente provider real que se preserva

Run `31835742956`, job `94881540163` alcanzó el mismo Shopper histórico exacto, reset exacto autorizado, identidad preservada, membership/crosswalk reconciliation, contexto Auth Shopper y protected HR authority. Se detuvo por el falso negativo de navegación que motivó el harness legal-gate-aware. Ese run no se repite automáticamente.

## I3 — request `...-04` consumido sin llegar a provider

Run `31852717413`, job `94931417141`.

El gate inicial PASS, pero `Static I3 source preflight before provider credentials` falló con:

`ERR_MODULE_NOT_FOUND: Cannot find package 'playwright' imported from tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`.

La secuencia demuestra que el fallo ocurrió **antes** de:

- instalación de Playwright/firebase-admin;
- carga de service account;
- selección del Shopper/Admin;
- credential reset;
- reconciliación Firestore;
- proxy/E2E;
- provider de comandos;
- alta/edición de Shopper nuevo.

Resultado real del run `31852717413`:

- password reset: `0`;
- Auth writes: `0`;
- Firestore writes: `0`;
- other identities modified: `0`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy: `0`; merge=false; production=false;
- legal acceptance automated: `0`;
- automatic retry: `NO`.

El request `...-04` quedó `enabled=false`, `consumed=true`, `STOP_RETRY_I3_CONTINUATION_FAILED`. Su presupuesto provider no fue utilizado, pero el token de ejecución sí quedó consumido por el circuit breaker.

## Causa raíz focal y fix source-only

El modo default de `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` es source self-test, pero el archivo importaba Playwright estáticamente. Eso hacía que un test que debía ser source-only exigiera una dependencia runtime que el workflow instala deliberadamente después.

Correcciones ya aplicadas sin retry:

1. Playwright se importa dinámicamente solo dentro de `--execute-real` y después del gate explícito.
2. El source self-test incluye `playwrightDeferredToRealExecution`.
3. El workflow conserva el preflight antes de provider credentials y acepta una futura lineage exacta desde `...-04` con `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
4. El source patcher materializa esa misma lineage en el command provider antes de cualquier provider use.

No se ha ejecutado un nuevo request después de estas correcciones.

## Porcentaje

**35% completado / 65% pendiente.** I3 sigue 0/25 hasta PASS completo.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

Una nueva autorización debe mantener el mismo scope funcional de `...-04`, pero generar un request nuevo `...-05`; no se reusa ni se rerun `...-04`.

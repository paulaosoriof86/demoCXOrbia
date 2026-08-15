# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 18:22 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Lock I3 más reciente: `app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

## Cerrado / NO TOCAR

Firebase Auth owner, exact identity, I1, I2 command boundary/provider ACK, Mis Visitas arrays/facets/ACK, overlay DEV no interactivo y harness histórico legal-gate-aware. No automatizar NDA/confidencialidad.

## Request `...-04`

Run `31852717413` / job `94931417141` falló **antes de provider credentials** por import estático de Playwright dentro de un harness cuyo modo default es source-only. Por ello reset, Firestore, histórico, Admin y nuevo Shopper quedaron SKIPPED. Provider writes del run: 0.

## Root fix sin impacto de prototipo

- Playwright se carga dinámicamente solo con `--execute-real`; source self-test verifica `playwrightDeferredToRealExecution`.
- workflow existente prearma lineage exacta desde request `...-04`.
- source patcher materializa/verifica esa lineage en provider antes de provider use.

**Claude no debe corregir login, Academia, Certificación, NDA ni shoppers.js por este incidente.**

## Shopper nuevo

Todavía NO creado. El patch ACK-aware se materializa solo dentro de un futuro gate I3 autorizado.

## Academia

Sin cambio funcional. Si un NDA está pendiente, Academia/Certificación se difieren hasta aceptación humana legítima. El harness no acepta ni simula consentimiento.

## Seguridad

Request `...-04` consumido/parked. Reset/Auth/Firestore del run: 0/0/0. No retry. Cero HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción.

## Porcentaje

35% completado / 65% pendiente.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 18:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Lock I3 más reciente:

`app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

## Cerrado / NO TOCAR

- Firebase Auth owner y exact identity.
- I1 contracts.
- I2 command boundary + provider ACK/fail-closed.
- `modules/misvisitas.js` arrays/facets/ACK.
- overlay DEV no interactivo.
- legal-gate-aware historical Auth/HR/history harness.
- no automatizar NDA/confidencialidad.

## Request `...-04`

Run `31852717413` / job `94931417141` falló **antes de provider credentials**. El problema no fue UI ni Auth: el source self-test del harness histórico importaba Playwright estáticamente, aunque el workflow lo instala después y el modo default del harness es source-only.

Por ello quedaron SKIPPED reset, Firestore, E2E histórico, Admin y nuevo Shopper. En ese run hubo 0 Auth writes, 0 Firestore writes y 0 cambios de identidad.

## Root fix sin impacto de prototipo

- `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` carga Playwright dinámicamente solo con `--execute-real`.
- workflow existente prearma lineage exacta desde request `...-04` para un futuro request `...-05`.
- `tools/qa/cxorbia-i3-source-patcher.mjs` materializa/verifica esa lineage en el provider antes de provider use.

**Claude no debe corregir login, Academia, Certificación, NDA ni shoppers.js por este incidente.** No es un defecto visual/funcional de esos módulos.

## Shopper nuevo

Todavía NO creado. El patch ACK-aware sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs` y solo se materializará dentro de un futuro gate I3 autorizado.

## Reusable CXOrbia

Source-only preflight independiente de dependencias runtime; exact identity; tenant/project scope; provider ACK; no fuzzy; no false-success; legal consent separado del Auth.

## Academia

Sin cambio funcional. Si un NDA está pendiente, Academia/Certificación se difieren hasta aceptación humana legítima. El harness no acepta ni simula consentimiento.

## Seguridad

Request `...-04` consumido/parked. Provider writes del run: 0. No retry. Cero HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción.

## Porcentaje

35% completado / 65% pendiente. I3 sumará 25 puntos solo al cerrar completo.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

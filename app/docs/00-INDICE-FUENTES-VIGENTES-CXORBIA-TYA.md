# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 18:20 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_FAIL_CLOSED__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__GO_LIVE_35__NEW_GATE_REQUIRED`

## 1. Lectura obligatoria y prevalente

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md` — histórico.
12. `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — fix legal-gate-aware preservado, histórico para el estado actual.
13. **`SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — lock I3 más reciente y prevalente.**
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
15. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 2. Carril actual

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata única: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`
- `EXECUTION_LANE_READY`: sí para source/docs; cualquier nuevo provider run requiere gate nuevo expreso porque request `...-04` quedó consumido por STOP_RETRY.

No nueva candidata, rama, PR, Auth rebuild ni reauditoría general.

## 3. Request I3 `...-04` — STOP_RETRY antes de provider

Run `31852717413`, job `94931417141`.

PASS: checkout exacto del request commit y gate de Paula/repo/branch/PR/target/budgets/prohibiciones.

STOP_RETRY en `Static I3 source preflight before provider credentials` por:

`ERR_MODULE_NOT_FOUND: Cannot find package 'playwright' imported from tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`.

Playwright se instalaba deliberadamente después del preflight. Service account, selección de identidades, reset, Firestore, proxy, E2E y Admin/new Shopper quedaron SKIPPED.

**Este run ejecutó 0 password resets, 0 Auth writes, 0 Firestore writes y 0 cambios de identidad.** El request quedó `consumed=true`, pero su presupuesto provider no fue utilizado.

## 4. Corrección source-only posterior — sin retry

- `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`: Playwright se carga dinámicamente solo dentro de `--execute-real`; el self-test source-only ya no depende de Playwright instalado y verifica `playwrightDeferredToRealExecution`.
- `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`: mantiene el preflight antes de provider credentials y prearma lineage exacta desde `...-04` con `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
- `tools/qa/cxorbia-i3-source-patcher.mjs`: materializa/verifica la misma lineage en el command provider antes de cualquier provider use.
- No se creó workflow, rama, PR ni candidata nuevos y no se ejecutó otro provider gate.

## 5. Seguridad

En run `31852717413`: reset 0, Auth 0, Firestore 0, otras identidades 0, HR/Rules/Storage/Make/Gemini/pagos 0, deploy 0, merge=false, producción=false, consentimiento legal automatizado 0 y retry automático NO.

## 6. Porcentaje

**GO-LIVE: 35% completado / 65% pendiente.** I3 permanece 0/25 hasta PASS completo.

## 7. Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

Si Paula vuelve a autorizar, el alcance funcional puede ser exactamente el mismo que `...-04`, mediante request nuevo `...-05`: un único reset del mismo UID histórico, checkpoint histórico legal-gate-aware antes de Administración y luego un único Shopper nuevo con provider ACK/readback/login/reload/new-tab/segundo contexto. Sin fuzzy, otras identidades, aceptación legal automatizada, HR/Rules/Storage/Make/Gemini/pagos, deploy, merge o producción; fail-closed y cero retry automático.

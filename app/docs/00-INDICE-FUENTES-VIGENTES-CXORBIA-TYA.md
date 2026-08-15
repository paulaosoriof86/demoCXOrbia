# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 13:14 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_REQUEST05_PREPROVIDER_FAIL_CLOSED__ZERO_PROVIDER_WRITES__SELFREFERENTIAL_SELFTEST_FIXED__SOURCE_ONLY_GATE_PASS__GO_LIVE_35__REQUEST06_GATE_REQUIRED`

## Fuentes vigentes

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
12. `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — histórico/fix preservado.
13. `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — request04/histórico.
14. **`SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md` — lock I3 más reciente y prevalente.**
15. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
16. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider NO está autorizado actualmente porque request `...-05` quedó consumido y no existe request06 autorizado. No nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## Request `...-05`

Run `31902822527`, job `95056069906`: gate inicial PASS; STOP_RETRY en source preflight antes de tooling/service account/provider.

Causa exacta: el self-test verificaba ausencia con `source.includes("from 'playwright'")`, pero ese mismo literal estaba dentro del propio test, por lo que `playwrightDeferredToRealExecution` se auto-invalidaba.

Resultado exacto del run: reset `0`, Auth `0`, Firestore `0`, otras identidades `0`, Admin/new Shopper `NO EJECUTADO`, HR/Rules/Storage/Make/Gemini/pagos `0`, deploy `0`, merge=false, producción=false, consentimiento automatizado `0`, retry `NO`.

Request consumido; no rerun.

## Fix y gate source-only

- Harness v5 usa detector estructural de import estático real y conserva Playwright dinámico solo en `--execute-real`.
- Workflow Phase A existente valida harness sin Playwright/provider.
- Verificador de checkpoint quedó alineado a fuentes vivas, no a literales históricos obsoletos.
- Source patcher y workflow I3 quedaron prearmados para lineage `request05 + I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`.
- Run source-only `31903321622` sobre HEAD `64f7aa28d3d3728d2f7a3749d62373cff746ffd2`: `SUCCESS`, incluyendo harness, patcher, lineage y checkpoint verifier.
- Cero provider writes durante esta corrección.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre completo.**

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST06_AFTER_SELFREFERENTIAL_PREPROVIDER_MECHANISM_FAILURE`.

Request06, si Paula lo autoriza, debe continuar desde request05 con un único reset del mismo UID histórico exacto, checkpoint Auth/identity/HR/history legal-gate-aware antes de Administración y luego un único Shopper nuevo por ACK/readback/login/reload/new-tab/segundo contexto; mismas prohibiciones y sin retry automático.

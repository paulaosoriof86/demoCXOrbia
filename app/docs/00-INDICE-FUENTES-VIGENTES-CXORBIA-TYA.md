# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 18:24 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_FAIL_CLOSED__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__GO_LIVE_35__NEW_GATE_REQUIRED`

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
13. **`SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — lock I3 más reciente y prevalente.**
14. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
15. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí; provider requiere gate nuevo porque request `...-04` está consumido. No nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## Request `...-04`

Run `31852717413`, job `94931417141`: gate inicial PASS; STOP_RETRY en source preflight por `ERR_MODULE_NOT_FOUND` al importar Playwright antes de instalarlo. Fallo antes de service account/provider credentials.

Resultado exacto: reset 0, Auth 0, Firestore 0, otras identidades 0, Admin/new Shopper NO, HR/Rules/Storage/Make/Gemini/pagos 0, deploy 0, merge=false, producción=false, consent automation 0, retry NO.

Request consumido; no rerun.

## Fix source-only

- Playwright dinámico solo con `--execute-real`; self-test con `playwrightDeferredToRealExecution`.
- workflow existente prearma lineage `...-04` + `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
- source patcher materializa/verifica lineage en provider antes de provider use.
- cero provider gate posterior.

## Avance

**GO-LIVE 35% / 65% pendiente. I3 = 0/25 hasta cierre completo.**

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.

Si Paula vuelve a autorizar: request nuevo `...-05`, mismo alcance funcional de `...-04`, un solo reset del mismo UID histórico, checkpoint legal-gate-aware antes de Admin y luego un Shopper nuevo con ACK/readback/login/reload/new-tab/second context; sin fuzzy/otras identidades/consent automation/providers prohibidos/deploy/merge/producción; fail-closed y no retry.

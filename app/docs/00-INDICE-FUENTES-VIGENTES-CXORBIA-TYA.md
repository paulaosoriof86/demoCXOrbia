# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 15:14 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST07_ADMIN_OVERLAY_STOP_RETRY_BEFORE_CREATE__ZERO_NEW_WRITES__OVERLAY_AWARE_SOURCE_GATE_PASS__GO_LIVE_35__REQUEST08_GATE_REQUIRED`

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
12. `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — histórico/fix.
13. `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — request04/histórico.
14. `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md` — request05/histórico.
15. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS request06.
16. `SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md` — request06/handoff fix histórico.
17. **`SOURCE-LOCK-ITERATION3-REQUEST07-ADMIN-OVERLAY-STOP-RETRY-OVERLAY-AWARE-SOURCE-GATE-PASS-20260815.md` — lock I3 más reciente y prevalente.**
18. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
19. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider NO: request07 está consumido y no existe request08 autorizado. Prohibido nueva candidata/rama/PR/Auth rebuild/reauditoría general.

## I3 preservado

El histórico del Shopper exacto quedó PASS y congelado en run `31906391682`. No repetir reset, reconciliación ni acceso a credencial histórica. Toda continuación lleva `passwordResets=0` y usa read-only `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

NDA/confidencialidad histórico quedó `legal-gate-pending`, visible y `acceptanceAutomated=false`; Academia/Certificación diferidas, no PASS.

## Request07 — resultado real

Request commit `2ebc85af6c4becee15a93de8a8726cbc295464c3`; run `31907732888`; job `95068062981`.

El blocker request06 quedó superado: `#shNew` llegó visible/enabled/stable. El nuevo STOP_RETRY ocurrió antes de completar el click porque un `.cx-ov` interceptó pointer events:

`I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`

No hubo `shopper.create`, Shopper nuevo, update ni readback. Nuevos Auth/Firestore writes `0/0`; password resets `0`; other identities `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false. Request07 consumido/parked; no rerun.

## Fix y gate source-only posterior

El harness ahora clasifica el overlay sin texto sensible ni bypass: legal pending => STOP; únicamente el banner informativo de contrato fuente exacto `#bnOk` puede reconocerse mediante click normal; overlay desconocido => STOP. Prohibidos `force:true` y deshabilitar globalmente `.cx-ov`.

Source patcher y workflow existente quedaron prearmados para continuar exactamente desde request07 con `passwordResets=0` y frozen historical checkpoint.

Gate source-only independiente: run `31908665710`, job `95070327022`, HEAD fuente `1e313d6f4d689ac01623f4bce90da5828f25f717`: `SUCCESS` completo. Cero provider writes/resets/deploy/merge/producción.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.** El histórico está cerrado; solo Admin/new Shopper permanece vivo.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`.

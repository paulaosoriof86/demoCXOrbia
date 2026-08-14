# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 20:31 -06:00
**Estado vivo:** `SHOPPER_P0_READONLY_GATE_CONSUMED_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__SOURCE_CHAIN_REPAIRED_PASS__REAL_E2E_PENDING__CUTOVER_BLOCKED`

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`
3. `backend/config/corte6-human-login-shopper-identity-audit.json` — consumed/disabled/STOP_RETRY.
4. `app/docs/CAMBIOS-BACKEND.md`
5. `app/docs/RESUMEN-PARA-CLAUDE.md`
6. `app/docs/PENDIENTES-PROTOTIPO.md`
7. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
8. `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`
9. PR #7.

Estado: gate real `31762716234` consumió 1/1 provider read y quedó HOLD/inconcluso; `62/137/10` invalidado como veredicto. Evidencia independiente 616/208/194. Linked-owner canonicalization repaired source-only; run `31763545130` SUCCESS con `PASS_P0_GLOBAL_COMPOSITION_SOURCE`. Handoff histórico sin credencial vigente; E2E real/Academia/Certificación SKIPPED. Request neutralizado; run `31763754714` provider/E2E skipped; no segundo read. Source repair no desplegado. Producción/merge intactos.

Siguiente bloque: `SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`. Nueva lectura v2/E2E requiere nueva autorización explícita one-shot.

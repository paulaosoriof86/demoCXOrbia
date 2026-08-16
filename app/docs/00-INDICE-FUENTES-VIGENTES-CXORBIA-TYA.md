# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT`

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
11. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — request08 consumido.
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — acceptance durable source-only.
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md` — decisión interina.
15. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — source lock técnico prevalente.**
16. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
17. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
18. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
19. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
20. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
21. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
22. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
23. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`.
24. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
25. `CAMBIOS-BACKEND.md`.
26. `RESUMEN-PARA-CLAUDE.md`.
27. `PENDIENTES-PROTOTIPO.md`.
28. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
29. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`. Request08 consumido/no rerun. No nueva candidata/rama/PR/workflow.

## Estado I3

Historical Shopper run `31906391682` PASS congelado. Reset histórico único consumido; `passwordResets=0`; cero credential access/reconcile/recovery.

Counsel GT/HN `deferred_post_golive`, no aprobado. V0.4 interina vigente.

Provider source-only prepara bootstrap DEV de cuatro documentos create-only: legalProfile `1`, Provider Registry core `1`, legalContent/version `2`. legalAcceptance/Auth/reset/historical/HR/Rules/Storage/Make/Gemini/payment `0`. `legal.acceptance.record` es self-scoped/human-confirmed; provider deriva UID exacto del ID token.

## Evidencia canónica final

HEAD `feb6cb776b6b8f69dfae90cba2f8864f148c9ab0`: `CXOrbia Phase A Live Execution Checkpoint` run `31960476112`, job `95197565971`, **SUCCESS**.

Pasaron I1, I2, frozen I3, historical legal-aware, Admin overlay-aware, durable legal acceptance, immutable publication, V0.4 materialization provider source contract y current checkpoint.

## No-code/rebranding

`tenantLegalProfile mutable provider-authoritative → snapshot inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Valores TyA en configuración viva/no-code, no runtime constants. Rebranding no reescribe historia.

## Efectos reales

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance `0`; passwordResets/historical `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Avance

**35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Gate exacto siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Autoriza bootstrap DEV exacto de cuatro writes + wiring/runtime DEV. Aceptación exclusivamente por la persona autenticada. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.

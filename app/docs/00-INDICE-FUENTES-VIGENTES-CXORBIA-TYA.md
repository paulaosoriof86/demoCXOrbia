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
8. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
9. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
10. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — request08 consumido.
11. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.
12. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md`.
13. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — lock técnico prevalente.**
14. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
15. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
16. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
17. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
18. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
19. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
20. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
21. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`.
22. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
23. `CAMBIOS-BACKEND.md`.
24. `RESUMEN-PARA-CLAUDE.md`.
25. `PENDIENTES-PROTOTIPO.md`.
26. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
27. PR #7 y HEAD vivo.

## Carril
Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`. Request08 consumido/no rerun. No nueva candidata/rama/PR/workflow.

## Estado vigente
Historical Shopper run `31906391682` PASS congelado; reset único consumido; `passwordResets=0`; cero access/reconcile/recovery histórico.

Counsel GT/HN `deferred_post_golive`, no aprobado. V0.4 interina vigente.

Materialization provider source PASS: futuro bootstrap DEV exacto Firestore `4` create-only = legalProfile `1` + core Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/reset/historical/HR/Rules/Storage/Make/Gemini/payment `0`. Aceptación automática prohibida.

`legal.acceptance.record` es self-scoped/human-confirmed para roles autenticados; provider deriva UID exacto del ID token y permisos operativos no se ampliaron.

## Evidencia canónica
HEAD funcional/documental verificado `feb6cb776b6b8f69dfae90cba2f8864f148c9ab0`: run `31960476112`, job `95197565971`, **SUCCESS**. Incluye I1/I2/frozen I3/legal-aware/overlay-aware/durable legal/immutable publication/V0.4 materialization/current checkpoint.

Los commits posteriores de índice son exclusivamente documentales y no ejecutan provider IO.

## No-code/rebrand-safe
`tenantLegalProfile mutable provider-authoritative → snapshot inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

## Efectos reales
Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance `0`; passwordResets/historical `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false.

## Avance
**35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Gate exacto siguiente
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Autoriza bootstrap DEV exacto de 4 writes + wiring/runtime DEV. Aceptación solo por la persona autenticada. Después: nueva continuación I3 Admin/new Shopper, sin request08 ni identidad histórica.

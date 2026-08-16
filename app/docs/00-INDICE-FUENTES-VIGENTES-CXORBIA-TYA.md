# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_INTERIM__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT`

## Autoridad vigente

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

Fuentes prevalentes para continuar:
1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`.
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`.
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`.
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`.
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
8. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md`.
9. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md`.
10. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.
11. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md`.
12. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — lock técnico prevalente.**
13. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
14. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
15. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
16. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
17. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
18. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
19. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
20. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`.
21. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
22. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, Academia y PR #7.

## Estado seguro
Historical Shopper run `31906391682` PASS congelado; reset único consumido; `passwordResets=0`; cero access/reconcile/recovery. Request08 consumido/no rerun.

Counsel GT/HN está diferido post-go-live y no se presenta como aprobado. V0.4 interina vigente.

Materialization provider source PASS: futuro bootstrap DEV exacto Firestore `4` create-only = profile `1` + core Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/reset/historical/HR/Rules/Storage/Make/Gemini/payment `0`; automaticAcceptance=false; humanAcceptanceRequired=true.

`legal.acceptance.record` es self-scoped/human-confirmed; provider deriva UID del ID token y no amplía permisos operativos.

## Evidencia
HEAD verificado `feb6cb776b6b8f69dfae90cba2f8864f148c9ab0`: run `31960476112`, job `95197565971`, SUCCESS. Los commits posteriores de índice/checkpoint son solo documentación y no ejecutan provider IO.

## Progreso
**35% completado / 65% pendiente. I3 0/25.**

## Siguiente gate
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Autoriza bootstrap DEV exacto de 4 writes + wiring/runtime DEV. Aceptación exclusivamente humana. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.

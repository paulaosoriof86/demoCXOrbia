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
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md` — antecedente V0.3.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.3-PRECOUNSEL-PRIMARY-SOURCE-VERIFICATION-PASS-20260816.md` — pre-verificación primaria.
16. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md` — decisión interina.
17. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — source lock técnico prevalente.**
18. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
19. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
20. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
21. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
22. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
23. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
24. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
25. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`.
26. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
27. `CAMBIOS-BACKEND.md`.
28. `RESUMEN-PARA-CLAUDE.md`.
29. `PENDIENTES-PROTOTIPO.md`.
30. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
31. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`. Request08 consumido/no rerun. No nueva candidata/rama/PR/workflow.

## I3 histórico preservado

Run `31906391682` PASS congelado. Reset histórico único consumido. `passwordResets=0`; sin credential access/reconcile/recovery.

## Legal V0.4 + materialización SOURCE PASS

Counsel GT/HN queda `deferred_post_golive`, nunca aprobado por inferencia. V0.4 es la candidata interina vigente.

Provider source-only prepara cuatro documentos create-only en `cxorbia-backend-dev`: legal profile, Provider Registry core, legalContent y versión inmutable. Rechaza placeholders, falso counsel, domicilio restringido, aceptación automática, overwrite y budget drift.

`legal.acceptance.record` cruza como self-scoped human-confirmed command para cualquier rol autenticado; provider deriva UID exacto del ID token y no se ampliaron permisos operativos.

## Evidencia canónica

HEAD canónico final verificado `662e060c7026ebf27ce1f2a106787fb51bccc45e`: `CXOrbia Phase A Live Execution Checkpoint` run `31960413262`, job `95197408054`, **SUCCESS**, incluido `Verify I3 V0.4 interim materialization provider source contract`.

El source lock fue actualizado después con esa evidencia (`2e3f4ab84a3977840fbe4063b6f9d17e2c47e101`); dicho commit es documental y no ejecuta provider IO.

## No-code/rebrand-safe

`tenantLegalProfile mutable provider-authoritative → snapshot inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Valores TyA en configuración viva/no-code, no runtime constants. Rebranding no reescribe historia.

## Efectos reales

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance writes `0`; passwordResets/historical `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Avance

**35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Gate exacto siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar bootstrap DEV exacto de cuatro writes y wiring/runtime DEV. Aceptación solo por la persona autenticada. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.

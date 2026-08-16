# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-15 20:05 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_3_COUNSEL_SNAPSHOT_SOURCE_PASS__GO_LIVE_35__HUMAN_COUNSEL_REVIEW_NEXT`

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
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — contrato/provider acceptance durable source-only.
14. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md` — lock legal source-only más reciente.**
15. `DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md` — antecedente.
16. `DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md` — antecedente/decisiones no-code.
17. `DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md` — decisiones humanas congeladas.
18. **`CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md` — única candidata jurídica consolidada vigente; NO aprobada/publicada.**
19. **`PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md` — paquete concentrado para abogado GT/HN.**
20. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable no-code.
21. **`backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable antes de digest.**
22. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable.
23. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
24. `CAMBIOS-BACKEND.md`.
25. `RESUMEN-PARA-CLAUDE.md`.
26. `PENDIENTES-PROTOTIPO.md`.
27. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
28. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama/candidata `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

`EXECUTION_LANE_READY`: source/docs sí. Provider write NO. Request08 está consumido/no rerun. Este bloque no es empalme de candidata frontend y no modifica `/app/modules` ni `/app/core`.

## I3 histórico preservado

Run `31906391682`: Shopper histórico exacto PASS y congelado. Reset histórico único consumido. Toda continuación `passwordResets=0`; sin credential access/reconcile/recovery.

## Request08

Run `31909354336`, job `95071998299`: `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Fail-closed antes de Alta; sin Shopper nuevo/Auth/Firestore writes/aceptación automática. Consumido; no rerun.

## Legal durable + publicación no-code

Acceptance durable source-only previo: gate `31913700755` / `95082399402` SUCCESS.

Nuevo patrón prevalente de publicación:

`tenantLegalProfile mutable no-code`
→ `snapshot de publicación con solo valores públicos aprobados`
→ `render canónico UTF-8/LF`
→ `SHA-256 post-render`
→ `receipt humano por legalVersion/contentDigest`.

El perfil editable nunca reescribe una versión histórica publicada. Rebranding, contacto u otra configuración posterior no altera receipts previos. Placeholders sin resolver no son publicables. Domicilio registrado restringido no se autopublica. Provider disabled no figura como receptor actual.

HEAD source `768a1b43c10a054a254cfc2bd295aacdeae64c92`: `CXOrbia Phase A Live Execution Checkpoint` run `31921002582`, job `95100754570`, SUCCESS, incluido el nuevo gate de publicación legal inmutable.

## V0.3 — revisión humana profesional pendiente

V0.3 consolida V0.1+V0.2. Los marcadores `LEGAL_REVIEW_REQUIRED` son deliberados y bloquean publicación. El paquete profesional divide revisión en GT-01..GT-08, HN-01..HN-06 y X-01..X-06.

No existe aún versión productiva ni digest final; el SHA-256 productivo solo se calcula después de revisión/aprobación, snapshot provider autorizado y render final.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente acción exacta

`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

Después de cerrar revisión y aprobación humana podrá abrirse:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No request09/provider write/acceptance/deploy/merge/producción antes de esos gates.

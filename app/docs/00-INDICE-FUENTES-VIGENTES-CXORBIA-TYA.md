# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 12:18 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_MATERIALIZATION_PASS__RUNTIME_AND_HOSTING_DEV_DEPLOY_PASS__HUMAN_ACCEPTANCE_PENDING__GO_LIVE_35`

## Fuentes vigentes

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`.
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`.
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`.
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`.
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
7. **`ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md` — plan durable de cinco iteraciones y NO REPROCESO.**
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
9. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`.
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`.
11. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — request08 consumido/no rerun.
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — aceptación durable.
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md` — V0.4/counsel diferido.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.
16. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.
17. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-MATERIALIZATION-AND-RUNTIME-SOURCE-CANONICAL-PASS-20260816.md`.
18. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md` — lock técnico prevalente: Cloud Run + Hosting DEV PASS, aceptación humana pendiente.**
19. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
20. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
21. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
22. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
23. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
24. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
25. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
26. `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.
27. **`app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json` — deploy real DEV sanitizado.**
28. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
29. `CAMBIOS-BACKEND.md`.
30. `RESUMEN-PARA-CLAUDE.md`.
31. `PENDIENTES-PROTOTIPO.md`.
32. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
33. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

`EXECUTION_LANE_READY`: runtime/Hosting DEV desplegados y verificados. Bootstrap V0.4 y deploy request están consumidos y **no se reejecutan**. La única acción humana inmediata es aceptar V0.4 desde la UI protegida.

## I3 histórico preservado

Historical Shopper run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; cero credential access/reconcile/recovery histórico. Request08 run `31909354336` / job `95071998299` consumido/no rerun.

## V0.4 — materialización REAL DEV PASS

Run `31961266066`; materialización `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

Firestore `4` create-only: legalProfile `1`, Provider Registry `1`, legalContent/version `2`. `legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos=0`. Digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.

## Runtime + Hosting DEV — PASS

Gate: `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Request `i3-legal-v04-runtime-dev-20260816-01` consumido/no retry. Run `31963932862`, job `95206055703`, `SUCCESS`. Revision Cloud Run `cxorbia-live-hr-dev-00010-n78`; Hosting `https://cxorbia-backend-dev.web.app`.

Deploy exacto: Cloud Run `1`, Hosting `1`; legalAcceptance writes durante deploy `0`; acceptance count `0 → 0`; Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`; automaticAcceptance=false; merge=false; producción=false.

Antes del deploy se corrigió el packaging Docker para incluir el runtime legal y su provider; de otro modo el handler importado por `server.mjs` no habría estado dentro de la imagen. No se tocó `/app/modules`, `/app/core` ni producción.

## Counsel / no-code

Counsel GT/HN sigue `deferred_post_golive`, no `approved`. Perfil editable provider-authoritative → snapshot inmutable → SHA-256 → receipt humano por identidad/versión/digest. Rebranding no reescribe aceptaciones históricas.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente acción exacta

`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

Paula abre `https://cxorbia-backend-dev.web.app`, inicia sesión con su cuenta canónica, lee V0.4, marca las dos casillas no premarcadas y pulsa `Aceptar y continuar`. Solo esa acción humana puede producir el único receipt autorizado. Después: provider readback y continuación I3 Admin/new Shopper, sin request08 ni identidad histórica.

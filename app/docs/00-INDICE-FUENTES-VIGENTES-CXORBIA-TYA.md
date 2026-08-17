# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 12:58 -06:00  
**Estado vivo:** `SAME_CANDIDATE__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__TARGET_B_ADMIN_SIGNIN_PASS__HUMAN_LOGIN_AND_LEGAL_UI_PERFORMED__AUTHORITY_COMPOSITION_ROOT_CAUSE_SOURCE_FIXED__DEV_RUNTIME_VALIDATION_PENDING__GO_LIVE_FORMAL_35`

## Fuentes vigentes

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`.
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`.
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`.
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`.
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
7. **`ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md` — plan durable de cinco iteraciones y NO REPROCESO.**
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint histórico; debe leerse junto con el source lock actual.
9. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`.
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`.
11. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
12. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — request08 consumido/no rerun.
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md`.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.
16. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.
17. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-MATERIALIZATION-AND-RUNTIME-SOURCE-CANONICAL-PASS-20260816.md`.
18. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md` — histórico del deploy legal DEV; su “human acceptance pending” ya no describe la interacción humana observada el 17-ago.
19. **`SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md` — SOURCE LOCK PREVALENTE ACTUAL para continuidad técnica.**
20. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
21. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
22. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
23. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
24. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
25. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
26. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
27. `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.
28. `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.
29. `app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json`.
30. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
31. `CAMBIOS-BACKEND.md` + `CAMBIOS-BACKEND-ADDENDUM-PHASE-A-AUTHORITY-ROOT-CAUSE-20260817.md`.
32. `RESUMEN-PARA-CLAUDE.md`.
33. `PENDIENTES-PROTOTIPO.md`.
34. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md` y addenda posteriores aplicables.
35. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR. No reconstruir módulos completos para resolver las regresiones observadas. La candidata viva contiene los adapters canónicos V2 vigentes de Shopper, Finance, cumulative read model, protected HR authority y state semantics.

`EXECUTION_LANE_READY` para trabajo source-only en la rama viva. El runtime actualmente publicado corresponde al deploy anterior; los commits source-only del 17-ago **todavía no se han desplegado a DEV** y no se pueden declarar corregidos en navegador hasta un gate DEV posterior.

## Trabajo congelado — NO REPROCESAR

- Historical Shopper run `31906391682` PASS; un reset histórico consumido; toda continuación `passwordResets=0`; no credential access/reconcile/recovery histórico.
- request08 `31909354336` / `95071998299` consumido/no rerun.
- TARGET_B Admin: real Firebase password sign-in PASS run `32049054855`; Paula pudo iniciar sesión. No crear/rotar/reemplazar Admin.
- I1/I2 PASS.
- HR no se reimporta.
- Finance source-safe/histórico de pagos existentes no se reconstruyen.

## HR viva comprobada

La Google Sheet operacional fue leída directamente: 15 periodos, 660 visitas, rango 2025-06 → 2026-08. Agosto 2026 = 44 visitas, GT 34/HN 10. Coincidencia comprobada de KPI estructurales: total 44, asignadas 32, sin asignar 12, agendadas 25, sin agendar 7, realizadas 18 y pendientes de realizar 26.

El overlay/protected state observado conserva 616 visitas; diferencia exacta 44. No implica HR vieja ni pérdida de candidato: indica overlay anterior + HR nueva. El compositor debe preservar 660 y enriquecer únicamente por crosswalk exacto.

## Root cause actual + delta source-only

Causa A: membership `projectIds=['cinepolis']` expresa proyecto raíz/programa, mientras helpers heredados comparaban `scopeProjectId` con IDs de filas de periodo `cinepolis-YYYY-MM`, produciendo selector vacío.

Causa B: `tya-live-source-inplace-apply.js` convertía asignaciones HR en `hr-post-*`, contaminando `_posts` y presentándolas como postulaciones aunque `Posts proyecto: 0`.

Delta aplicado sin provider writes:

- `app/adapters/tya-phase-a-authority-compat-v1.js` — separa assignment/postulation y compatibiliza scope root-project/period.
- `app/index-backend-dev.html` — wiring antes de protected HR composition.
- commits base del delta: `8a0fa581...`, `6594ef961...`.
- combined status observado en `6594ef...`: `cxorbia/c6-skip13-auth-access-adjudication/overall = success`.

## Legal / NDA

Paula reportó haber realizado la aceptación en la UI y que el acuerdo se presentó dos veces. La duplicidad se clasifica P1 no bloqueante mientras no impida sesión/rutas. No automatizar consentimiento. El receipt/provider readback durable de esta interacción no se declara verificado en este source-only block.

## Avance formal

**GO-LIVE formal permanece 35% / 65% pendiente** porque I3 no suma sus 25 puntos hasta PASS integral. Esto no autoriza repetir sus subgates ya cerrados: Admin e histórico Shopper permanecen congelados.

## Siguiente bloque exacto

`PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_NO_REPROCESS`:

1. validar el delta source/runtime sobre el mismo HEAD;
2. DEV deploy exacto únicamente bajo gate correspondiente;
3. comprobar Proyecto + 15 periodos + AGO activo;
4. comprobar Posts persistidos separados de assignment HR;
5. inspeccionar `identityReviewQueue`/aliases exactos de agosto reutilizando identidades existentes, sin histórico reset/reconcile;
6. validar Mi Perfil/Histórico Shopper;
7. validar Finanzas mayo/junio/histórico existente y solo aislar una fuente realmente faltante de agosto;
8. validar KPI derivados contra HR + state semantics V2;
9. Phase A E2E y después I4/I5, sin volver a Auth Admin.

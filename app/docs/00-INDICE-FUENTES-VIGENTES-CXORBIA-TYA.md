# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 13:28 -06:00  
**Estado vivo:** `UNIFIED_PHASE_A_PLAN_LOCKED__SAME_CANDIDATE__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__TARGET_B_ADMIN_PASS__I3_1_SOURCE_PASS__I3_2_DEV_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_FAIL__DIAGNOSTICS_SOURCE_PASS__GO_LIVE_FORMAL_35`

## Regla de prevalencia

Antes de cualquier bloque, leer este índice. Para **secuencia, porcentaje formal, pasos intermedios y siguiente acción**, prevalece:

**`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.**

El source lock técnico más reciente prevalece sobre detalles de implementación. Un subgate parcial no reinicia el plan ni autoriza reprocesar trabajo congelado.

## Fuentes vigentes

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md` / versión repo equivalente vigente.
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`.
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`.
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`.
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md` — sincronizado al plan unificado.
7. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.
8. **`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md` — LOCK PREVALENTE DE SECUENCIA Y CONTINUIDAD.**
9. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
10. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md` — S1→S6 preservados como controles intermedios.
11. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`.
12. `SOURCE-LOCK-ITERATION3-HISTORICAL-SHOPPER-LOGIN-PASS-20260814.md` — histórico PASS congelado.
13. `SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md` — consumido/no rerun.
14. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md`.
16. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.
17. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.
18. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-MATERIALIZATION-AND-RUNTIME-SOURCE-CANONICAL-PASS-20260816.md`.
19. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md` — histórico; interacción humana ya ocurrió, falta readback durable.
20. `SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md` — antecedente source-only I3.1.
21. **`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md` — SOURCE LOCK TÉCNICO PREVALENTE ACTUAL.**
22. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
23. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
24. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
25. contratos legales vigentes en `backend/contracts/`.
26. `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.
27. `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.
28. `app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json`.
29. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
30. `CAMBIOS-BACKEND.md` + addenda aplicables.
31. `RESUMEN-PARA-CLAUDE.md`.
32. `PENDIENTES-PROTOTIPO.md`.
33. Academia/addenda vigentes, incluido `ACADEMIA-ADDENDUM-I3-2-RUNTIME-GATE-GRANULAR-DIAGNOSTICS-20260817.md`.
34. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow. El deploy I3.2 ya se ejecutó una vez y quedó consumido; no se rerun automáticamente.

## Trabajo congelado — NO REPROCESAR

- I1 PASS / I2 PASS.
- Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0`; no credential access/reconcile/recovery histórico.
- request08 consumido/no rerun.
- TARGET_B Admin sign-in PASS run `32049054855`; Paula ingresó. No crear/rotar/reemplazar Admin.
- HR no se reimporta.
- Finance V2 + source-safe/historical payments no se reconstruyen.
- adapters V2 de Shopper/read-model/HR authority/state semantics se preservan.
- materialización/deploy legal V0.4 previos no se rerun.

## I3.2 — avance real

Request one-shot `i3-2-authority-compat-dev-deploy-20260817-01` ejecutó run `32058831910`, job `95475132736`.

PASS:
- source/preflight;
- Firebase Hosting DEV deploy exacto `1`;
- paridad remota root/direct `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- hash remoto `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`.

FAIL focal:
- authenticated Staff runtime: `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

El propio `waitReady()` había verificado Auth Staff, membership, HR authority, datos dinámicos no vacíos, current project/period y app visible. La aserción posterior mezclaba cinco causas y no permite elegir una sin evidencia adicional. Por ello se corrigió únicamente el harness de QA, no producto.

Harness granular commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`; source preflight run `32060010492`, job `95478920028`, PASS; provider/deploy/writes = 0.

## Legal

La doble presentación V0.4 sigue P1 solo mientras no impida routing. `CX.app.enter()` puede diferir `router.mount()` si el gate legal está pending; dado que I3.7 readback durable sigue abierto, legal es hipótesis fuerte pero NO causa declarada hasta obtener snapshot granular. No autoaceptar.

## Avance formal

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE formal: 35% completado / 65% pendiente.** I3.2 tiene deploy/paridad PASS y runtime abierto; no se inventan puntos parciales.

## Siguiente bloque exacto

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

El one-shot anterior está consumido. Si hace falta nueva ejecución autenticada/deploy, requiere gate exacto distinto. Después del PASS se continúa I3.3→I3.11; no se vuelve a Admin histórico, Shopper histórico, HR import ni reconstrucción Finance.

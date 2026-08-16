# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-16 11:12 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_DEV_MATERIALIZATION_PASS__4_WRITES_EXACT__REQUEST_CONSUMED__RUNTIME_SOURCE_WIRED__GO_LIVE_35__DEV_DEPLOY_HUMAN_ACCEPTANCE_GATE_NEXT`

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
13. `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md` — durable legal source.
14. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-SOURCE-ONLY-PASS-20260816.md` — V0.4 interina/counsel diferido.
15. `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — preparación source-only anterior.
16. **`SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md` — lock técnico prevalente: materialización REAL DEV PASS + runtime source wired.**
17. `DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
18. `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.
19. `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.
20. `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
21. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
22. `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`.
23. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`.
24. `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json` — evidencia real sanitizada.
25. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.
26. `CAMBIOS-BACKEND.md`.
27. `RESUMEN-PARA-CLAUDE.md`.
28. `PENDIENTES-PROTOTIPO.md`.
29. `ACADEMIA-IMPACT-I3-LEGAL-PROVIDER-WIRING-SOURCE-ONLY-20260815.md`.
30. PR #7 y HEAD vivo.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

`EXECUTION_LANE_READY`: source/docs sí. Bootstrap V0.4 ya fue consumido y **no se reejecuta**. Deploy DEV, legalAcceptance humano, Admin/new Shopper, merge y producción siguen sus gates separados.

## I3 histórico preservado

Historical Shopper run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; cero credential access/reconcile/recovery histórico. Request08 run `31909354336` / job `95071998299` consumido/no rerun.

## V0.4 — materialización REAL DEV PASS

Autorización humana: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; job materialización `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

Exacto:
- Firestore writes `4` create-only: legalProfile `1`, Provider Registry `1`, legalContent/version `2`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- request `i3-legal-v04-dev-20260816-01` consumido/no automatic retry;
- deploy `0`, merge=false, producción=false.

## Runtime source

Provider-backed legal runtime y browser bridge quedaron conectados en fuente al entrypoint DEV protegido. Production `app/index.html` no fue modificado. No `/app/modules` ni `/app/core` fueron modificados por este bloque. No hay deploy todavía.

El gate humano mostrado en DEV exige versión completa, dos casillas no premarcadas y clic explícito; la aceptación automática permanece prohibida.

## Counsel / no-code

Counsel GT/HN sigue `deferred_post_golive`, no `approved`, y no bloquea la ruta interina. Perfil legal editable provider-authoritative → snapshot publicado inmutable → SHA-256 → receipt humano por identidad/versión/digest. Rebranding no reescribe aceptaciones históricas.

## Gate canónico y corrección documental

HEAD source-wiring `c6e1e55d581f3eb15fc5bf430de4adb2de4e51ca`, run canónico push `31961999583`: I1/I2/frozen I3/durable legal/publication/V0.4 source PASS; único fallo `DURABLE_PLAN_NOT_INDEXED` en current checkpoint porque la versión reducida de este índice había omitido el addendum durable. Esta actualización restaura esa autoridad; no reabre diagnóstico ni toca provider.

## Avance

**GO-LIVE 35% completado / 65% pendiente. I3 = 0/25 hasta cierre integral.**

## Siguiente gate exacto

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Objetivo futuro: desplegar únicamente runtime/Hosting DEV existente con el gate de receipt humano habilitado; Paula realiza la aceptación en UI; después readback y continuación I3 Admin/new Shopper. No bootstrap V0.4 otra vez. No request08. No reset histórico. Sin merge/producción.

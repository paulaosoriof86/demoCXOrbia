# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentIteration:** `I5-G2`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `RC15_SYSTEMIC_AUDIT_AND_G2B_RECOVERY_HOLD`

## Orden canónico obligatorio antes de responder o actuar

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/evidence/RC15-MASTER-PLAN-FREEZE-LATEST.json`.
4. `tools/continuity/validate-cxorbia-master-plan-freeze.js` y ejecutar/replicar su validación antes de una mutación.
5. `app/docs/evidence/RC15-PLAN-CHANGE-REQUEST-EMERGENCY-V156-INERTIZATION-20260821.json`.
6. `app/docs/evidence/RC15-TOOLING-INCIDENT-MAIN-NET-ZERO-20260821.json`.
7. `app/docs/evidence/RC15-TOOLING-INCIDENT-LIVE-BRANCH-NET-ZERO-20260821.json`.
8. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` y `RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-TRANCHE7-DETAIL.json`.
9. `app/docs/evidence/I5-G2B-P0-WRITEPATH-RECOVERY-LATEST.json`.
10. `backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json`.
11. `backend/config/cxorbia-consumed-one-shot-gates.json`.
12. `app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json`.
13. `app/docs/evidence/I5-G2B-ATOMIC-CONTINUITY-SYNC-LATEST.json`.
14. `backend/config/cxorbia-g2a-production-readonly-smoke.json`, `backend/config/cxorbia-g1-production-cutover.json`, `backend/config/cxorbia-r4-root-cause-closure.json`.
15. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`, `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
16. `CAMBIOS-BACKEND.md` + addenda RC15, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.
17. Addenda, planes previos y PR #7: evidencia/contexto; no alteran el plan maestro ni reactivan gates.

## Plan prevalente

Único plan vigente: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

El PLAN_CHANGE_REQUEST `RC15-PCR-EMERGENCY-V156-BASE-WORKFLOW-INERTIZATION-20260821-01` fue una excepción de seguridad F0 expresamente autorizada. No modificó el plan, su hash o su secuencia F0→F10.

## Estado formal

I1–I4, R1–R4, G1 y G2-A permanecen PASS/FROZEN. Phase A = `98/100`. G2-B continúa bloqueado por RC15 y por su recovery terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no replay/retry.

## RC15 F0 — estado canónico

- Hallazgos clasificados: **106**.
- HOLD/P0 descubiertos acumulativamente: **24**.
- Contenido mediante excepción expresa: `RC15-CP-093`.
- HOLD residuales: **23**.
- Cobertura: `EXPANDED_NOT_EXHAUSTIVE`.
- Los cuatro flags de exhaustividad siguen false.

### CP093 — P0 de rama base contenido

El workflow histórico V156 de la rama base podía reingresar por PR synchronize, usar credencial DEV, descargar/aplicar V156 y pushear la rama viva. Run probatorio: `32534531824`.

Contención: `release/cxorbia-tya-rc-20260630` avanzó `4a85e7e4d0eb31691d7b77e3551ed7cafabb5984` → `fc7ead694ccdb01bee79856d47a761d34c8d88b9`; único archivo `.github/workflows/cxorbia-v156-atomic-promotion.yml`; blob final `fe7691a6e53d51ff6a73a5df340541ba84d99594`; sin PR/push trigger, secrets, download, apply, commit, push ni deploy; job `if:false`.

Prueba post-contención: synchronize posterior produjo workflows de validación, pero **no produjo `CXOrbia V156 Direct Empalme`**. `PASS_V156_PR_SYNCHRONIZE_REENTRY_REMOVED`.

### CP094 — HOLD residual nuevo

`tya-hr-country-tab-consistency-current.yml` + `live-hr-country-tab-consistency.json`: request activo, credential/live HR/provider reads y writer de evidence/registry sin current continuity-lock/consumed gate.

## Incidentes de herramienta preservados

- `main`: archivo vacío accidental creado/revertido; comparación contra el HEAD anterior devuelve `files=[]`.
- rama viva: **cuatro ciclos** accidentales de archivos vacíos durante intentos mal enrutados de ref-sync; todos revertidos. HEAD corregido previo al sync: `11cef766ba80760cd730090a143ed4e1ea9f2266`; árbol `8f12db2cd89b7478b68a8d352e11003f441d1113`, idéntico al preincidente.
- provider/data/deploy/merge effects = 0.

Los detalles completos están en las dos evidencias de tooling del orden canónico. No usar acciones contents para probes ni movimiento de refs.

## Causa sistémica acumulada

RC15 prueba autoridad histórica en provider/source/state, writers read-only que escriben estado, bypass request/lock, legacy live connectivity, trigger/request/executor mismatch, external-HR authority gaps y **PR-base execution authority**.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`. F1 solo cuando se demuestre exhaustividad. G2-B no se toca.

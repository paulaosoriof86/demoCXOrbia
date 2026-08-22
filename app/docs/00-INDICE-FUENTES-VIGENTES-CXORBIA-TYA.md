# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-22  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**RC15_CONTROL_PLANE_EPOCH:** `RC15-CP119-CONTAINED-20260821-01`  
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `RC15_SYSTEMIC_AUDIT_AND_G2B_RECOVERY_HOLD`

## Orden canónico obligatorio

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/evidence/RC15-MASTER-PLAN-FREEZE-LATEST.json`.
4. `tools/continuity/validate-cxorbia-master-plan-freeze.js`.
5. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` + detalle de tramo más reciente.
6. CP119 containment request/evidence.
7. emergency V156 containment evidence.
8. G2-B terminal evidence/request/consumed ledger/provider readiness histórica.
9. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `EXECUTION-STATE`, `SOURCE-LOCK`.
10. `CAMBIOS-BACKEND.md` + addenda RC15, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Plan prevalente

Plan vigente `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`. No cambió. `providerMutationAuthorizedNow=false`.

## Estado formal

Phase A = `98/100`. G2-B = `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F0 continúa.

## RC15 F0 — avance canónico

- Hallazgos clasificados: **138**.
- HOLD/P0 acumulados: **31**.
- Contenidos: CP093 y CP119.
- HOLD/P0 residuales: **29**.
- Exhaustividad: **2/4**.
  - `allWorkflowsClassified=true`.
  - `allWorkflowDispatchClassified=true`.
  - `allRequestsClassified=false`.
  - `allProviderWriteEntrypointsClassified=false`.

Cerrado previamente: workflows 105/105; `.github/cxorbia-firebase-requests` 33/33; `backend/requests` 6/6; HTTP mutation routers 3/3; `hr-live-service` 8/8 por rol; `tools/production` 2/2; `tools/dev` 1/1; `tools/backend` 4/4; top-level `tools/empalme` 2/2; `tools/integration` 5/5 estáticos.

## Tramo 13

- `CP135` PASS/control F2: Auth activation V1 conserva writes reales, pero su request actual está consumido/deshabilitado y el run histórico no entró al write boundary.
- `CP136` PASS/control F2: Auth activation V2/rootfix conserva writes reales, pero request consumido; fase 2 nunca inició.
- `CP137` PASS/control F2: staff exact-write V1/V2 reconciliados contra requests consumidos/deshabilitados; sin replay actual.
- `CP138` PASS/control F2: consumed one-shot ledger bloquea replay para gates conocidos, pero declara `historicalGlobalExhaustive=false`; CP117 sigue abierto.
- `CP011` fue revalidado, no duplicado: temp operator Corte4 continúa como HOLD histórico ya contabilizado y reservado para F1.

No hubo nuevos HOLD en este tramo.

## Abierto

Terminar CP117/aliases/execute markers/authorizations dispersas de `backend/config`, y provider entrypoints restantes de `tools/qa`/`tools/release`. No declarar exhaustividad antes de agotar ambos universos.

## CP119 / G2-B

CP119 sigue `CONTAINED_PASS`; Cloud Run actual `cxorbia-live-hr-dev-00011-f2f`. G2-B no fue ejecutado y F3 deberá revalidar readiness antes de cualquier autorización futura.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE_CP117_ALIASES_EXECUTE_MARKERS_REMAINING_BACKEND_CONFIG_AND_PROVIDER_ENTRYPOINTS_IN_TOOLS_QA_TOOLS_RELEASE`. F1 no inicia antes de 4/4. G2-B no se toca.

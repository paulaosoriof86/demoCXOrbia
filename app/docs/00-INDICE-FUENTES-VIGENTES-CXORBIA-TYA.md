# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentIteration:** `I5-G2`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `RC15_SYSTEMIC_AUDIT_P0_119_AND_G2B_RECOVERY_HOLD`

## Orden canónico obligatorio

1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/evidence/RC15-MASTER-PLAN-FREEZE-LATEST.json`.
4. `tools/continuity/validate-cxorbia-master-plan-freeze.js`.
5. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` + detalle de tramo más reciente.
6. `app/docs/evidence/RC15-PLAN-CHANGE-REQUEST-EMERGENCY-V156-INERTIZATION-20260821.json`.
7. `app/docs/evidence/RC15-TOOLING-INCIDENT-MAIN-NET-ZERO-20260821.json` y `RC15-TOOLING-INCIDENT-LIVE-BRANCH-NET-ZERO-20260821.json`.
8. G2-B terminal evidence/request/consumed ledger/provider readiness.
9. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `EXECUTION-STATE`, `SOURCE-LOCK`.
10. `CAMBIOS-BACKEND.md` + addenda RC15, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Plan prevalente

Único plan vigente: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

El plan no cambió. `providerMutationAuthorizedNow=false`.

## Estado formal

Phase A = `98/100`. G2-B continúa terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F0 continúa.

## RC15 F0 — avance canónico

- Hallazgos clasificados: **119**.
- HOLD/P0 descubiertos acumulativamente: **26**.
- Contenido: `RC15-CP-093`.
- HOLD/P0 residuales: **25**.
- Flags de exhaustividad: **2/4 true**.
  - `allWorkflowsClassified=true`.
  - `allWorkflowDispatchClassified=true`.
  - `allRequestsClassified=false`.
  - `allProviderWriteEntrypointsClassified=false`.
- Inventarios cerrados: workflows HEAD/base **105/105**; `.github/cxorbia-firebase-requests` **33/33**; `backend/requests` **6/6**.

## P0 actual — RC15-CP-119

`P0_PROVEN_CURRENT_DEPLOYED_LEGAL_ACCEPTANCE_WRITE_GATE_SURVIVES_CONSUMED_REQUEST`.

La revisión Cloud Run vigente sigue siendo `cxorbia-live-hr-dev-00010-n78`, que fue la revisión desplegada por I3 específicamente con `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED=true` y gate `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`. El request quedó consumido, pero con `futureHumanLegalAcceptanceWriteBudget=1` y aceptación humana pendiente. El execute marker histórico sigue `enabled=true/consumed=false`.

El runtime actual conserva `POST /api/tenants/tya/legal/commands`; `firebase.json` sigue reescribiendo `/api/tenants/**` al mismo Cloud Run y el adapter protegido conserva la acción humana explícita. Esto demuestra que el consumo del request no deshabilitó el write gate ya desplegado.

El workflow actual que comparte ese execute path falla cerrado para replay I3 porque exige el execute G2-B como único archivo cambiado. El riesgo vigente no es un redeploy automático: es **el write endpoint que ya está desplegado**.

No existe autorización vigente para modificar Cloud Run. La contención provider requiere autorización separada y explícita para desactivar el env gate y hacer readback sin otras mutaciones. Mientras tanto, F0 solo continúa en read-only/auditoría/documentación.

## Control-plane adicional

- Consumed ledger actual no cubre exhaustivamente autorizaciones C6/Corte6/I3 antiguas; F2 debe normalizar cobertura.
- Evidence aliases permanece epoch 47 vs continuity lock epoch 50; no ejecuta trabajo, pero es drift documental/control-plane.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` read-only sobre el resto de `backend/config`, execute markers, ledgers/aliases dispersos y provider-write entrypoints. En paralelo, `RC15-CP-119` queda pendiente de autorización explícita de contención. F1 aún no inicia. G2-B no se toca.

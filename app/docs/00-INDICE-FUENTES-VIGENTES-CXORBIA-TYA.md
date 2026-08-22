# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-21  
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
5. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json`.
6. `backend/config/rc15-cp119-legal-gate-containment-request.json`.
7. `app/docs/evidence/RC15-CP119-LEGAL-WRITE-GATE-CONTAINMENT-LATEST.json`.
8. `app/docs/evidence/RC15-PLAN-CHANGE-REQUEST-EMERGENCY-V156-INERTIZATION-20260821.json`.
9. G2-B terminal evidence/request/consumed ledger/provider readiness.
10. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `EXECUTION-STATE`, `SOURCE-LOCK`.
11. `CAMBIOS-BACKEND.md` + addenda RC15, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Plan prevalente

Único plan vigente: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

El plan no cambió. Después de la contención CP119, `providerMutationAuthorizedNow=false`.

## Estado formal

Phase A = `98/100`. G2-B continúa terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F0 continúa.

## RC15 F0 — avance canónico

- Hallazgos clasificados: **119**.
- HOLD/P0 descubiertos acumulativamente: **26**.
- Contenidos: `RC15-CP-093` y `RC15-CP-119`.
- HOLD/P0 residuales: **24**.
- Flags de exhaustividad: **2/4 true**.
  - `allWorkflowsClassified=true`.
  - `allWorkflowDispatchClassified=true`.
  - `allRequestsClassified=false`.
  - `allProviderWriteEntrypointsClassified=false`.
- Inventarios cerrados: workflows HEAD/base **105/105**; `.github/cxorbia-firebase-requests` **33/33**; `backend/requests` **6/6**.

## CP119 — CONTENIDO PASS

La autorización explícita actual permitió una única actualización de configuración de `cxorbia-live-hr-dev`. Se removieron exclusivamente:
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED`;
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_GATE`.

Evidencia de ejecución:
- commit de ejecución: `95249297866afacfb98a47a5bca8c2d8b4a9ae35`;
- workflow run `32545006587`, job `96961807381` = PASS;
- artifact `9468227008`, digest `sha256:92adc7eee31b3155cb0ac0ee6caff9899b721826e34b5a08632200665355afbc`;
- revisión antes: `cxorbia-live-hr-dev-00010-n78`;
- revisión después: `cxorbia-live-hr-dev-00011-f2f`, 100% del tráfico;
- misma imagen, misma service account y demás env sin cambios;
- Cloud Build=0, Hosting deploy=0 y writes Firestore/Auth/Storage/HR/Rules/Make/Gemini/pagos/G2-B=0;
- POST directo y vía Hosting a `/api/tenants/tya/legal/commands` devuelve HTTP 423 `LEGAL_RUNTIME_HUMAN_ACCEPTANCE_WRITE_GATE_DISABLED` antes de autenticación.

El request queda consumido y el workflow temporal queda retirado. No retry.

## Efecto sobre G2-B

El receipt histórico G2-B **no cambió**: su baseline/after histórico sigue siendo `00010-n78` y su decisión sigue `RECOVERY_NO_PROVIDER_SIDE_EFFECT`. Sin embargo el proveedor actual avanzó legítimamente a `00011-f2f` por CP119; por ello el anterior `FORENSIC_PROVIDER_LANE_READY` queda histórico/stale y F3 deberá revalidar el carril contra la revisión actual antes de cualquier futura recuperación. Esto no autoriza G2-B.

## Control-plane adicional

- Consumed ledger sigue sin cobertura histórica global exhaustiva; F2 debe normalizar C6/Corte6/I3.
- Evidence aliases permanece epoch 47 vs lock 50; no ejecuta trabajo, pero es drift documental/control-plane.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: terminar `backend/config`, execute markers, ledgers/aliases dispersos y provider-write entrypoints hasta llevar exhaustividad de **2/4 a 4/4**. F1 aún no inicia. G2-B no se toca.

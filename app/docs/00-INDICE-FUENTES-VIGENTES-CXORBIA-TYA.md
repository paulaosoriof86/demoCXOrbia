# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-22  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**RC15_CONTROL_PLANE_EPOCH:** `RC15-F0-TRANCHE11-20260822-01`  
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
6. `backend/config/rc15-cp119-legal-gate-containment-request.json`.
7. `app/docs/evidence/RC15-CP119-LEGAL-WRITE-GATE-CONTAINMENT-LATEST.json`.
8. `app/docs/evidence/RC15-PLAN-CHANGE-REQUEST-EMERGENCY-V156-INERTIZATION-20260821.json`.
9. G2-B terminal evidence/request/consumed ledger/provider readiness histórica.
10. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `EXECUTION-STATE`, `SOURCE-LOCK`.
11. `CAMBIOS-BACKEND.md` + addenda RC15, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Plan prevalente

Único plan vigente: `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

El plan no cambió. `providerMutationAuthorizedNow=false`.

## Estado formal

Phase A = `98/100`. G2-B continúa terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F0 continúa.

## RC15 F0 — avance canónico

- Hallazgos clasificados: **125**.
- HOLD/P0 descubiertos acumulativamente: **28**.
- Contenidos: `RC15-CP-093` y `RC15-CP-119`.
- HOLD/P0 residuales: **26**.
- Flags de exhaustividad: **2/4 true**.
  - `allWorkflowsClassified=true`.
  - `allWorkflowDispatchClassified=true`.
  - `allRequestsClassified=false`.
  - `allProviderWriteEntrypointsClassified=false`.

Inventarios/subdominios cerrados:
- workflows HEAD/base 105/105;
- `.github/cxorbia-firebase-requests` 33/33;
- `backend/requests` 6/6;
- mutation routers HTTP del Cloud Run actual 3/3;
- `backend/runtime/hr-live-service` 8/8 por rol;
- `tools/production` 2/2;
- `tools/dev` 1/1;
- `tools/backend` 4/4;
- scripts ejecutables top-level `tools/empalme` 2/2 clasificados.

## Tramo 11 — conclusiones nuevas

`RC15-CP-120`: user-admin es write productivo intencional, protegido por Firebase ID token, tenant exacto y rol `super`.

`RC15-CP-121`: el HTTP mutation surface desplegado queda cerrado. Solo existen user-admin, legal y G2-B synthetic; legal está CP119-contained, G2-B está deshabilitado/bloqueado y otros non-GET reciben 405.

`RC15-CP-122`: `tools/production` contiene un Hosting REST primitive real que necesita token del caller y un validator read-only. F2 debe gobernar quién puede entregar credencial al primitive.

`RC15-CP-123`: `tools/dev` y `tools/backend` son locales/read-only en el alcance auditado.

`RC15-CP-124` HOLD: `tools/empalme/tya-apply-post-v96-source-lock.sh` puede reescribir runtime histórico, commit y push directo a la rama viva sin autoridad canónica actual.

`RC15-CP-125` HOLD: el request V105/V106 sigue `authorized=true` sin terminalización y su materializador puede reemplazar 70 rutas runtime con autoridad histórica.

Ambos HOLD nuevos se reservan para inertización conjunta de F1; no se ejecutan durante F0.

## CP119 / proveedor actual

CP119 permanece `CONTAINED_PASS`. Cloud Run actual `cxorbia-live-hr-dev-00011-f2f`; misma imagen/service account que antes, sin gate legal I3. POST legal directo y vía Hosting devuelve 423 antes de auth.

## G2-B

Receipt histórico intacto con baseline `00010-n78`; readiness anterior stale tras CP119. F3 deberá revalidar contra proveedor actual. Esto no autoriza recovery.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: terminar `backend/config`, execute markers/aliases/ledgers dispersos y provider/tool write entrypoints restantes hasta pasar de **2/4 a 4/4**. F1 aún no inicia. G2-B no se toca.

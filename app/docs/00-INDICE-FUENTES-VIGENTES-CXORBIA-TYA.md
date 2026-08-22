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

- Hallazgos clasificados: **134**.
- HOLD/P0 descubiertos acumulativamente: **31**.
- Contenidos: `RC15-CP-093` y `RC15-CP-119`.
- HOLD/P0 residuales: **29**.
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
- scripts ejecutables top-level `tools/empalme` 2/2;
- `tools/integration` 5/5 archivos estáticos.

## Tramo 12 — conclusiones nuevas

`RC15-CP-126` PASS: `tools/integration` es configuración/políticas estáticas, sin ejecutables.

`RC15-CP-127` HOLD: `tools/reconciliation/tya-apply-existing-r11d-r14c-certification-r18b.mjs` puede sobrescribir el snapshot canónico tracked `app/data/tya-hr-source-safe-periods.js` sin current plan/lock/auth.

`RC15-CP-128` PASS/control F2: Rules API primitive puede escribir solo con credencial + execute flag; F2 debe gobernar quién puede entregarlos.

`RC15-CP-129` PASS/control F2: Hosting REST primitive histórico está asociado a request canónico ya `enabled=false/consumed=true`; F2 debe impedir caller authority paralela.

`RC15-CP-130` HOLD: creadores históricos Firebase R15/R15B pueden crear proyecto + addFirebase con static confirm + credencial, sin current plan/lock/current authorization artifact.

`RC15-CP-131` HOLD: `tya-r15g-dev-root-deploy.sh` conserva un camino `workflow_dispatch` con confirmación histórica que no valida el request y puede reconstruir source + desplegar Hosting.

`RC15-CP-132` PASS/control F2: client Auth/Firestore primitive tiene `apply/rollback` write-capable; su orchestrator canónico está request-bound y el request actual está consumido.

`RC15-CP-133` PASS: profile-full Firestore writer falla cerrado porque su request actual está consumido/desautorizado.

`RC15-CP-134` PASS/control F2: atomic apply runner está request/hash/parent-bound, sin provider/data writes; F2 debe reconciliar provenance/authority con el plan vigente.

Los tres HOLD nuevos quedan reservados para inertización conjunta de F1; no se ejecutan durante F0.

## backend/config y tooling todavía abiertos

Se avanzó en familias Auth/IAM/deploy históricas: los requests inspeccionados están terminales, consumidos o fail-closed. No alcanza todavía para `allRequestsClassified=true`.

`tools/reconciliation` fue inventariado en 22 archivos; `tools/release` y `tools/qa` tuvieron una tranche de high-risk entrypoints clasificada, pero sus universos completos siguen abiertos. No se declara exhaustividad prematuramente.

## CP119 / proveedor actual

CP119 permanece `CONTAINED_PASS`. Cloud Run actual `cxorbia-live-hr-dev-00011-f2f`; misma imagen/service account que antes, sin gate legal I3. G2-B no fue ejecutado.

## G2-B

Receipt histórico intacto con baseline `00010-n78`; readiness anterior stale tras CP119. F3 deberá revalidar contra proveedor actual. Esto no autoriza recovery.

## Próximo exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: terminar `backend/config` + execute markers/aliases/ledgers dispersos y cerrar provider/tool write entrypoints restantes de `tools/qa` y `tools/release` hasta pasar de **2/4 a 4/4**. F1 aún no inicia. G2-B no se toca.

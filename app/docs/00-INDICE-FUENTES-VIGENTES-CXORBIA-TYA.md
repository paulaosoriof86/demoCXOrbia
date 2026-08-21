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
5. `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json`.
6. `app/docs/evidence/I5-G2B-P0-WRITEPATH-RECOVERY-LATEST.json`.
7. `backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json`.
8. `backend/config/cxorbia-consumed-one-shot-gates.json`.
9. `app/docs/evidence/I5-G2B-PROVIDER-FORENSIC-READINESS-LATEST.json`.
10. `app/docs/evidence/I5-G2B-ATOMIC-CONTINUITY-SYNC-LATEST.json`.
11. `backend/config/cxorbia-g2a-production-readonly-smoke.json`, `backend/config/cxorbia-g1-production-cutover.json` y `backend/config/cxorbia-r4-root-cause-closure.json`.
12. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`, `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
13. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.
14. Addenda, planes previos y PR #7: solo evidencia/contexto. No pueden alterar el plan maestro congelado ni reactivar gates.

## Regla prevalente de plan

El único plan operativo vigente hacia producción y postproducción es `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, `MASTER_PLAN_ID=CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`, versión `1.0.0`, hash SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

No se crea otro plan. Una modificación requiere `PLAN_CHANGE_REQUEST`, autorización explícita de Paula y actualización atómica. Si plan y lock no coinciden, estado `CONTINUITY_DRIFT_BLOCKED`.

## Estado formal preservado

I1–I4, R1–R4 y G1 permanecen PASS/FROZEN. G2-A permanece PASS/FROZEN. G2-B sigue siendo el único frente pendiente de Phase A.

Recovery `i5-g2b-p0-writepath-recovery-20260821-02` = `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; request consumido; providerMutationExecutions=0. Provider lane posterior = `FORENSIC_PROVIDER_LANE_READY`, sin autorización de ejecución.

## F0 RC15 activo — inventario ampliado

La auditoría sistémica continúa en `F0_RC15_CONTROL_PLANE_WRITE_SURFACE_INVENTORY`. La evidencia vigente contiene **27 hallazgos clasificados** y **5 HOLD** latentes confirmados:
- `RC15-CP-005`: bootstrap Corte4, `workflow_dispatch` + `enabled=true` + `providerConfigWrites=true`.
- `RC15-CP-011`: protected smoke Corte4, `workflow_dispatch`/push + `enabled=true`, configuración Auth y usuario temporal reversible.
- `RC15-CP-014`: snapshot histórico G2-B synthetic aún `enabled=true`, `consumed=false`; puede alterar state/evidence aunque el lock vigente ya lo considera no autoritativo.
- `RC15-CP-017`: creación histórica Firebase DEV Corte4, `workflow_dispatch`/push + `enabled=true`, `projectCreate=true`, `firebaseAdd=true`.
- `RC15-CP-025`: C6 postdeploy read-only recheck manual/repetible capaz de reescribir request/execute/evidence canónico aun con el one-shot original consumido.

Se demostraron además numerosas rutas peligrosas históricas correctamente consumidas/fail-closed. La cobertura sigue `EXPANDED_NOT_EXHAUSTIVE`; F0 no está cerrado.

## Próximo paso exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`.

Hasta cerrar F0: provider/data/deploy/recovery/synthetic-stage writes = 0; no nueva candidata, rama, PR, workflow, PREPROD, HR externa, datos/credenciales reales, pagos, Make/Gemini o merge.

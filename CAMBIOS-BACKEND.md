# CAMBIOS-BACKEND.md

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## 2026-08-21 — RC15 F0 · EXPANSIÓN FORENSE DE SUPERFICIES WRITE-CAPABLE

### Qué se hizo
- Se revalidó la identidad del plan maestro congelado contra Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, lock F0 y `providerMutationAuthorizedNow=false`.
- Se amplió `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` de 5 a 18 hallazgos clasificados.
- Se auditaron rutas activables por `workflow_dispatch`, `push` y `pull_request synchronize`, requests históricos, execute markers, permisos y consumo one-shot.
- Se confirmó que varias rutas históricas sí están correctamente cerradas por `enabled=false` + `consumed=true`, incluyendo I3 visible-login, C6 client materialization, R3-C Hosting, Corte6 Auth/RBAC, Corte6 session-continuity Hosting y credential import.

### Nuevos hallazgos de causa raíz
- `RC15-CP-011` — **HOLD**: `cxorbia-corte4-protected-smoke-temp-operator.yml` conserva `workflow_dispatch`/push y su request histórico sigue `enabled=true`; permite toggle de Email/Password y crear/claim/delete un usuario Auth temporal.
- `RC15-CP-014` — **HOLD**: el request histórico G2-B synthetic permanece `enabled=true`, `consumed=false`. Su preflight actual no hace provider writes, pero sí puede consumir el snapshot y alterar evidencia/estado canónico del branch sin consultar primero el continuity lock vigente.
- `RC15-CP-017` — **HOLD**: `cxorbia-r24-new-empty-firebase-dev.yml` conserva `workflow_dispatch`/push y `corte4-new-empty.json` sigue `enabled=true` con `projectCreate=true` y `firebaseAdd=true`; es una superficie histórica capaz de intentar creación de proyecto/Firebase.
- Se mantiene `RC15-CP-005` — **HOLD** previamente confirmado: bootstrap Corte4 con `workflow_dispatch` + `enabled=true` + `providerConfigWrites=true`.

Esto demuestra que la causa del bucle no era únicamente el antiguo `job-level if` de G2-B. Persistieron múltiples superficies históricas con autoridad vieja aún materializada. RC15 está identificando ese problema como sistema para cerrarlo de una sola vez en F1/F2, antes de volver a tocar proveedor.

### Nota de continuidad
Se produjo previamente el commit `ce93b44b41adb4383d416b4db498e17105f1a418` como checkpoint readback del evidence F0 sin cambio de contenido. No produjo provider/data/deploy writes ni cambia el estado formal. El avance material de esta ronda comienza con la ampliación de la matriz RC15 posterior a ese checkpoint.

### Seguridad
- Provider writes: 0.
- Cloud Build / Cloud Run / Hosting deploy: 0.
- Firestore / Auth / Storage / HR / Rules / pagos / Make / Gemini: 0.
- Recovery G2-B: 0.
- Synthetic stage: 0.
- Merge: false.

### Clasificación
- **Reusable CXOrbia:** inventario sistémico de superficies históricas, separación entre evento histórico y autoridad actual, futura inertización F1 y binding F2.
- **Exclusivo TyA:** requests/targets históricos Corte4, Corte6 y G2-B del tenant TyA.
- **Claude/prototipo:** sin cambio de UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** auditoría de workflows, requests, control-plane y evidence.

### Siguiente
Continuar F0 hasta clasificar **todas** las superficies capaces de mutar proveedor, datos, producto o estado canónico. No se ejecuta F1 todavía y no se toca G2-B hasta que la matriz sea exhaustiva.

## 2026-08-21 — RC15 · CONGELAMIENTO DEL PLAN MAESTRO + INICIO AUDITORÍA SISTÉMICA

### Qué se hizo
- Se consolidó un único plan F0–F10 hacia producción y postproducción en `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
- El plan queda congelado con SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475` y Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.
- `cxorbia-phase-a-continuity-lock.json` incorpora `masterPlan`, fase/cursor y política `PLAN_CHANGE_REQUEST_ONLY_EXPLICIT_PAULA_ATOMIC`.
- Se agregó `tools/continuity/validate-cxorbia-master-plan-freeze.js`.
- Se creó `app/docs/evidence/RC15-MASTER-PLAN-FREEZE-LATEST.json`.
- Se inició F0 con `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json`.

### Hallazgo inicial F0
`RC15-CP-005`: `.github/workflows/cxorbia-corte4-bootstrap-readonly-execute.yml` conserva `workflow_dispatch` y `.github/cxorbia-firebase-requests/corte4-bootstrap-execute.json` conserva `enabled=true` + `providerConfigWrites=true`. Es una superficie histórica write-capable latente. No fue disparada por este bloque. Debe quedar inertizada en F1, después de completar el inventario exhaustivo de F0.

### Seguridad
Este bloque es exclusivamente repo/control-plane/documentación:
Cloud Build=0, Cloud Run deploy=0, Hosting deploy=0, Firestore/Auth/Storage/HR/payment/Rules/Make/Gemini writes=0, recovery=0, synthetic stage=0, merge=false.

### Clasificación
- **Reusable CXOrbia:** master-plan hash lock, change-control y auditoría exhaustiva de superficies.
- **Exclusivo TyA:** baseline G2-B y hallazgo histórico Corte4 dentro del repo TyA.
- **Claude/prototipo:** sin cambio de UI, `/app/modules` o `/app/core`.
- **Academia:** sin cambio funcional; sigue siendo requisito transversal del plan.
- **Sin impacto Claude:** control-plane, docs, validator y evidence.

### Siguiente
`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: ampliar el inventario a todos los workflows write-capable, `workflow_dispatch`, requests/execute markers, permisos, replay, concurrency y fan-out. Ninguna provider mutation antes del cierre de F0.

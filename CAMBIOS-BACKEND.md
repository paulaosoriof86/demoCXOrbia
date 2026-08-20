# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R3`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## 2026-08-20 — I5-R2 · CONTINUITY DRIFT CLOSURE

### Resultado
`CONTINUITY_DRIFT_AUDIT_PASS` preparado como estado canónico. El plan formal queda en **90/100**, con `I5-R1` e `I5-R2` PASS y `I5-R3_CRITICAL_PRODUCT_ACCEPTANCE_RECONCILIATION` como siguiente bloque único.

### Cambios ejecutados
- Se retiró como blocker activo la ruta histórica `cxorbia-preprod-20260819` / `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`. Esa ruta queda preservada solo como evidencia histórica; no debe reactivarse.
- Se consolidó `PROMOTE_EXISTING_CLEAN_PROJECT` sobre `cxorbia-backend-dev` como única topología productiva vigente.
- Se creó `backend/config/cxorbia-consumed-one-shot-gates.json` para impedir que requests consumidos reaparezcan como ejecutables por deriva conversacional/documental.
- Se creó `backend/config/cxorbia-evidence-aliases.json` para mapear nombres históricos de PASS a significados canónicos sin autorizar reruns.
- Se amplió `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js` para verificar también CAMBIOS/RESUMEN/PENDIENTES, ledger one-shot, alias registry y ruta PREPROD superseded.
- Se corrigió `tools/production/validate-production-promotion-gates.js`: una autorización de cutover puede habilitar deploy/cutover, pero **no autoriza business/data writes**. `productionWritesAuthorized` permanece `false` salvo un gate separado explícito.
- Se eliminó de la evidencia de promoción la nomenclatura opaca M3/M4/M5/M6/M8, que no tenía definición vigente comprobable. Se reemplazó por estados y referencias directas ya documentadas.
- El request one-shot vigente `i5-existing-project-precutover-staff-live-authority-readonly-20260820-01` queda registrado como consumido: run `32342457328`, job `96344128319`, artifact `9396828201`, `PASS_READONLY_POST_GATES`, sin writes/deploy/merge/producción.

### Evidencia histórica reutilizable, no rerunnable por nombre
- `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY` → Shopper histórico Auth PASS.
- `PASS_READONLY_POST_GATES` → Staff/Admin runtime read-only PASS.
- `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY` → autoridad/scope/reload Staff/Admin PASS.
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY` → same-build Hosting remote parity PASS.

### Causas raíz cerradas en R2
- RC01 `CANONICAL_STATE_DRIFT`.
- RC05 `ONE_SHOT_GATE_STATE_DRIFT_OR_STALE_REQUESTS`.
- RC06 `EVIDENCE_NAMING_MISMATCH_CAUSING_REDUNDANT_RERUNS`.
- RC04 queda reafirmada como PASS después de corregir la semántica de autorización de writes del validador productivo.

### Preservado
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- I1–I4: PASS/FROZEN.
- Frontend `/app/modules` y `/app/core`: sin modificación por este bloque.
- Legacy `tya-plataforma`: intacto.
- Producción: no desplegada ni autorizada.

### Clasificación obligatoria
- **Reusable CXOrbia:** continuity lock, ledger de one-shot gates, alias registry y validadores fail-closed.
- **Exclusivo TyA:** evidencia y topología concreta `cxorbia-backend-dev`, verdad HR/Shopper/Finance a aceptar en R3.
- **Claude/prototipo:** cero cambio frontend; R3 debe documentar cualquier P0 UI por archivo/módulo sin parche backend.
- **Academia:** sin reconstrucción; mantener alineación futura con HR viva, roles, estados financieros y rutas reales.
- **Sin impacto Claude:** control-plane, gates, validator semantics y documentación.

### Seguridad
0 deploy productivo, 0 merge, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes. La autorización de cutover continúa pendiente y no puede consumirse antes de `ROOT_CAUSE_CLOSED_PASS`.

---

## HISTORIAL PRESERVADO — 2026-08-19 · RUTA PREPROD DESCARTADA

El epoch `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39` registró un intento autorizado de crear `cxorbia-preprod-20260819` y el blocker `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`. Evidencia: run `32332125828`, job `96314651567`, artifact `9393386559`; root-cause read-only run `32332360361`, artifact `9393462199`; route-auth run `32332788919`, job `96316503352`, artifact `9393599029`. Hubo 0 proyectos creados, 0 Hosting PREPROD, 0 UAT y 0 writes. **Este bloque se conserva solo como historia y no gobierna el plan actual.**

## HISTORIAL PRESERVADO — 2026-08-19 · I4 CIERRE TERMINAL

- Same-build Hosting DEV: run `32328316954`, job `96303971844`, artifact `9392151808`, `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- Staff/Admin provider-backed: run `32329139725`, artifact `9392431939`, `PASS_READONLY_POST_GATES` + `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Shopper histórico congelado: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; no reset/reproceso por defecto.
- Finanzas canónicas: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `liquidada != pagada`.
- Requests one-shot del cierre fueron corregidos a consumidos/deshabilitados; commits históricos `246cc1dd61886911dfdeb36555effb514d587a2f` y `8831723a4cf3e656b3dddd1ed5c72b45f0dc2ec8`.
- I4 cerró PASS/FROZEN en 85/100 antes de iniciar el plan I5 definitivo.

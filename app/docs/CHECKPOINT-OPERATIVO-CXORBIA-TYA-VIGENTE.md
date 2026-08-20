# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_R3_PASS__I5_R4_ACTIVE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Subestado:** `I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`  
**currentIteration:** `I5-R4`  
**Score formal:** `93% / 7%`  
**Producción autorizada:** `NO`

## 1. Destino y source lock

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- I1–I4: `PASS/FROZEN`.
- I5-R1, I5-R2, I5-R3: `PASS`.

## 2. Topología productiva autoritativa

`PROMOTE_EXISTING_CLEAN_PROJECT` sobre:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`.

`cxorbia-preprod-20260819` no forma parte del plan y su ruta Project Creator está `SUPERSEDED`.

## 3. I5-R3 cerrado

Salida terminal: `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.

Matriz canónica: `backend/config/cxorbia-r3-critical-product-acceptance.json`.

Los ocho criterios obligatorios cerraron PASS:

1. `ROADMAP_LIVE_NO_CLONES`.
2. `SHOPPERS_VISIBLE_EXPECTED_SCOPE`.
3. `VISITS_CURRENT_AND_HISTORY_VISIBLE`.
4. `FINANCE_CANONICAL_SEMANTICS`.
5. `MULTIROLE_SCOPE_PASS`.
6. `RELOAD_SESSION_PASS`.
7. `NO_DEMO_OR_STALE_FALLBACK`.
8. `SAME_ARTIFACT_PASS`.

## 4. Evidencia terminal reutilizada/actualizada

### Staff/Admin actual

Run `32342457328`, job `96344128319`, artifact `9396828201`:

- `PASS_READONLY_POST_GATES` + `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- lane `authenticated-human-canonical`;
- 15 periodos, 660 visitas, 200 shoppers;
- first `2025-06`, latest `2026-08`;
- project `cinepolis`;
- membership verificada;
- project/period selectors montados;
- stale provider-empty limpiado;
- reload y new-tab estables;
- exact crosswalk sin fuzzy matching;
- 0 writes/deploy/merge/producción.

### Shopper congelado

`PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`: exact identity, profile, membership, crosswalk, history e history E2E. No se accedió ni reseteó Shopper en la prueba Staff actual.

### Cliente actual

Run `32400495121`, job `96527305525`, artifact `9418300899`: `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`.

- login visible único canónico;
- legacy overlay ausente;
- Firebase Auth autenticado;
- role `cliente`, namespace `staff`;
- tenant `tya`, projectIds `[cinepolis]`;
- HR authority aplicada;
- `cli_dashboard` renderizado sin excepción;
- 0 writes/deploy/merge/producción.

### Multirol/reload

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES` conserva Staff + Shopper + Client, tres reloads y new-tab. La evidencia Staff/Client actual refuerza el alcance crítico sin reejecutar credencial Shopper congelada.

### Finanzas

- mayo: 44 visitas / 44 pagadas / 0 pendientes;
- junio: 44 visitas / 2 pagadas / 42 pendientes / Q451 confirmado GT;
- `conciliada_pendiente_pago` y `pagada` son estados separados;
- `paymentExecutionAllowed=false`.

### Same artifact

- Hosting same-build: run `32328316954`, artifact `9392151808`, remote parity PASS.
- comparación `f9802f... → 9df736a...`: cero cambios runtime del producto en `app/` fuera de documentación; cambios I5 son control-plane/docs/QA/workflows.

## 5. HOLDs R3 cerrados sin P0

- `i5-r3-critical-product-acceptance-multirole-readonly-20260820-01`: HOLD por credential Shopper del harness stale; `productP0Proven=false`, consumido.
- `i5-r3-client-route-readonly-20260820-01`: HOLD por selector de login obsoleto del harness; `productP0Proven=false`, consumido.
- Cliente se revalidó con el login canónico y pasó; no se modificó producto.

RC07, RC08, RC09 y RC10 pasan a PASS.

## 6. Siguiente bloque exacto

`I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`.

Debe auditar RC01–RC10 ya cerradas y cerrar RC11 `SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT`, verificando además validators, rollback, coherencia documental/control-plane y ausencia de P0 nuevo.

Salida única: `ROOT_CAUSE_CLOSED_PASS` → 95%. Si falla, solo reparación focal del punto demostrado y repetición R4.

## 7. Secuencia bounded restante

1. R4 auditoría definitiva — activa — 95% al PASS.
2. G1 autorización explícita + cutover — 98% al ejecutar producción.
3. G2 smoke/hypercare — 100% al freeze.

## 8. Seguridad

No deploy adicional, no provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes, no merge y no producción. Legacy `tya-plataforma` permanece intacto.

## 9. Regla anti-pérdida

Una conversación nueva continúa desde `backend/config/cxorbia-phase-a-continuity-lock.json.currentIteration`. Si la documentación discrepa: `CONTINUITY_DRIFT_BLOCKED`; reconciliar control-plane y no reabrir bloques cerrados sin `P0_PROVEN`.

Epoch anterior preservado como historia: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.

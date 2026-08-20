# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R4`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## 2026-08-20 — I5-R3 · CRITICAL PRODUCT ACCEPTANCE CLOSURE

### Resultado

`CRITICAL_PRODUCT_ACCEPTANCE_PASS`. Score formal **93/100**. Se cerraron RC07, RC08, RC09 y RC10 y quedó activo únicamente `I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT` antes de pedir autorización de producción.

### Evidencia machine-readable creada

- `backend/config/cxorbia-r3-critical-product-acceptance.json` — matriz terminal de los ocho criterios R3.
- `backend/config/cxorbia-evidence-aliases.json` — se agregaron aliases terminales para all-role, Client actual y R3 PASS.
- `backend/config/cxorbia-consumed-one-shot-gates.json` — mantiene inmutables los requests R3 consumidos.
- `backend/config/cxorbia-production-promotion-gate-evidence.json` — avanza a `READY_FOR_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`; cutover sigue PENDING.

### Staff/Admin actual

Run `32342457328`, job `96344128319`, artifact `9396828201`, digest `sha256:01bcff79d4227d9a7de375c5827c3e2b12055ff2d42b0c0cea18e4a3b30ed456`:

- `PASS_READONLY_POST_GATES`;
- `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- lane `authenticated-human-canonical`;
- 15 periodos, 660 visitas, 200 shoppers;
- first `2025-06`, latest `2026-08`;
- project `cinepolis`;
- `frontendHandoffStatus=entered`;
- project/period selectors montados;
- stale provider-empty limpiado;
- reload/new-tab estable;
- crosswalk exacto, `fuzzyMatching=false`;
- 0 Auth/Firestore/HR/provider writes, 0 deploy, 0 merge, 0 producción.

### Shopper

Se reutilizó sin reejecución `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`: exact identity, UID, claims, profile, membership, crosswalk, history e historyE2E. La ejecución Staff actual confirmó `historicalShopperAccessThisRun=0` y `passwordResetsThisRun=0`.

### Cliente actual

El primer diagnóstico Cliente R3 falló por un selector viejo del harness (`#cxIntegratedAuthStep`), no por producto. Se corrigió **solo** `tools/qa/tya-c6-client-route-wait-diagnostic.mjs` para usar el login canónico `#loginForm/#lgUser/#lgPass/#lgSubmit`; no se tocó UI/runtime.

Run `32400495121`, job `96527305525`, artifact `9418300899`, digest `sha256:0cd51fb2cdcdaa6960712504641cd13ac23ad092c0b88b999cd41ba157e03e21`:

- `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`;
- single visible product login = true;
- legacy overlay = false;
- Firebase Auth = authenticated;
- provider role `cliente`, namespace `staff`;
- tenant `tya`, projectIds `[cinepolis]`;
- protected HR authority applied = true;
- `cli_dashboard` renderizado inmediatamente, sin excepción;
- 0 writes/deploy/merge/producción.

El request `i5-r3-client-single-login-readonly-20260820-02` quedó `enabled=false`, `consumed=true`, 1/1 ejecución consumida.

### Multirol y reload

Se reutilizó `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`, que conserva HUMAN_STAFF_AUTH, HUMAN_SHOPPER_AUTH, HUMAN_CLIENT_AUTH, THREE_RELOADS, NEW_TAB, CLIENT_THREE_RELOADS y CLIENT_NEW_TAB. R3 añadió pruebas actuales Staff/Admin y Cliente sin reejecutar Shopper congelado.

### HR, shoppers y visitas

`ROADMAP_LIVE_NO_CLONES`, `SHOPPERS_VISIBLE_EXPECTED_SCOPE` y `VISITS_CURRENT_AND_HISTORY_VISIBLE` quedaron PASS por composición de:

- Staff actual 15 periodos / 660 visitas / 200 shoppers / latest 2026-08;
- live-HR dynamic contract `PASS_C6_LIVE_HR_DYNAMIC_CANONICAL_STATE`, runtime read, non-frozen counts, unique visit keys;
- exact crosswalk sin fuzzy matching;
- canonical runtime fail-closed y sin demo/stale fallback silencioso.

### Finanzas

`FINANCE_CANONICAL_SEMANTICS` PASS:

- mayo 44 visitas / 44 pagadas / 0 pendientes;
- junio 44 visitas / 2 pagadas / 42 pendientes / Q451 confirmado GT;
- `app/adapters/tya-canonical-finance-read-model-v2.js` diferencia `conciliada_pendiente_pago` de `pagada`;
- `paymentExecutionAllowed=false`;
- cero lote ejecutable creado.

### Same artifact

`SAME_ARTIFACT_PASS`:

- source funcional congelado `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- same-build Hosting: run `32328316954`, artifact `9392151808`, remote parity PASS;
- compare `f9802f... → 9df736a...`: 116 commits de docs/control/QA/workflows, **0 cambios runtime del producto en `app/` fuera de `app/docs/**`**;
- no rebuild ni deploy en R3.

### HOLDs R3 que NO son P0

- `i5-r3-critical-product-acceptance-multirole-readonly-20260820-01`: `HOLD_HARNESS_STALE_SHOPPER_CREDENTIAL`, `productP0Proven=false`, consumido.
- `i5-r3-client-route-readonly-20260820-01`: `HOLD_HARNESS_STALE_SINGLE_VISIBLE_LOGIN_SELECTOR`, `productP0Proven=false`, consumido.

No autorizan reabrir I1–I4/R3 ni rerun de la misma ID.

### Causas raíz

- RC07 `LIVE_HR_CLONE_STALE_OR_DEMO_FALLBACK_RISK` → PASS.
- RC08 `SHOPPER_VISIT_SCOPE_VISIBILITY_RISK` → PASS.
- RC09 `FINANCE_PAYMENT_SEMANTICS_REGRESSION_RISK` → PASS.
- RC10 `MULTIROLE_HARNESS_OR_CREDENTIAL_STALENESS` → PASS.
- RC11 queda activa exclusivamente en R4.

### Clasificación obligatoria

- **Reusable CXOrbia:** matriz terminal de aceptación por criterios, composición de evidencia congelada + actual, clasificación durable de harness HOLD vs product P0, same-artifact compare.
- **Exclusivo TyA:** cifras HR/visitas/shoppers, verdad financiera mayo/junio, tenant `tya`/project `cinepolis`, evidencia Client/Shopper/Staff.
- **Claude/prototipo:** no hubo cambio frontend de producto ni P0 UI demostrado; no se requiere parche Claude.
- **Academia:** sin cambio de contenidos requerido; las rutas reales por rol, HR viva y semántica financiera quedan reafirmadas como fuente futura.
- **Sin impacto Claude:** harness QA, control-plane, aliases, ledgers, matrices y documentación.

### Seguridad

0 deploy productivo, 0 merge, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes en el cierre R3. Producción no autorizada. Legacy intacto.

---

## 2026-08-20 — I5-R2 · CONTINUITY DRIFT CLOSURE

`CONTINUITY_DRIFT_AUDIT_PASS`, score 90/100. Se cerraron RC01, RC05 y RC06; RC04 reafirmada PASS. PREPROD/Project Creator quedó `SUPERSEDED`; se consolidó `PROMOTE_EXISTING_CLEAN_PROJECT`; se persistieron continuity lock, one-shot ledger, alias registry y validadores fail-closed. Request Staff live-authority `i5-existing-project-precutover-staff-live-authority-readonly-20260820-01`: run `32342457328`, artifact `9396828201`, PASS read-only, sin writes/deploy/merge/producción.

Epoch histórico R2: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.

---

## HISTORIAL PRESERVADO — 2026-08-19 · RUTA PREPROD DESCARTADA

El epoch `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39` registró el target propuesto `cxorbia-preprod-20260819` y blocker `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`; hubo 0 proyectos creados, 0 Hosting PREPROD, 0 UAT y 0 writes. **Solo historia; no gobierna el plan actual.**

## HISTORIAL PRESERVADO — 2026-08-19 · I4 CIERRE TERMINAL

- Same-build Hosting DEV: run `32328316954`, artifact `9392151808`, `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- Staff/Admin provider-backed: run `32329139725`, artifact `9392431939`, runtime PASS.
- Shopper histórico congelado: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`.
- Finanzas canónicas: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; liquidación ≠ pago.
- I4 cerró PASS/FROZEN en 85/100 antes de iniciar I5.

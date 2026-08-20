# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R4`

## 1. Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: existente, draft/open/no merge.
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## 2. Source lock funcional

Producto funcional validado y congelado:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

I1–I4 permanecen `PASS/FROZEN`. I5-R1, R2 y R3 no sustituyen esta build funcional. Los cambios posteriores al lock funcional pertenecen a control-plane, documentación, QA harness o workflows/gates.

La comparación Git `f9802fdd498934a8e7729fa5c7d18341bec1cd71 → 9df736a33f8873e631b029c0c931769c58573f67` registró 116 commits pero **cero cambios en archivos runtime del producto** dentro de `app/` fuera de `app/docs/**`; `app/index-backend-dev.html`, `app/core/**`, `app/modules/**`, `app/adapters/**` y `app/data/**` permanecieron sin delta en esa ventana. Los commits de cierre R3 posteriores continúan siendo solo docs/control-plane. No rebuild antes de promoción.

## 3. Evidencia same-artifact

- Hosting same-build: run `32328316954`, artifact `9392151808`, `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- R3 machine evidence: `backend/config/cxorbia-r3-critical-product-acceptance.json`, `SAME_ARTIFACT_PASS`.
- Cliente actual: request consumido `i5-r3-client-single-login-readonly-20260820-02` declara `deployedProductSourceHeadSha=f9802f...` y pasó run `32400495121` sin deploy/rebuild.
- Staff/Admin actual: run `32342457328`, artifact `9396828201`, read-only, sin deploy/rebuild.

## 4. Contrato de promoción productiva

Autoridad: `backend/config/cxorbia-production-promotion-contract.json`.

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL futura productiva `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`;
- legacy como backend nuevo: prohibido.

## 5. Ambientes

- `cxorbia-backend-dev`: backend limpio canónico / migration target / production promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico, no destino Phase A.
- `tya-plataforma`: legacy intacto hasta cutover explícito.
- `cxorbia-preprod-20260819`: `SUPERSEDED`, no ejecutar ni crear.

La ruta histórica `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` no gobierna el plan y no puede reactivarse por documentación stale.

## 6. Estado de continuidad

Fuente machine-readable: `backend/config/cxorbia-phase-a-continuity-lock.json`.

- I5-R1 PASS.
- I5-R2 PASS: `CONTINUITY_DRIFT_AUDIT_PASS`.
- I5-R3 PASS: `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
- Score actual: `93/100`.
- Iteración activa: `I5-R4_INDEPENDENT_ROOT_CAUSE_CLOSURE_AUDIT`.

Controles durables:

- `backend/config/cxorbia-consumed-one-shot-gates.json`;
- `backend/config/cxorbia-evidence-aliases.json`;
- `backend/config/cxorbia-r3-critical-product-acceptance.json`.

## 7. Evidencia reutilizable preservada

- HR/visitas/shoppers Staff actual: run `32342457328`, 15 periodos, 660 visitas, 200 shoppers, first `2025-06`, latest `2026-08`, reload/new-tab estable.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`.
- Cliente: `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`, run `32400495121`, artifact `9418300899`.
- Multirol: `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.
- Finanzas: mayo 44/44; junio 2/44 + 42 pendientes + Q451; `conciliada_pendiente_pago` y `pagada` son estados distintos.

Los nombres distintos de evidencia no autorizan reruns.

## 8. Secuencia restante

`R4 → G1 → G2`.

R4 debe cerrar RC11 y auditar RC01–RC10 post-remediación. No cutover antes de `ROOT_CAUSE_CLOSED_PASS`; no producción sin autorización explícita; cutover no autoriza business/data writes.

## 9. Seguridad

R3 ejecutó únicamente reads y documentación/control-plane: 0 hosting/cloud-run deploys, 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes, 0 merge, 0 producción. Legacy permanece intacto.

Epoch anterior preservado como historia: `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`, `currentIteration=I5-R3`.

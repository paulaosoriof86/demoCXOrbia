# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R4-ROOT-CAUSE-CLOSED-PASS-46`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G1`

## 1. Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: existente, draft/open/no merge; **mirror no autoritativo**.
- La autoridad de continuidad es `backend/config/cxorbia-phase-a-continuity-lock.json` y el HEAD se resuelve dinámicamente.

## 2. Source lock funcional

Producto funcional validado y congelado:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

I1–I4 permanecen `PASS/FROZEN`. I5-R1, R2, R3 y R4 no sustituyen esta build funcional. Los cambios posteriores al lock funcional pertenecen a control-plane, documentación, QA harness, workflows/gates o backend config; no existe rebuild de producto.

La auditoría R4 comparó el source funcional con el HEAD pre-cierre `d300a543d8b4892ef676bcd5c07e9f09ebd27673`: 131 commits, **0 archivos runtime de producto cambiados** en los scopes protegidos `app/index.html`, `app/app.js`, `app/manifest.webmanifest`, `app/core/**`, `app/modules/**`, `app/styles/**`.

GitHub Actions run `32403468692`, job `96536915288`, sobre checkout autenticado del PR confirmó `GO_CANONICAL_CONTINUITY_LOCKED_RUNTIME_UNCHANGED`, `CONTINUITY_LOCK_PASS` y `runtimeChangedCount=0`.

## 3. Evidencia same-artifact y rollback

- Hosting same-build: run `32328316954`, artifact `9392151808`, `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- R3: `backend/config/cxorbia-r3-critical-product-acceptance.json`, `SAME_ARTIFACT_PASS`.
- R4: `backend/config/cxorbia-r4-root-cause-closure.json`, `ROOT_CAUSE_CLOSED_PASS`.
- `ROLLBACK_READY=PASS` se revalida en R4: mismo artefacto, runtime sin drift y 0 deploy productivo previo al cutover.
- No rebuild antes de G1.

## 4. Contrato de promoción productiva

Autoridad: `backend/config/cxorbia-production-promotion-contract.json`.

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL futura productiva `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`;
- legacy como backend nuevo: prohibido.

La evidencia de gates queda en `READY_FOR_EXPLICIT_AUTHORIZATION_AFTER_ROOT_CAUSE_CLOSURE`: 5/5 gates técnicos PASS y `EXPLICIT_CUTOVER_AUTHORIZATION=PENDING`.

## 5. Ambientes

- `cxorbia-backend-dev`: backend limpio canónico / migration target / production promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico, no destino Phase A.
- `tya-plataforma`: legacy intacto hasta cutover explícito.
- `cxorbia-preprod-20260819`: `SUPERSEDED`, no ejecutar ni crear.

La ruta histórica `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` no gobierna el plan y no puede reactivarse por documentación o conversación stale.

## 6. Estado de continuidad

- I5-R1 PASS.
- I5-R2 PASS: `CONTINUITY_DRIFT_AUDIT_PASS`.
- I5-R3 PASS: `CRITICAL_PRODUCT_ACCEPTANCE_PASS`.
- I5-R4 PASS: `ROOT_CAUSE_CLOSED_PASS`.
- Score actual: `95/100`.
- Iteración activa: `I5-G1`, `PENDING_AUTHORIZATION`.

Controles durables:

- `backend/config/cxorbia-phase-a-continuity-lock.json`;
- `backend/config/cxorbia-r4-root-cause-closure.json`;
- `backend/config/cxorbia-consumed-one-shot-gates.json`;
- `backend/config/cxorbia-evidence-aliases.json`;
- `backend/config/cxorbia-r3-critical-product-acceptance.json`.

## 7. Evidencia reutilizable preservada

- HR/visitas/shoppers Staff: run `32342457328`, 15 periodos, 660 visitas, 200 shoppers, `2025-06`→`2026-08`, reload/new-tab estable.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`.
- Cliente: `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`, run `32400495121`, artifact `9418300899`.
- Multirol: `PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.
- Finanzas: mayo 44/44; junio 2/44 + 42 pendientes + Q451; `conciliada_pendiente_pago` y `pagada` son estados distintos.

Los nombres distintos de evidencia y una interrupción de conversación no autorizan reruns.

## 8. Secuencia restante

`G1 → G2`.

G1 exige autorización explícita posterior a R4 PASS. El cutover usa el mismo artefacto y rollback preparado. No autoriza business/data writes.

## 9. Protección contra drift de sesión

PR #7 y otros documentos son mirrors; si quedan atrasados, la siguiente sesión debe leer el continuity lock y el recibo terminal R4, reconciliar el mirror y seguir desde `currentIteration`. Nunca se rebaja el score ni se reabre R4 por falta de respuesta visible de una conversación.

## 10. Seguridad

R4 cerró sin deploy productivo, merge, provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes ni cutover. Legacy permanece intacto.

Epoch anterior: `CXORBIA-20260820-I5-R3-CRITICAL-PRODUCT-ACCEPTANCE-PASS-45`, `currentIteration=I5-R4`.

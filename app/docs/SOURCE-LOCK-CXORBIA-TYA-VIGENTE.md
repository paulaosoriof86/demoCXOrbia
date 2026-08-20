# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-R2-CONTINUITY-DRIFT-PASS-44`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-R3`

## 1. Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: existente, draft/open/no merge.
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## 2. Source lock funcional

Producto funcional validado y congelado:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

I1–I4 permanecen `PASS/FROZEN`. Los commits I5 posteriores son control-plane, QA, gates o documentación y no sustituyen esta build funcional. No rebuild antes de promoción.

## 3. Contrato de promoción productiva

Autoridad: `backend/config/cxorbia-production-promotion-contract.json`.

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL futura productiva `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`;
- legacy como backend nuevo: prohibido.

Run `32328316954`, artifact `9392151808` preserva `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY` para el source funcional congelado.

## 4. Ambientes

- `cxorbia-backend-dev`: backend limpio canónico / migration target / production promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico, no destino Phase A.
- `tya-plataforma`: legacy intacto hasta cutover explícito.
- `cxorbia-preprod-20260819`: `SUPERSEDED`, no ejecutar ni crear.

La ruta histórica `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` no gobierna el plan y no puede reactivarse por documentación stale.

## 5. Estado de continuidad

Fuente machine-readable: `backend/config/cxorbia-phase-a-continuity-lock.json`.

- I5-R1 PASS.
- I5-R2 PASS: `CONTINUITY_DRIFT_AUDIT_PASS`.
- Score actual: `90/100`.
- Iteración activa: `I5-R3_CRITICAL_PRODUCT_ACCEPTANCE_RECONCILIATION`.

Controles durables:

- `backend/config/cxorbia-consumed-one-shot-gates.json`;
- `backend/config/cxorbia-evidence-aliases.json`.

## 6. Evidencia reutilizable preservada

- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`.
- Staff/Admin: `PASS_READONLY_POST_GATES` y `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Read-only live authority más reciente: run `32342457328`, artifact `9396828201`, request consumido/deshabilitado.
- Finanzas canónicas: mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.

Los nombres distintos de evidencia no autorizan reruns.

## 7. Secuencia restante

`R3 → R4 → G1 → G2`.

No cutover antes de `ROOT_CAUSE_CLOSED_PASS`; no producción sin autorización explícita; cutover no autoriza business/data writes.

## 8. Seguridad

0 deploy adicional por R2; 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes; 0 merge; 0 producción. Legacy permanece intacto.

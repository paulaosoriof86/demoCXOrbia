# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-DEFINITIVE-ROOT-CAUSE-PLAN-43`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`

## 1. Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: existente, draft/open/no merge.
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## 2. Source lock funcional

Producto funcional validado y congelado:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

I1–I4 permanecen `PASS/FROZEN`. Los commits I5 posteriores son control-plane, QA, gates o documentación y no sustituyen esta build funcional.

## 3. Contrato de promoción productiva

Autoridad: `backend/config/cxorbia-production-promotion-contract.json`.

Topología:

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL aceptada como producción futura `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev`, `us-central1`;
- `acceptCurrentIdentifiersAndUrlAsProduction=true`;
- `requiresSeparateProdFiles=false`;
- legacy como backend nuevo: prohibido.

Run `32328316954`, artifact `9392151808` preserva `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY` y `remoteExactByteParity=true` para el source funcional congelado.

## 4. Ambientes

- `cxorbia-backend-dev`: canonical backend / migration target / production promotion target.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico, no destino Phase A.
- `tya-plataforma`: legacy intacto hasta cutover explícito.
- `cxorbia-preprod-20260819`: no canónico, nunca creado, no ejecutar.

No Project Creator, nueva service account/key/Organization/Folder por la ruta PREPROD retirada.

## 5. Estado de continuidad

Fuente machine-readable:

`backend/config/cxorbia-phase-a-continuity-lock.json`

Score actual `87/100`. Iteración activa:

`I5-R2_CONTROL_PLANE_AND_DOCUMENT_DRIFT_CLOSURE`.

La build funcional no cambia durante R2–R4 salvo `P0_PROVEN` nuevo y reproducible.

## 6. Secuencia restante

`R2 → R3 → R4 → G1 → G2`.

No cutover antes de `ROOT_CAUSE_CLOSED_PASS`; no producción sin autorización explícita; no rebuild antes de promoción.

## 7. Seguridad

0 deploy adicional por el bloque de continuidad; 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes; 0 merge; 0 producción. Legacy permanece intacto.

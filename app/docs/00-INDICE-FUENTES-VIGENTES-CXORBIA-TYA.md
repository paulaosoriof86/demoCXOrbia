# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_PRODUCTION_PROMOTION_CONTRACT_PASS__EXISTING_CLEAN_PROJECT_ACCEPTED__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
3. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
4. `backend/config/cxorbia-production-promotion-contract.json`;
5. `tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/evidence/LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-LATEST.json`;
8. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
9. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
10. `.firebaserc` y `firebase.json`;
11. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
12. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
13. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
14. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Estrategia de producción cerrada

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
hostingTarget=cxorbia-dev
hostingSite=cxorbia-backend-dev
cloudRunService=cxorbia-live-hr-dev
acceptCurrentIdentifiersAndUrlAsProduction=true
```

Contrato:

```text
commit=3197aa5056375ddcffd3a67836ba5cf55a91eede
blob=972943da9698c07ff3af21eca8a4c539433d8d2d
authorizationId=chat-20260806-promote-existing-clean-project-v1
```

## 3. Gate source-only

```text
node --check=PASS
exitCode=0
decision=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
failedChecks=0
holdReason=null
```

Este PASS autoriza la estrategia y topología futuras; no autoriza writes, deploy, merge ni cutover.

## 4. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No se han confirmado `2026-08`, GT/HN, mutación histórica ni paridad transversal de `sourceRevision`.

## 5. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

SKIP13 e historia permanecen preservados. Auth no ha sido ejecutado.

## 6. Pendiente real

- evidencia terminal del request HR v4;
- PASS HR viva actual e histórica;
- Auth con gate separado;
- smoke acumulativo multirol;
- validación humana y rollback;
- autorización específica de cutover;
- único deploy/cutover.

## 7. Estado seguro

```text
provider reads del bloque=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

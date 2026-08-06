# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PROD_TARGET_UNMATERIALIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-PRODUCTION-FAST-TRACK-PREFLIGHT-20260806.md`;
3. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
4. `tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs`;
5. `app/docs/evidence/C6-PRODUCTION-FAST-TRACK-PREFLIGHT-LATEST.json`;
6. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
7. `app/docs/evidence/LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-LATEST.json`;
8. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
9. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
10. `.firebaserc` y `firebase.json`;
11. `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs`;
12. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
13. source lock y evidencia de cancelación v2/v3 como antecedentes cerrados;
14. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
15. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
17. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Request v4 vigente

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
authorizationId=chat-20260806-live-hr-authority-current-period-v4-03
providerReads autorizados=1
segundo trigger=0
```

El request fue emitido una única vez y no fue modificado nuevamente.

## 3. Resultado observable HR

No se han recuperado runId, jobId, steps, journal, artifact o checkpoints. Los commit statuses del request continúan vacíos.

```text
workflowRunExistence=UNKNOWN_AFTER_30M_OBSERVATION
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

No inferir que el run no existió, que `providerReads=0` o que la lectura fue consumida.

## 4. Gate fast-track de producción

Se creó y ejecutó source-only:

```text
tool=tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
node --check=PASS
exitCode=2 esperado fail-closed
decision=HOLD_PRODUCTION_TARGET_UNMATERIALIZED
holdReason=PRODUCTION_CONFIGURATION_FILES_NOT_MATERIALIZED
```

Configuración observada:

```text
default/dev project=cxorbia-backend-dev
hosting target=cxorbia-dev
hosting site=cxorbia-backend-dev
Cloud Run rewrite=cxorbia-live-hr-dev
.firebaserc.prod existe=false
firebase.prod.json existe=false
```

El repositorio todavía no materializa un carril de producción. Un deploy desde la configuración actual sería DEV, no producción.

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
- `2026-08`, tabs GT/HN, mutación histórica y `sourceRevision`;
- Auth con gate separado;
- smoke acumulativo multirol;
- archivos y target de producción nuevos, separados y verificados;
- validación humana, rollback y autorización específica de cutover.

## 7. Estado seguro

```text
request modificado después de emisión=false
segundo trigger=0
provider reads ejecutados por preflight=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

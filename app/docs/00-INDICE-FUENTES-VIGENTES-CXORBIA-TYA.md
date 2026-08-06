# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_V4_REQUEST_EMITTED__30M_NO_RUN_JOB_CHECKPOINT_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__NO_SECOND_TRIGGER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
3. `app/docs/evidence/LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-LATEST.json`;
4. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
5. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
6. `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs`;
7. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
8. source lock y evidencia de cancelación v2/v3 como antecedentes cerrados;
9. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
10. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
12. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Request v4 vigente

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
authorizationId=chat-20260806-live-hr-authority-current-period-v4-03
providerReads autorizados=1
segundo trigger=0
```

El request fue emitido una única vez y no fue modificado nuevamente.

## 3. Resultado observable

Durante 1820 segundos no se recuperaron runId, jobId, steps, journal, artifact o checkpoints. El HEAD permaneció en el request durante la ventana y los commit statuses permanecieron vacíos.

```text
workflowRunExistence=UNKNOWN_AFTER_30M_OBSERVATION
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

No inferir que el run no existió, que `providerReads=0` o que la lectura fue consumida.

## 4. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

SKIP13 e historia permanecen preservados.

## 5. Pendiente real

No está validado:

- metadata/autodiscovery;
- periodo `2026-08`;
- tabs GT/HN;
- mutación histórica;
- paridad transversal de `sourceRevision`.

Antes de otro request debe reconciliarse cualquier evidencia tardía del request `ac2032ec...`. No corresponde reabrir sintaxis, registro, trigger, rama o path del workflow.

## 6. Estado seguro

```text
request modificado después de emisión=false
segundo trigger=0
provider reads ejecutados por observador=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-06  
**Estado:** `C6_GITHUB_ACTIONS_OUTAGE_ROOT_CAUSE_PROVEN__WEBHOOK_THROTTLING__CONTROL_PLANE_V2_PREPARED__REQUEST_DISABLED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-GITHUB-ACTIONS-OUTAGE-ROOT-CAUSE-AND-FAILOVER-20260806.md`;
- requests SKIP13 ejecutables: ninguno;
- request HR v4: `ac2032ec224e6d56bf087788b949691b6690c437`.

## 2. Causa raíz Actions

```text
incidentId=qcvjkzcs7j74
incidentStatus=investigating
impact=critical
ActionsStatus=major_outage
webhookTriggers=throttled
manyPushAndPullRequestEventsNotTriggering=true
```

La evidencia oficial coincide con el intervalo del no-run C6. Por tanto:

```text
rootCause=EXTERNAL_GITHUB_ACTIONS_MAJOR_OUTAGE_AND_WEBHOOK_TRIGGER_THROTTLING
repoWorkflowFaultProven=false
branchMismatch=false
pathMismatch=false
workflowAbsent=false
repositoryPermissionFailure=false
```

No es necesario atribuir el incidente a `GITHUB_TOKEN` ni a configuración interna del repositorio.

## 3. Recuperación parcial observable

```text
head=2d4d760b492bd25d6c91b03151ff1be1cbe0d5dc
runId=31129990397
jobId=92716480291
workflow=CXOrbia C6 SKIP13 Auth Access Adjudication Readonly
conclusion=success
requestOnly=false
executable=false
status=SKIPPED_NON_REQUEST_EVENT
providerReads=0
```

El workflow y sus guards funcionan. El run no adjudicó SKIP13 porque el request permanece deshabilitado.

## 4. Control plane v2

Archivos:

```text
backend/contracts/c6-execution-control-plane-v2.json
tools/qa/cxorbia-c6-control-plane-preflight.mjs
```

Carril primario:

```text
lane=github_actions_explicit_dispatch
event=workflow_dispatch
commitPushAsProviderSignal=false
requiresActionsOperational=true
requiresIncidentResolved=qcvjkzcs7j74
requiresRunIdAndJobId=true
requiresDurableClaim=true
```

Carril de contingencia:

```text
lane=direct_trusted_runner
status=DESIGN_ONLY_NOT_DEPLOYED
independentOfGitHubActions=true
requiresSeparateDeployAuthorization=true
```

## 5. SKIP13

```text
profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
candidateClassificationAvailable=false
providerReadConsumptionPreviousRequests=UNKNOWN
requestExecutable=false
```

## 6. Plan Auth final

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
emailChanges=39
passwordChanges=14
claimsChanges=38
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
```

Auth no ha sido ejecutado.

## 7. Snapshot, rollback y smoke

```text
snapshotManifest=PREPARED_NOT_EXECUTABLE
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
smokeDecision=PREPARED_NOT_EXECUTED
partialPassAllowed=false
humanValidationRequired=true
```

## 8. Request HR v4

```text
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 10. Siguiente cadena exacta

1. No emitir requests por commit ni usar push como señal provider.
2. Esperar incidente `qcvjkzcs7j74` resuelto y Actions operativo.
3. Ejecutar el preflight de control plane v2.
4. Autorizar una única adjudicación SKIP13 mediante dispatch explícito observable.
5. Autorizar separadamente el carril directo autenticado independiente de Actions.
6. Continuar snapshot y repair Auth mediante autorizaciones separadas.
7. Ejecutar readback, smoke, validación humana y rollback.
8. Autorizar específicamente el único cutover.

## 11. Estado seguro

```text
provider reads this block=0
provider writes=0
HR reads=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
requestExecutable=false
```

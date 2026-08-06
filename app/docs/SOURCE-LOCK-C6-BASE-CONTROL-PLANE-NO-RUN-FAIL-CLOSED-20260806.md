# SOURCE LOCK — C6 base control-plane no-run / fail-closed

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Rama temporal de control:** `release/cxorbia-tya-rc-20260630`  
**Estado:** `BASE_CONTROL_PLANE_REQUEST_EMITTED__NO_RUN_STATUS_COMMENT_OR_ARTIFACT__TEMP_FILES_REMOVED__STOP_RETRY__NO_PROVIDER_BOUNDARY_PROVEN__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización ejecutada

Paula autorizó un único bloque C6 source-control-only para instalar temporalmente en la rama base un workflow observable de adjudicación SKIP13, emitir un único request para los mismos 13 fingerprints, ejecutar como máximo una lectura provider de Auth, claims y memberships, capturar evidencia terminal y retirar el carril temporal.

No se autorizaron lecturas HR, escrituras Auth, password, claims, memberships, Firestore, Rules, Storage o HR, deploy, merge, Make, Gemini, pagos ni producción.

## 2. Source lock adjudicado

```text
sourceBranch=docs-tya-v6-v71-audit
sourceLockHead=c694b75288873b1e3c1b0e70ed5bd86bc225d33e
providerProject=cxorbia-backend-dev
tenantId=tya
projectId=cinepolis
profiles=13
blockingProfileFingerprint=7cc28c78de9bfda01d14
blockingCandidateFingerprints=9b2b7ca1bd72c1301d29,4e6d26551d11db444bd0
```

El workflow temporal exigía los blobs auditados exactos:

```text
toolBlob=bed01216bf0a03ccbaaa0c04339c3a4e1e1affbe
contractBlob=dec851c8fc69753a5306bfe30c1ebb8dd8e945d2
```

## 3. Carril temporal instalado

Workflow temporal:

```text
path=.github/workflows/cxorbia-c6-skip13-control-plane-once.yml
installCommit=640125d08c76b9f333a02ae78ca538993f200e30
trigger=push request-only sobre release/cxorbia-tya-rc-20260630
```

Request único:

```text
path=backend/config/c6-skip13-control-plane-request.json
requestId=c6-skip13-control-plane-20260806-01
requestCommit=d0e5c5527d001587366097dbb7667fc242029e9d
controlPlaneTargetHead=640125d08c76b9f333a02ae78ca538993f200e30
allowedExecutions=1
```

El request era el único archivo modificado por el commit emisor y mantenía todas las banderas de seguridad en `false`.

## 4. Observación terminal

Se verificó repetidamente el request commit después de su emisión. No se recuperaron:

```text
workflowRunId
jobId
steps
artifact
claim status
overall commit status
terminal PR comment
cleanup commit generado por workflow
```

Evidencia observable:

```text
combinedStatuses=[]
terminalCommentForRequestId=false
requestStillPresentAfterObservation=true
workflowSelfCleanupObserved=false
observationWindowSeconds>=102
```

Resultado correcto:

```text
workflowRunExistence=NOT_OBSERVED
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_STATUS_OR_ARTIFACT_EVIDENCE
adjudicationCompleted=false
candidateClassificationAvailable=false
blockingFingerprintAdjudicated=false
STOP_RETRY=true
secondAttempt=0
```

No se afirma que la lectura provider haya sido cero ni consumida. Tampoco se atribuye la ausencia del run a sintaxis, credenciales, permisos o GitHub sin evidencia terminal suficiente.

## 5. Fail-close y limpieza

Para impedir una ejecución tardía, se retiró primero el workflow y después el request, evitando que la eliminación del request pudiera disparar un segundo evento.

```text
workflowRemovalCommit=baf7231b8df7b621c62c57ac1cd966b4a17763e6
requestRemovalCommit=4a85e7e4d0eb31691d7b77e3551ed7cafabb5984
workflowPresentAfterCleanup=false
requestPresentAfterCleanup=false
requestExecutable=false
```

No se reutilizó el request y no se emitió un segundo trigger.

## 6. Plan Auth preservado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
snapshotRollback=PREPARED_NOT_EXECUTABLE
smoke=PREPARED_NOT_EXECUTED
```

No se ejecutó reparación parcial ni modificación de cuentas.

## 7. Documentación asociada

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-BASE-CONTROL-PLANE-NO-RUN-20260806.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-BASE-CONTROL-PLANE-NO-RUN-20260806.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-BASE-CONTROL-PLANE-NO-RUN-20260806.md`;
- `app/docs/ACADEMIA-ADDENDUM-C6-BASE-CONTROL-PLANE-NO-RUN-20260806.md`;
- `app/docs/PHASE-A-TRACKER-ADDENDUM-C6-BASE-CONTROL-PLANE-NO-RUN-20260806.md`;
- addenda equivalentes en la raíz;
- índice y checkpoint vigentes actualizados.

## 8. Clasificación documental

- **Reusable CXOrbia:** carril temporal request-only, source lock por blob, claim previo a provider y limpieza fail-closed.
- **Exclusivo TyA:** los 13 fingerprints y el bloqueante `7cc28c78de9bfda01d14`.
- **Claude/prototipo:** sin cambios UI ni frontend.
- **Academia:** separación verificable entre emisión de request, creación de run, cruce de frontera provider y evidencia terminal.
- **Sin impacto Claude:** `/app`, módulos, core, adapters, Finanzas, Portales, Reservas, HR y UX preservados.

## 9. Bloqueo comprobado

El bloqueo restante continúa en la creación/observabilidad del run de GitHub Actions. El source-control temporal fue instalado y retirado correctamente, pero no existe evidencia de que el job haya comenzado.

No se autoriza otro intento bajo este source lock sin una decisión separada sobre un mecanismo de ejecución distinto y observable.

## 10. Estado seguro

```text
newBranch=0
newPR=0
merge=0
deploy=0
production=false
HR reads authorized=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
Make/Gemini/payments=0
provider adjudication completed=false
request executable=false
temporary workflow present=false
```

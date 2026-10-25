# SOURCE LOCK — C6 GitHub Actions outage, causa raíz y failover

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `ROOT_CAUSE_PROVEN_EXTERNAL_GITHUB_ACTIONS_MAJOR_OUTAGE__WEBHOOK_TRIGGERS_THROTTLED__FAILOVER_CONTRACT_PREPARED__NO_PROVIDER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Causa raíz demostrada

El incidente oficial de GitHub `qcvjkzcs7j74` permanecía en estado `investigating`, impacto `critical`, con el componente **Actions** en `major_outage`.

La actualización oficial de 2026-08-06T22:18:09Z indicó expresamente:

```text
webhook triggers remain throttled
many push and pull request events are not yet triggering new workflow runs
standard and larger runners are draining queued work
```

Una actualización anterior indicó que GitHub estaba procesando aproximadamente 15% de los webhooks.

Esto coincide temporal y técnicamente con los commits C6 que no materializaron run. Por tanto:

```text
rootCause=EXTERNAL_GITHUB_ACTIONS_MAJOR_OUTAGE_AND_WEBHOOK_TRIGGER_THROTTLING
repoWorkflowSyntaxFaultProven=false
branchMismatch=false
pathMismatch=false
workflowAbsent=false
repositoryPermissionFailure=false
tokenSuppressionRequiredToExplainIncident=false
```

## 2. Evidencia posterior de recuperación parcial

El HEAD `2d4d760b492bd25d6c91b03151ff1be1cbe0d5dc` sí materializó posteriormente el run de pull request:

```text
runId=31129990397
jobId=92716480291
workflow=CXOrbia C6 SKIP13 Auth Access Adjudication Readonly
conclusion=success
```

El job detectó correctamente que no era el commit exclusivo del request y ejecutó:

```text
requestOnly=false
executable=false
SKIPPED_NON_REQUEST_EVENT
providerReads=0
```

Esto demuestra que el workflow vigente, el checkout, el runner, los permisos de status y el guard fail-closed funcionan. No adjudica los 13 perfiles porque el request vigente permanece deshabilitado.

## 3. Corrección del diagnóstico anterior

El bloqueo ya no debe describirse como causa desconocida. La evidencia oficial permite clasificarlo como una falla externa del control plane de GitHub durante el intervalo de ejecución.

La limitación de observabilidad del conector continúa siendo real, pero es secundaria. No fue necesario atribuir el no-run a `GITHUB_TOKEN`, configuración del repositorio o error de código.

## 4. Solución definitiva preparada

Se incorporaron:

- `backend/contracts/c6-execution-control-plane-v2.json`;
- `tools/qa/cxorbia-c6-control-plane-preflight.mjs`.

### Carril primario

```text
lane=github_actions_explicit_dispatch
event=workflow_dispatch
pushCommitAsExecutionSignal=false
pullRequestSynchronizeAsExecutionSignal=false
```

Antes de cruzar la frontera provider deberá existir evidencia de:

```text
GitHub Actions=operational
incident qcvjkzcs7j74=resolved
push/pull trigger throughput restored
runId
jobId
requestId match
sourceLock match
claimStatus=pending
```

El preflight devuelve `HOLD_GITHUB_ACTIONS_NOT_FULLY_RECOVERED` mientras el incidente siga activo.

### Carril de contingencia

```text
lane=direct_trusted_runner
status=DESIGN_ONLY_NOT_DEPLOYED
independentOfGitHubActions=true
```

El carril directo queda diseñado para una invocación autenticada con lease de idempotencia. No está desplegado ni autorizado. Su despliegue requiere un bloque separado.

## 5. Estado SKIP13 y Auth

```text
profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
currentRequestEnabled=false
currentAllowedExecutions=0
providerReadConsumptionPreviousRequests=UNKNOWN
```

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

## 6. Clasificación documental

- **Reusable CXOrbia:** control plane explícito, preflight externo y failover independiente de Actions.
- **Exclusivo TyA:** adjudicación SKIP13 y plan Auth de 340 filas.
- **Claude/prototipo:** sin cambios de frontend, módulos o UX.
- **Academia:** separación entre evento, scheduler, runner, claim y frontera provider.
- **Sin impacto Claude:** `/app`, `CX.data`, Finanzas, Portales, Reservas y Academia funcional preservados.

## 7. Pendiente exacto

1. Esperar estado oficial `resolved` y componente Actions `operational`.
2. No emitir requests por commit ni usar push como señal de ejecución.
3. Autorizar por separado una única ejecución mediante dispatch explícito observable.
4. Como resiliencia permanente, autorizar después el carril directo autenticado independiente de Actions.

## 8. Estado seguro

```text
newSKIP13Request=0
providerReadsThisBlock=0
providerWrites=0
HR reads=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
deploy=0
merge=0
production=false
Make/Gemini/payments=0
PR7=draft/open/unmerged
```

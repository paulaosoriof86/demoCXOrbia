# SOURCE LOCK — C6 diagnóstico conector / GitHub Actions no-run

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `CONNECTOR_ACTIONS_NO_RUN_DIAGNOSTIC__ROOT_CAUSE_NOT_PROVEN__OBSERVABILITY_GAP_PROVEN__STOP_RETRY__NO_PROVIDER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Alcance autorizado

Paula autorizó un único diagnóstico source-control-only para determinar por qué los commits creados por el conector no materializan runs observables de GitHub Actions.

El bloque prohibió expresamente:

- reactivar SKIP13;
- emitir requests SKIP13 nuevos;
- leer Auth, claims, memberships, HR o cualquier provider;
- escribir Auth, Firestore, Rules, Storage o HR;
- deploy, merge, Make, Gemini, pagos o producción.

## 2. Caso no ejecutado comparado

```text
workflowInstallCommit=640125d08c76b9f333a02ae78ca538993f200e30
workflowPath=.github/workflows/cxorbia-c6-skip13-control-plane-once.yml
requestCommit=d0e5c5527d001587366097dbb7667fc242029e9d
requestPath=backend/config/c6-skip13-control-plane-request.json
branch=release/cxorbia-tya-rc-20260630
visibleAuthor=paulaosoriof86
visibleCommitter=paulaosoriof86
```

El workflow fue instalado un commit antes del request y declaraba exactamente:

```text
event=push
branch=release/cxorbia-tya-rc-20260630
path=backend/config/c6-skip13-control-plane-request.json
```

El commit `d0e5c5527d001587366097dbb7667fc242029e9d` modificó únicamente ese archivo. Por tanto, con la evidencia source-control disponible, quedan descartados:

- workflow ausente al momento del request;
- rama distinta a la declarada;
- path distinto al filtro;
- orden incorrecto entre instalación y request;
- falta de permisos de escritura del conector sobre el repositorio.

No se observó status, run URL, job, artifact, comentario terminal ni cleanup automático.

## 3. Caso histórico ejecutado

Se comparó con el commit:

```text
commit=457c5810c88427ac775e54626c9936ab094047e2
message=ci: deploy prompt live HR refresh overlay to DEV
visibleAuthor=paulaosoriof86
visibleCommitter=paulaosoriof86
workflow=.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev-temporary.yml
event=push
branch=main
path=.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev-temporary.yml
```

Ese commit generó evidencia terminal verificable:

```text
runId=29799752544
jobId=88798094500
jobConclusion=success
commitStatusContext=cxorbia/live-hr-runtime-dev-deploy
commitStatusState=success
```

El job contiene pasos completos y exitosos desde checkout hasta publicación de status. Esto demuestra que GitHub Actions estaba operativo en este repositorio el 2026-07-21.

No demuestra que la política Actions o el estado del workflow permanecieran iguales el 2026-08-06.

## 4. Actor y credencial

Los dos commits muestran el mismo autor y committer visibles: `paulaosoriof86`.

El conector está instalado como GitHub App sobre la cuenta de Paula:

```text
installationId=140169561
accountType=User
repositoryInstalled=true
repositoryPermissions=admin,maintain,push,pull,triage
```

Los eventos suscritos por esa instalación incluyen checks, statuses, issues y pull requests, pero no incluyen:

```text
push
workflow_run
```

Esto demuestra una limitación de observabilidad del conector: no recibe esos eventos por webhook y la acción disponible para consultar runs por commit filtra únicamente runs disparados por `pull_request`.

No demuestra por sí solo que GitHub no haya creado el run.

El tipo exacto del token usado internamente por `create_file`/`update_file` no es expuesto por el conector. Por tanto, no puede afirmarse que el write se haya realizado con `GITHUB_TOKEN`, token de instalación puro o user access token de GitHub App.

## 5. Regla oficial de supresión

GitHub documenta que los eventos generados mediante el `GITHUB_TOKEN` de un workflow no crean nuevos workflow runs, salvo excepciones como `workflow_dispatch` y `repository_dispatch`. Esa regla existe para impedir recursión.

No es posible aplicar esa regla como causa probada en este caso porque:

- el commit no fue generado desde un job de GitHub Actions demostrado;
- el conector no revela el subtipo exacto de token del write;
- el autor/committer visible no identifica de forma concluyente la credencial usada.

La supresión por token permanece como hipótesis técnica compatible, no como hallazgo demostrado.

## 6. Configuración Actions, workflows y auditoría

Con las capacidades disponibles sí se verificó:

```text
repositoryDefaultBranch=main
repositoryArchived=false
connectorAdminPermission=true
historicalActionsRunExists=true
currentRequestCommitStatuses=[]
```

No existe en el conector una operación que exponga de forma verificable:

- política actual de GitHub Actions del repositorio;
- estado enabled/disabled del workflow temporal al momento del request;
- reglas de Actions permitidas por repositorio;
- audit log del evento `push` y del scheduler;
- identidad exacta de la credencial que creó el commit;
- registro interno de supresión o rechazo del scheduler.

La ausencia de esas superficies impide distinguir de manera concluyente entre:

1. supresión por la credencial/evento del conector;
2. cambio de política o workflow deshabilitado después del 2026-07-21;
3. rechazo o pérdida del evento por el scheduler de GitHub;
4. run creado sin una señal recuperable por el conector actual.

## 7. Dictamen

```text
decision=STOP_RETRY_C6_CONNECTOR_ACTIONS_ROOT_CAUSE_NOT_PROVEN
provenBlocker=CONTROL_PLANE_OBSERVABILITY_AND_CREDENTIAL_ATTRIBUTION_INSUFFICIENT
branchPathOrderMismatch=false
repositoryWritePermissionMissing=false
historicalActionsUnavailable=false
tokenSuppressionProven=false
currentActionsPolicyProven=false
workflowEnabledStateProven=false
auditLogAvailable=false
newTrigger=0
newSKIP13Request=0
providerReads=0 authorized
```

La causa interna exacta no quedó demostrada. El hallazgo reproducible es que el carril actual no permite observar ni atribuir el evento hasta el scheduler de Actions, y por ello no puede utilizarse de nuevo para una operación provider de una sola ejecución.

## 8. Phase A preservada

```text
AuthPlanRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
snapshotRollback=PREPARED_NOT_EXECUTABLE
smoke=PREPARED_NOT_EXECUTED
```

## 9. Clasificación documental

- **Reusable CXOrbia:** contrato de observabilidad requerido antes de usar Actions como control plane de ejecución única.
- **Exclusivo TyA:** dependencia del cierre SKIP13 para el plan Auth de 340 filas.
- **Claude/prototipo:** sin cambios frontend ni UX.
- **Academia:** diferencia entre commit creado, webhook observable, evento admitido por scheduler y run terminal.
- **Sin impacto Claude:** módulos, core, adapters, Finanzas, Portales, Reservas y Academia funcional preservados.

## 10. Siguiente bloque exacto

No emitir otro workflow/request de prueba ni reactivar SKIP13.

El siguiente bloque requiere una superficie administrativa que exponga, en modo read-only, al menos uno de estos elementos:

- Actions permissions actuales del repositorio;
- estado del workflow;
- audit log del push y scheduler;
- tipo exacto de token/actor del write;
- endpoint de listado de runs sin filtro exclusivo a `pull_request`.

Hasta disponer de esa superficie, el control plane permanece bloqueado y cualquier nuevo intento sería repetición no diagnóstica.

## 11. Estado seguro

```text
SKIP13 reactivated=false
new provider request=false
Auth/claims/membership reads=0
HR reads=0
provider writes=0
Auth/Firestore/Rules/Storage/HR writes=0
deploy=0
merge=0
production=false
Make/Gemini/payments=0
PR7 remains draft/open
```

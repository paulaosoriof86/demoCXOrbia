# SOURCE LOCK — C6 PR #7 mergeability PASS / SKIP13 control-plane HOLD

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**HEAD seguro de cierre previo a documentación:** `3f64e3addf48b74758354365bec1d8ccbe4dfd88`  
**Estado:** `PR7_MERGEABILITY_PASS__SKIP13_PROVIDER_RUN_NOT_CREATED__REQUEST_DISABLED__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización ejecutada

Paula autorizó un único bloque C6 source-control-only para:

- diagnosticar y corregir la no-mergeabilidad de PR #7;
- mantener la misma rama y el mismo PR;
- preservar íntegramente la baseline acumulativa, backend, contratos, overlays y documentación;
- verificar `mergeable=true`;
- solo después intentar una única adjudicación read-only SKIP13 ya autorizada;
- detenerse ante reescritura masiva, pérdida de cambios o modificación funcional no determinista.

No se autorizaron merge, deploy, producción, lecturas HR ni escrituras Auth, memberships, claims, Firestore, Rules, Storage o HR.

## 2. Diagnóstico de no-mergeabilidad

La comparación entre la rama base y la rama viva mostró:

```text
base=release/cxorbia-tya-rc-20260630
head=docs-tya-v6-v71-audit
mergeBase=38f6193c27035f53860c428b486feef5a78a5f87
baseHead=df8bab550d73140e6d80e7c0c7f7ca384ac83757
headStatus=diverged
behindBy=8
```

El delta exclusivo de la base desde el merge-base estaba limitado a dos workflows:

```text
.github/workflows/cxorbia-resolve-dev-service-account.yml
.github/workflows/cxorbia-v156-atomic-promotion.yml
```

El primer archivo era exclusivo de la base. El segundo existía también en la rama viva con contenido incompatible y producía un conflicto `add/add` reproducible.

## 3. Resolución determinista aplicada

Se eliminó únicamente la copia obsoleta de la rama viva:

```text
path=.github/workflows/cxorbia-v156-atomic-promotion.yml
resolutionCommit=9136362468c6f3e92933686e1f320d671287c032
```

La versión de la rama base quedó como única versión aplicable al eventual merge. No se modificaron:

- `/app/modules`;
- `/app/core`;
- adapters operativos;
- backend funcional;
- contratos;
- datos;
- overlays;
- reglas;
- configuración Firebase de producción.

La resolución no requirió rebase, force-push, nueva rama, nuevo PR, merge ni reescritura masiva.

## 4. Verificación de mergeabilidad

GitHub recalculó PR #7 como:

```text
state=open
draft=true
merged=false
mergeable=true
```

La condición `mergeable=true` fue verificada después de la resolución y nuevamente al cierre seguro del bloque.

## 5. Intento de adjudicación SKIP13

Se preservó el adjudicador read-only existente y se preparó un request exacto limitado a:

```text
profiles=13
blockingProfileFingerprint=7cc28c78de9bfda01d14
Auth reads=true
claims reads=true
memberships reads=true
HR reads=false
provider writes=false
```

El último request-only commit emitido fue:

```text
requestId=c6-skip13-auth-access-adjudication-20260806-05
requestCommit=f56882f4dea58cc461e05614b11a447402870622
targetHead=0e2f73a5fd553a283f18465dc58666c11ad6349e
allowedExecutions=1
```

Se verificó `mergeable=true` y se emitió el evento observable `ready_for_review` sobre PR #7. El PR fue devuelto después a draft.

## 6. Evidencia terminal

Para el request exacto no se recuperaron:

```text
workflowRunId
jobId
steps
artifact
claim status
terminal commit status
```

Resultado correcto:

```text
workflowRunExistence=NOT_OBSERVED
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_STATUS_EVIDENCE
adjudicationCompleted=false
candidateClassificationAvailable=false
blockingFingerprintAdjudicated=false
```

No se afirma PASS ni HOLD funcional sobre el acceso efectivo de los 13 fingerprints. La causa interna exacta por la cual GitHub Actions no creó el run no quedó demostrada; por tanto, no se atribuye a credenciales, permisos, draft, conflicto o sintaxis sin evidencia terminal.

## 7. Fail-close aplicado

Para impedir una ejecución tardía o duplicada, el request quedó deshabilitado:

```text
disableCommit=3f64e3addf48b74758354365bec1d8ccbe4dfd88
enabled=false
consumed=false
status=blocked_control_plane_no_run
allowedExecutions=0
STOP_RETRY=true
```

No queda ningún request SKIP13 ejecutable en la rama.

## 8. Estado Auth preservado

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

## 9. Bloqueo comprobado

El conflicto source-control quedó resuelto. El bloqueo restante es exclusivamente de observabilidad/ejecución del control plane:

```text
PR7 mergeability=PASS
SKIP13 audited tool=present
safe request=present but disabled
GitHub Actions run creation=NOT OBSERVED
provider adjudication=NOT COMPLETED
```

Para continuar será necesario un carril de ejecución observable que GitHub sí materialice, sin reutilizar el request deshabilitado y sin ampliar el alcance provider.

## 10. Clasificación documental

- **Reusable CXOrbia:** resolución determinista de conflicto `add/add`, request fail-closed y separación entre mergeability y ejecución provider.
- **Exclusivo TyA:** los 13 fingerprints SKIP13 y el bloqueante `7cc28c78de9bfda01d14`.
- **Claude/prototipo:** sin cambios UI ni acciones pendientes por esta resolución.
- **Academia:** patrón de diagnóstico que separa conflicto Git, evento GitHub y consumo provider.
- **Sin impacto Claude:** módulos, core, Finanzas, Portales, Reservas, HR y UX preservados.

## 11. Estado seguro

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
```

# SOURCE LOCK — C6 diagnóstico control-plane del request HR viva v3

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_V3_CONTROL_PLANE_DIAGNOSIS_INCONCLUSIVE__PROVIDER_BOUNDARY_NOT_PROVEN__STOP_RETRY__NO_PROVIDER_READ_BY_DIAGNOSTIC__NO_DEPLOY__NO_PRODUCTION`

## 1. Alcance autorizado

Diagnóstico completamente read-only sobre el request:

```text
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
sourceCommit=18ea2e6ab9b15480c851c7ba34cae8e8fbcae026
```

Sin modificar request, emitir trigger, consultar HR ni ejecutar provider, Firestore, Auth, Rules, Storage, deploy, merge o producción.

## 2. Evidencia reproducible

El commit exacto existe, fue creado el `2026-08-06T17:29:52Z` y modificó únicamente el path observado por el workflow:

```text
.github/cxorbia-firebase-requests/live-hr-current-reconcile.json
```

El workflow vigente está configurado para `push` sobre la rama viva y ese path exacto. Su orden contractual es:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
→ validación request y gates source
→ PROVIDER_READ_BOUNDARY_ENTERED_MAX1
→ acceso provider
```

La consulta de estados del commit exacto devolvió cero estados. No se observó el checkpoint inicial ni el checkpoint de frontera provider. Tampoco se recuperó evidence commit, avance generado por workflow, runId, jobId o artifactId.

Como control, la misma consulta recuperó correctamente un status histórico existente en el commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26`; por tanto, la lectura de commit statuses funciona cuando el status existe.

## 3. Límite del diagnóstico

La función disponible para listar runs por commit filtra ejecuciones de `pull_request`; el workflow investigado usa `push`. El conector no expone en este bloque un listado general de runs `push` ni un endpoint de check suites.

Por ello no se puede demostrar que el run nunca existió. Sí queda reproduciblemente demostrado que no existe evidencia observable de que alcanzara `PROVIDER_READ_BOUNDARY_ENTERED_MAX1`.

## 4. Dictamen

```text
workflowRunLocated=false
checkSuiteLocated=false
jobLocated=false
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
retryExecuted=false
STOP_RETRY=true
```

No se interpreta la ausencia como `providerReads=0` ni como lectura consumida.

## 5. Clasificación

- **Reusable CXOrbia:** diagnóstico fail-closed por frontera observable y control de status positivo.
- **Exclusivo TyA:** la lectura HR viva continúa sin confirmación.
- **Claude/prototipo:** no hay cambios UI; no mostrar estados técnicos al usuario final.
- **Academia:** caso de run no enumerado y frontera provider no probada.
- **Sin impacto Claude:** SKIP13, Auth, Finanzas, Portales, Reservas y frontend acumulativo permanecen preservados.

## 6. Estado seguro

```text
request modificado=false
nuevo trigger=0
provider reads por diagnóstico=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

## 7. Siguiente bloque exacto

Corregir únicamente el carril de ejecución/registro de GitHub Actions mediante un gate source-only que pruebe que el workflow está reconocido y habilitado, sin tocar el request v3 ni consultar HR. Un nuevo intento provider requerirá autorización fresca separada.

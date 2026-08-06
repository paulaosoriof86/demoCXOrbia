# SOURCE LOCK — C6 adjudicación SKIP13 sin evidencia terminal

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_SKIP13_ADJUDICATION_REQUEST_EMITTED__20M_NO_RUN_JOB_STATUS_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización

Paula autorizó una única adjudicación completamente read-only de Auth, memberships y claims, limitada a los 13 fingerprints SKIP13 y especialmente a:

```text
blockingProfileFingerprint=7cc28c78de9bfda01d14
```

No se autorizaron lecturas HR, provider writes, Auth/Firestore/Rules/Storage writes, deploy, merge ni producción.

## 2. Preparación source-safe

Se materializaron antes del request:

```text
contract=e9173d7253a3cec7cdbbb3b181924b7f132c94a3
tool=5281a7f0fa7c4ddcdb8db878ddbc2b99f9054b1c
workflow=a5b76313fd829f3a00e853bca03f6bb8e2fd423d
disabledRequest=9e7b53f8b468970d8ee174e114693074bfc7a67a
nodeCheck=PASS
```

El adjudicador está diseñado para:

- resolver los 13 perfiles mediante fingerprints y IDs de documentos, sin exportar identificadores crudos;
- leer estado Auth, claims y memberships solo de candidatos relacionados;
- evaluar acceso efectivo contra `firestore.rules` versionado;
- no leer HR, visitas, certificaciones, liquidaciones, Storage ni el bundle legacy;
- exportar únicamente fingerprints, booleanos, conteos y clasificaciones source-safe.

## 3. Request único

```text
requestCommit=2eef8b70f2bd2d8570a7f3cc117e217851dd6964
targetHead=9e7b53f8b468970d8ee174e114693074bfc7a67a
requestId=c6-skip13-auth-access-adjudication-20260806-01
allowedExecutions=1
secondTrigger=0
requestModifiedAfterEmission=false
```

La rama permaneció en el request commit durante toda la ventana de observación. La documentación posterior comenzó únicamente después del cierre de esa ventana.

## 4. Observación directa

Ventana:

```text
start=2026-08-06T21:06:40Z
end=2026-08-06T21:27:07Z
durationSeconds=1227
```

No se recuperaron:

```text
runId
jobId
steps
artifact
terminal commit status
```

Los estados combinados del commit permanecieron vacíos. Las búsquedas de notificaciones GitHub en Gmail tampoco recuperaron coincidencias, pero esa ausencia no es evidencia autoritativa sobre la existencia del run.

## 5. Clasificación correcta

```text
workflowRunExistence=UNKNOWN_AFTER_20M_OBSERVATION
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_STATUS_OR_CHECKPOINT_EVIDENCE
adjudicationCompleted=false
unplannedEffectiveAccessDetermined=false
retryExecuted=false
STOP_RETRY=true
```

No se afirma que la lectura provider haya sido cero ni que haya sido consumida. Tampoco se afirma PASS o HOLD funcional sobre el acceso efectivo de los 13 perfiles.

## 6. Estado Auth preservado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
SKIP13 preserved=true
history preserved=true
```

El plan Auth continúa no ejecutable hasta contar con evidencia terminal de esta adjudicación o una decisión posterior expresamente autorizada.

## 7. HR viva

El request HR v4 `ac2032ec224e6d56bf087788b949691b6690c437` continúa igualmente sin evidencia terminal reconciliada. Este bloque no emitió trigger HR ni realizó lectura HR.

## 8. Regla de continuidad

Cualquier evidencia tardía debe reconciliarse exclusivamente contra:

```text
2eef8b70f2bd2d8570a7f3cc117e217851dd6964
```

Queda prohibido emitir un segundo trigger de adjudicación, reutilizar una autorización vaga o clasificar el consumo sin evidencia de run/job/steps.

## 9. Clasificación documental

- **Reusable CXOrbia:** contrato y adjudicador source-safe de acceso residual.
- **Exclusivo TyA:** SKIP13 y fingerprint bloqueante.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** patrón fail-closed frente a ausencia de observabilidad terminal.
- **Sin impacto Claude:** `/app/modules`, `/app/core`, `CX.data`, Finanzas, Portales y Reservas preservados.

## 10. Estado seguro

```text
provider read consumption=UNKNOWN
provider writes=0
HR reads=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

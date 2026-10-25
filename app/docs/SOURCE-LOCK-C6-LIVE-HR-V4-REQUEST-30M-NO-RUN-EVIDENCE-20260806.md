# SOURCE LOCK — C6 lectura HR viva v4 sin evidencia de run en 30 minutos

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_V4_REQUEST_EMITTED__30M_NO_RUN_JOB_CHECKPOINT_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__NO_SECOND_TRIGGER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Request único emitido

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
requestBlobSha=0c55cae69c51deb63f64de2a37992f3cec2713e0
authorizationId=chat-20260806-live-hr-authority-current-period-v4-03
providerReads autorizados=1
providerWrites=0
```

El request modificó una sola vez el path exacto observado y quedó ligado al HEAD padre exacto.

## 2. Observación directa

Ventana observada:

```text
inicio=2026-08-06T18:13:33Z
fin=2026-08-06T18:43:53Z
duración=1820 segundos
```

Durante la ventana:

```text
runId recuperado=false
jobId recuperado=false
steps recuperados=false
journal recuperado=false
artifact recuperado=false
commit statuses=0
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO OBSERVADO
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1=NO OBSERVADO
FINAL=NO OBSERVADO
avance de rama generado por workflow=NO OBSERVADO
```

No apareció notificación coincidente en el canal auxiliar de GitHub durante la ventana. Esa ausencia no se utiliza como prueba de inexistencia del run.

## 3. Dictamen fail-closed

No se recuperó un job `cancelled` con `steps=0`; por tanto no corresponde aplicar `providerReads=0`.

```text
workflowRunExistence=UNKNOWN_AFTER_30M_OBSERVATION
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
retryExecuted=false
STOP_RETRY=true
```

No se afirma que el run no exista, que la lectura sea cero ni que haya sido consumida.

## 4. Antibucle

- no se modificó nuevamente el request;
- no se emitió segundo trigger;
- no se reabrió el diagnóstico ya cerrado de sintaxis/registro/branch/path;
- no se solicita repetir el mismo análisis;
- cualquier evidencia tardía debe reconciliarse contra este request exacto antes de autorizar otra ejecución.

## 5. HR pendiente

No existe evidencia viva nueva para confirmar:

- metadata/autodiscovery;
- periodo `2026-08`;
- tabs GT/HN;
- mutación histórica;
- paridad transversal de `sourceRevision`.

## 6. Clasificación

- **Reusable CXOrbia:** ventana de observación acotada, no inferencia desde ausencia y fail-closed.
- **Exclusivo TyA:** lectura HR viva pendiente.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** patrón de request emitido sin evidencia terminal recuperable.
- **Sin impacto Claude:** frontend, Login, `CX.data`, SKIP13, Finanzas, Portales y Reservas preservados.

## 7. Estado seguro

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

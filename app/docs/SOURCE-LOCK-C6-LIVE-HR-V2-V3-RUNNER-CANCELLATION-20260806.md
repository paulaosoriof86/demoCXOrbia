# SOURCE LOCK — C6 causa raíz de cancelación HR v2/v3 antes del runner

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_RUN_REGISTRATION_PROVEN__V2_V3_CANCELLED_BEFORE_STEPS__PROVIDER_READS_0_PROVEN__DIAGNOSTIC_LOOP_CLOSED__NO_TRIGGER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Corrección de diagnóstico

El diagnóstico anterior interpretó la ausencia de commit statuses como ausencia de workflow run. Esa inferencia era incorrecta.

Se recuperaron los dos runs reales del workflow:

```text
v2 runId=31117638647 jobId=92671263961 conclusion=cancelled steps=0
v3 runId=31123402722 jobId=92688738677 conclusion=cancelled steps=0
```

Ambos jobs existieron y fueron cancelados antes de ejecutar cualquier step.

## 2. Registro y trigger comprobados

El workflow quedó reconocido por GitHub Actions porque creó runs para los commits que cambiaron el path exacto observado. Quedan comprobados:

- sintaxis reconocida por GitHub;
- workflow registrado y habilitado;
- evento `push`;
- rama `docs-tya-v6-v71-audit`;
- filtro `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`.

No existe una falla del carril de reconocimiento, trigger, rama o path.

## 3. Frontera provider

El orden del workflow es:

1. checkout;
2. abrir journal y publicar `WORKFLOW_STARTED_PROVIDER_READS_0`;
3. validar request y source;
4. gates source;
5. instalar tooling;
6. publicar `PROVIDER_READ_BOUNDARY_ENTERED_MAX1`;
7. acceder al provider.

Con `steps=0`, no se ejecutó checkout ni ningún checkpoint. Por contrato, tampoco pudo alcanzarse la frontera provider.

```text
v2 providerReadConsumption=PROVEN_ZERO_BEFORE_RUNNER_STEPS
v3 providerReadConsumption=PROVEN_ZERO_BEFORE_RUNNER_STEPS
total provider reads v2+v3=0
```

## 4. Causa raíz demostrada

```text
GITHUB_ACTIONS_JOB_CANCELLED_BEFORE_RUNNER_STEPS
```

El checkpoint inicial estaba implementado dentro de un step. Ningún status basado en runner puede publicarse cuando el job es cancelado antes de ejecutar steps. La ausencia de ese status no debe volver a utilizarse para inferir ausencia de run.

El texto exacto de la anotación de cancelación no estuvo disponible en logs/API. No se atribuye la cancelación a billing, concurrencia, capacidad del runner ni otra causa externa sin evidencia.

## 5. Corrección source/control-plane

Se agregó:

```text
tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs
```

El clasificador interpreta primero run, job y steps y solo después calcula el consumo provider:

- job cancelado con `steps=0` → provider reads 0 probado;
- frontera completada sin secuencia → HOLD, máximo 1;
- secuencia completada → lectura lógica 1 probada;
- evidencia insuficiente → fail-closed.

No fue necesario modificar el workflow, porque su registro y trigger funcionan. No se modificó el request y no se emitió trigger.

## 6. Antibucle

Este bloque cierra la ronda de reconocimiento/observabilidad. No corresponde solicitar otro diagnóstico del mismo carril.

El siguiente bloque real, únicamente con autorización fresca, debe ser una nueva lectura HR controlada. Si un nuevo run vuelve a quedar cancelado con cero steps, se clasifica de inmediato sin repetir todas las rondas anteriores.

## 7. Clasificación

- **Reusable CXOrbia:** clasificación run/job/steps previa a consumo provider y corrección de falsa ausencia de run.
- **Exclusivo TyA:** futura lectura HR viva GT/HN y periodo `2026-08`.
- **Claude/prototipo:** sin cambios UI; no mostrar estados técnicos al usuario final.
- **Academia:** caso de diagnóstico de jobs cancelados antes del runner.
- **Sin impacto Claude:** frontend, Login, `CX.data`, SKIP13, Finanzas, Portales y Reservas preservados.

## 8. Estado seguro

```text
request modificado=false
workflow modificado=false
nuevo trigger=0
provider reads del bloque=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_STAFF_PROVIDER_SNAPSHOT_HARNESS_REPAIRED__FIRST_REQUEST_ABORTED_PRE_PROVIDER_READS_0__ONE_AUTHORIZED_PROVIDER_OBSERVATION_STILL_PENDING__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Bloque cerrado previo — static live-user-admin PASS

Se mantiene terminalmente cerrado:

```text
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
runId=31513528713
jobId=93852916856
decision=PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
blockers=[]
warnings=[]
```

M5c permanece COMPLETE. No reabrir.

## Prewrite focal preservado

`backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` continúa distinguiendo:

- R1/Super -> target A;
- R2/Admin -> target B;
- R3/Ops -> target C;
- target D adicional de Operaciones;
- `R4_CLIENT_HISTORICAL` separado del target D.

El viejo cap Auth=14 sigue superseded. El cap final solo se congela con el provider snapshot efectivo.

## Bloque 2026-08-11 — provider snapshot: incidente pre-provider y root fix

Se prepararon, sin PII cruda:

```text
backend/config/c6-staff-provider-collision-targets-v1.json
tools/qa/cxorbia-c6-staff-repair-bootstrap-provider-snapshot-readonly.mjs
backend/contracts/c6-staff-provider-snapshot-runner-v1.json
tools/qa/cxorbia-c6-staff-provider-snapshot-request-gate.mjs
tools/qa/cxorbia-c6-staff-provider-snapshot-runner-report.mjs
```

Se reutilizó el workflow existente:

```text
.github/workflows/cxorbia-readonly-post-gates-runner.yml
```

No se creó workflow, rama o PR nuevo.

### Primer request abortado antes de provider

Request: `c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-01`.

```text
runId=31518115944
jobId=93868277963
requestCommit=6b3b554ed254a2abecf28cfea5386ee2d7e01b47
sourcePreflight=PASS
requestGate=PASS
rootCause=NESTED_HEREDOC_DELIMITER_INDENTATION
providerScriptStarted=false
authListObservations=0
firestoreProviderReads=0
providerWrites=0
repositoryDelta=false
```

El request quedó congelado permanentemente como `HARNESS_ABORTED_PRE_PROVIDER_READS_0`, `enabled=false`, `consumed=true`, `providerObservationConsumed=false`. El status de consumo failure asociado a ese commit es telemetría del harness y no cuenta como provider read.

### Root fix aplicado

Se sustituyó el nested-heredoc por `tools/qa/cxorbia-c6-staff-provider-snapshot-runner-report.mjs`; el consumo durable ahora solo se finaliza cuando el reporte source-safe demuestra `authListObservations=1`.

Validación del workflow corregido con request deshabilitado:

```text
runId=31518696584
jobId=93870136421
conclusion=success
providerProfileExecuted=false
```

Source lock: `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-HARNESS-REPAIRED-20260811.md`.

## Reglas de usuario preservadas

Los cuatro accesos iniciales siguen `TYA_COMPLETE`. El alta futura exige `TyA completo` o `Proyectos específicos`, editable después; sin wildcard ni herencia silenciosa. No se vuelve a pedir scope inicial.

No se modificó `app/modules/configuracion.js` desde backend.

## HR

M6 continúa COMPLETE: HR viva 2026-08 = 34 GT + 10 HN = 44. No se reabrió ni remapeó.

## Métrica estable

```text
M1 35 = COMPLETE
M2 20 = COMPLETE
M3 15 = COMPLETE
M4  5 = COMPLETE
M5  8 = 3/8 COMPLETE
M6  5 = COMPLETE
M7  5 = PENDING
M8  3 = PENDING
M9  3 = PENDING
M10 1 = PENDING
```

**Avance certificado: 83%. Restante: 17%.** El abort pre-provider no suma ni resta progreso.

## Siguiente acción exacta

Emitir un request corregido contra el HEAD vivo y consumir la **primera y única observación provider efectiva** de `C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY`.

Si la observación efectiva detecta drift, faltante, colisión o ambigüedad: `STOP_RETRY` sin segundo provider read.

## Seguridad acumulada del bloque hasta aquí

```text
providerReadsEffective=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deletes=0
deploys=0
merge=false
production=false
```

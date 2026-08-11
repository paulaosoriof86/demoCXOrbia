# SOURCE LOCK — C6 staff provider snapshot harness repaired before provider observation

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_STAFF_PROVIDER_SNAPSHOT_HARNESS_REPAIRED__FIRST_REQUEST_ABORTED_PRE_PROVIDER_READS_0__ONE_AUTHORIZED_PROVIDER_OBSERVATION_STILL_PENDING__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Incidente de harness

El primer request autorizado (`c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-01`) pasó el control-plane, el source preflight y el request gate, pero falló antes de iniciar el script provider por un error de parseo Bash en el bloque de normalización del workflow existente.

Evidencia congelada:

```text
workflowRunId=31518115944
workflowJobId=93868277963
requestCommit=6b3b554ed254a2abecf28cfea5386ee2d7e01b47
rootCause=NESTED_HEREDOC_DELIMITER_INDENTATION
providerScriptStarted=false
authListObservations=0
firestoreProviderReads=0
providerWrites=0
repositoryDelta=false
```

El status `cxorbia/c6-staff-provider-snapshot/consumed=failure` asociado a ese commit es telemetría del harness abortado; no demuestra ni sustituye una observación provider. El request quedó permanentemente `enabled=false`, `consumed=true`, `providerObservationConsumed=false` y no puede reutilizarse.

## 2. Causa raíz y corrección

Se eliminó el nested-heredoc defectuoso del camino especial y se materializó un normalizador shell-safe:

```text
tools/qa/cxorbia-c6-staff-provider-snapshot-runner-report.mjs
```

El workflow ya existente fue corregido en:

```text
.github/workflows/cxorbia-readonly-post-gates-runner.yml
```

La corrección:

- usa llamadas Node directas para `await-pr`, `already-consumed` y `snapshot`;
- no crea workflow nuevo;
- conserva el request gate exacto y la claim de una sola observación;
- solo finaliza el status de consumo si el reporte demuestra `authListObservations=1`;
- limpia credenciales efímeras;
- no modifica datos provider.

## 3. Gate de harness corregido

Con request deshabilitado, el workflow corregido ejecutó el control-plane sin activar provider:

```text
workflowRunId=31518696584
workflowJobId=93870136421
conclusion=success
providerProfileExecuted=false
```

Por tanto, el carril corregido queda listo para un request nuevo que consuma la **primera y única observación provider efectiva** autorizada en este bloque.

## 4. Seguridad

```text
providerReadsConsumedByAbortedRequest=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
deletes=0
deploys=0
merge=false
production=false
```

## 5. Siguiente acción exacta

Emitir un request corregido, único e inmutable contra el HEAD vivo posterior a este source lock y ejecutar una sola vez `C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT_READONLY`.

Si esa observación efectiva produce drift, faltante, colisión o ambigüedad: `STOP_RETRY` sin segundo provider read.

## 6. Clasificación

- **Reusable CXOrbia:** fail-closed antes del provider, consumo durable ligado a observación efectiva, normalización shell-safe.
- **Exclusivo TyA:** población Auth 228 y focales R1/R2/R3/D/R4.
- **Claude/prototipo:** sin impacto UI.
- **Academia:** sin cambio de curso; principio de trazabilidad de gates.
- **Sin impacto Claude:** reparación de harness y telemetría provider.

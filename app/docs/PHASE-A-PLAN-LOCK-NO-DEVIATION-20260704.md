# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_V3_CONTROL_PLANE_DIAGNOSIS_INCONCLUSIVE__PROVIDER_BOUNDARY_NOT_PROVEN__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, sin candidata paralela y sin sustituir HR viva por snapshots o datos fijados.

## 2. Preservado

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones y Reservas;
- Finanzas, Liquidaciones, Portales y reportes;
- `CX.data`, Firebase DEV, Auth/RBAC y contratos;
- multi-tenant, multi-proyecto y Cinépolis configurable;
- Academia y composición canónica única;
- PR #7 draft/open/no merge.

## 3. Identidades Shopper

```text
profiles=340
crosswalk=101/8 PASS
reference/planner=65/65 exact match
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

SKIP13 permanece cerrado con historia preservada.

## 4. Autoridad HR viva

Metadata provider, periodo calendario dinámico, registry last-known-good, revisión común, mutación histórica y planner sin conteos fijos permanecen como contrato vigente.

## 5. Request v3 y diagnóstico

```text
requestCommit=d62dbae9b10b0650c2940f4b2bf7d456cb34fc83
WORKFLOW_STARTED_PROVIDER_READS_0=NO OBSERVADO
PROVIDER_READ_BOUNDARY_ENTERED_MAX1=NO OBSERVADO
run/check suite/job localizado=false
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

La existencia del run sigue inconclusa porque el listado disponible no cubre eventos `push`. No existe evidencia observable de frontera provider alcanzada. No inferir `providerReads=0` ni lectura consumida.

## 6. Cadena única restante

### Bloque A — Gate source-only de Actions

1. Comprobar reconocimiento y habilitación del workflow.
2. Verificar que GitHub acepta su definición y trigger sin tocar el request.
3. Cero provider calls, HR o data writes.
4. Documentar causa raíz reproducible.

### Bloque B — Nueva lectura HR

Solo con causa raíz cerrada y autorización fresca separada:

1. una única ejecución lógica read-only;
2. checkpoints observables antes y después de provider;
3. confirmar `2026-08`, GT/HN y conteos vivos;
4. validar mutación histórica y `sourceRevision` transversal;
5. reconciliar por `visitId/hrRowId`, no por recarga ciega.

### Bloque C — Auth y validación acumulativa

1. Materializar plan Auth SKIP13 con `HOLD=0`.
2. Ejecutar únicamente con autorización separada, snapshot, idempotencia, readback y rollback.
3. Smoke Admin/Operaciones, Shopper y Cliente.
4. Tres recargas, nueva pestaña y estabilidad.

### Bloque D — Cutover

Source lock, rollback probado, smoke integral, autorización específica y único cutover.

## 7. Circuit breakers

- No tocar ni reintentar el request v3.
- No afirmar consumo cero.
- No reabrir SKIP13 o 65/65.
- No pedir nueva candidata, rama o PR.
- No ejecutar Auth sin gate separado.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.

## 8. Estado seguro

```text
nuevo trigger=0
provider reads por diagnóstico=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_SOURCE_ONLY_COMPLETE__LIVE_HR_V4_UNRESOLVED__DEV_ONLY_TARGET_CONFIRMED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, crear carriles paralelos ni sustituir HR viva por snapshots o datos fijados.

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

SKIP13 permanece cerrado con historia preservada. Auth no ha sido ejecutado.

## 4. Request HR viva v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
runId recuperado=false
jobId recuperado=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No se reabre sintaxis, registro, trigger, rama o path. Cualquier evidencia tardía debe reconciliarse contra el request exacto.

## 5. Fast-track paralelo ya ejecutado

Para no esperar pasivamente se auditó la preparación de producción source-only.

```text
default/dev project=cxorbia-backend-dev
hosting target=cxorbia-dev
hosting site=cxorbia-backend-dev
Cloud Run service=cxorbia-live-hr-dev
production alias=false
production target=false
production service=false
```

El repositorio todavía no materializa un carril PROD. Un deploy desde el estado actual seguiría apuntando a DEV.

## 6. Cadena única restante

### Bloque A — Cerrar HR v4

1. Reconciliar evidencia terminal del request `ac2032ec...`.
2. Confirmar `2026-08`, tabs GT/HN, conteos vivos, mutación histórica y `sourceRevision` transversal.
3. No emitir segundo trigger mientras el request no tenga evidencia terminal.

### Bloque B — Auth y smoke

1. Ejecutar el plan Auth SKIP13 con `HOLD=0` únicamente mediante autorización separada.
2. Snapshot, idempotencia, readback y rollback.
3. Smoke Admin/Operaciones, Shopper y Cliente.
4. Tres recargas, nueva pestaña y estabilidad.

### Bloque C — Materializar producción

1. Definir un proyecto/target de producción nuevo y separado del DEV vigente.
2. Configurar alias, Hosting target, backend service, credenciales y rollback sin conectar la base legacy.
3. Ejecutar preflight contra el target exacto.
4. Mantener producción legacy intacta hasta autorización de cutover.

### Bloque D — Cutover

Source lock final, validación humana, rollback probado, autorización específica y único cutover.

## 7. Circuit breakers

- No emitir segundo request HR.
- No desplegar DEV como si fuera PROD.
- No conectar ni copiar la base legacy.
- No ejecutar Auth sin gate separado.
- No reabrir SKIP13 o 65/65.
- No pedir nueva candidata, rama o PR.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.

## 8. Estado seguro

```text
segundo trigger=0
provider reads del preflight=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_PRODUCTION_PROMOTION_CONTRACT_PASS__EXISTING_CLEAN_PROJECT_ACCEPTED__LIVE_HR_V4_UNRESOLVED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, crear carriles paralelos ni sustituir HR viva por snapshots o datos fijados.

## 2. Preservado

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones y Reservas;
- Finanzas, Liquidaciones, Portales y reportes;
- `CX.data`, Auth/RBAC y contratos;
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
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

Cualquier evidencia tardía debe reconciliarse contra ese request exacto. No reabrir sintaxis, registro, trigger, rama o path.

## 5. Estrategia de producción cerrada

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
hostingTarget=cxorbia-dev
hostingSite=cxorbia-backend-dev
cloudRunService=cxorbia-live-hr-dev
acceptCurrentIdentifiersAndUrlAsProduction=true
```

Contrato:

```text
backend/config/cxorbia-production-promotion-contract.json
commit=3197aa5056375ddcffd3a67836ba5cf55a91eede
```

Gate:

```text
node --check=PASS
exitCode=0
decision=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
failedChecks=0
```

No crear otro proyecto PROD ni archivos separados mientras esta estrategia siga vigente. No reutilizar la base legacy como backend nuevo.

## 6. Cadena única restante

### Bloque A — Cerrar HR v4

1. Reconciliar evidencia terminal del request `ac2032ec...`.
2. Confirmar `2026-08`, tabs GT/HN, conteos vivos, mutación histórica y `sourceRevision` transversal.
3. No emitir segundo trigger sin clasificación terminal.

### Bloque B — Auth y smoke

1. Ejecutar el plan Auth SKIP13 con autorización separada.
2. Snapshot, idempotencia, readback y rollback.
3. Smoke Admin/Operaciones, Shopper y Cliente.
4. Tres recargas, nueva pestaña y estabilidad.

### Bloque C — Cutover

1. Validación humana.
2. Rollback listo y probado.
3. Autorización específica de cutover.
4. Único deploy/cutover sobre el proyecto limpio promovido.

## 7. Circuit breakers

- No emitir segundo request HR sin cierre terminal.
- No ejecutar Auth sin gate separado.
- No desplegar por efecto del contrato source-only.
- No conectar ni copiar la base legacy.
- No reabrir SKIP13 o 65/65.
- No pedir nueva candidata, rama o PR.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.

## 8. Estado seguro

```text
provider reads del bloque=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_V4_REQUEST_EMITTED__30M_NO_RUN_JOB_CHECKPOINT_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

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

SKIP13 permanece cerrado con historia preservada.

## 4. Antecedente control-plane

Los runs v2 y v3 fueron cancelados antes de cualquier step y consumieron cero lecturas provider. Ese diagnóstico permanece cerrado y no debe reabrirse.

## 5. Request HR viva v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
ventana observada=1820 segundos
runId recuperado=false
jobId recuperado=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

El request fue emitido una sola vez. No hubo segundo trigger ni modificación posterior del request.

## 6. Cadena única restante

### Bloque A — Reconciliar el request v4

1. Asociar cualquier evidencia tardía exclusivamente al request `ac2032ec...`.
2. Si aparece job `cancelled` con `steps=0`, clasificar consumo cero y cerrar.
3. Si aparece frontera provider, determinar consumo máximo uno mediante journal/steps.
4. Si aparece evidencia completa, confirmar `2026-08`, GT/HN, mutación histórica y `sourceRevision`.
5. Mientras no exista evidencia terminal, no emitir otro request.

Esto no reabre sintaxis, registro, trigger, rama o path del workflow.

### Bloque B — Auth y validación acumulativa

Solo después de HR viva resuelta:

1. materializar plan Auth SKIP13 con `HOLD=0`;
2. ejecutar con autorización separada, snapshot, idempotencia, readback y rollback;
3. smoke Admin/Operaciones, Shopper y Cliente;
4. tres recargas, nueva pestaña y estabilidad.

### Bloque C — Cutover

Source lock, rollback probado, smoke integral, autorización específica y único cutover.

## 7. Circuit breakers

- No emitir segundo request mientras v4 permanezca sin evidencia terminal.
- No volver a inferir ausencia de run desde ausencia de status.
- No reabrir SKIP13 o 65/65.
- No pedir nueva candidata, rama o PR.
- No ejecutar Auth sin gate separado.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.

## 8. Estado seguro

```text
segundo trigger=0
provider reads ejecutados por observador=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

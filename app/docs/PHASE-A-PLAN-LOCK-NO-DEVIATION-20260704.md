# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_AUTH_PLAN_340_FREEZE_PASS__IDEMPOTENCY_PASS__SMOKE_MATRIX_PREPARED__SKIPPED_ACCESS_RISK_HOLD__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_PRODUCTION`

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

## 3. Estrategia de producción

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
promotionGate=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
```

Los identificadores actuales se aceptan como producción futura. El contrato no autoriza writes, deploy, merge ni cutover.

## 4. Plan Auth congelado

```text
sourceHead=df65bb45629588b7906b957551108a3a5c71b763
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
idempotencyDecision=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
```

SKIP13 conserva historia, visitas, certificaciones y liquidaciones. No se copiaron filas crudas ni PII al repositorio.

## 5. HOLD de acceso efectivo

```text
skippedProfiles=13
multiAuthResidualProfiles=1
blockingFingerprint=7cc28c78de9bfda01d14
providerCandidates=2
enabledCandidates=2
emailVerifiedCandidates=2
unplannedEffectiveAccessProvenAbsent=false
decision=HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED
```

`HOLD=0` en el plan no prueba ausencia de acceso efectivo. Antes de Auth se requiere una adjudicación read-only acotada a los 13 omitidos. No se permite ejecución parcial.

## 6. Snapshot, rollback y smoke

- manifest de snapshot/rollback: preparado, no ejecutable;
- idempotency key y run marker: obligatorios;
- cambios de contraseña: bloqueados si no existe captura/restauración autorizada de hash/salt;
- smoke acumulativo: preparado para Admin/Operaciones, Shopper y Cliente;
- smoke exige tres recargas, nueva pestaña, aislamiento por rol y una misma `sourceRevision`.

## 7. Request HR viva v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

No están confirmados `2026-08`, GT/HN, mutación histórica ni `sourceRevision` transversal.

## 8. Cadena única restante

### Bloque A — Cerrar riesgo SKIP13

1. Ejecutar una única adjudicación read-only de Auth/membership/claims limitada a los 13 fingerprints omitidos.
2. Confirmar o bloquear acceso efectivo no previsto.
3. No modificar cuentas ni memberships.

### Bloque B — Cerrar HR v4

1. Reconciliar evidencia terminal del request exacto.
2. Confirmar periodo activo, tabs GT/HN, historia y `sourceRevision`.
3. No emitir segundo trigger sin clasificación terminal.

### Bloque C — Auth y smoke

1. Autorización separada para snapshot y repair Auth.
2. Gate pre-write, idempotencia, writes acotados y readback.
3. Rollback listo.
4. Smoke Admin/Operaciones, Shopper y Cliente.
5. Tres recargas, nueva pestaña y estabilidad.

### Bloque D — Cutover

Validación humana, rollback final, autorización específica y único deploy/cutover sobre el proyecto limpio promovido.

## 9. Circuit breakers

- No ejecutar Auth mientras el riesgo SKIP13 permanezca HOLD.
- No emitir segundo request HR sin cierre terminal.
- No desplegar por efecto del contrato source-only.
- No conectar ni copiar la base legacy.
- No reabrir 65/65 ni regenerar el plan sin causa probada.
- No pedir nueva candidata, rama o PR.
- No hardcodear periodos o conteos HR.

## 10. Estado seguro

```text
providerReads=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

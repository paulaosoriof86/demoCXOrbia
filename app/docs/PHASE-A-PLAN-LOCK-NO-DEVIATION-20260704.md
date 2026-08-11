# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, crear carriles paralelos ni sustituir datos vivos por hardcode/snapshots permanentes.

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

El contrato no sustituye gates finales ni autorización de cutover.

## 4. Bloques cerrados

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
HR_SOURCE_MAPPED=true
HR_SOURCE_LIVE=true
M4=COMPLETE
M6=COMPLETE
LIVE_USER_ADMIN_STATIC_GATE=PASS_TERMINAL
STAFF_PROVIDER_SNAPSHOT=PASS
```

No reabrir M1-M4 ni M6 sin P0 reproducible. No repetir provider snapshot.

## 5. Regla permanente de alcance por usuario

Cada alta pregunta `TyA completo` o `Proyectos específicos`; editable después. `TYA_COMPLETE` se expande server-side al inventario vivo exacto. `SPECIFIC_PROJECTS` valida contra ese inventario. Proyecto nuevo no amplía privilegios silenciosamente.

## 6. M5 — estado actual

```text
M5a contract source-only                    = 1/8 COMPLETE
M5b executable backend source materialized = 1/8 COMPLETE
M5c static terminal gate                    = 1/8 COMPLETE
M5d provider snapshot + exact prewrite      = 1/8 COMPLETE
M5 total                                    = 4/8 COMPLETE
```

Provider snapshot terminal:

```text
runId=31518927950
jobId=93870945840
AuthPopulation=228
A=REUSE_EXISTING_CANONICAL owner-bound
B/C/D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
AuthWriteBudget=14
FirestoreWriteBudget=16
RollbackDryRun=PASS
```

El Auth=14 actual es un recálculo nuevo; la coincidencia numérica con el viejo cap superseded se explica por la reutilización de A.

## 7. Cadena única restante

```text
C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION
-> focal repair/bootstrap create-before-retire + readback/rollback evidence
-> wiring localizado Usuarios & Permisos
-> M7 final accumulative multirole smoke contra HR viva
-> M8 human validation + rollback ready
-> M9 explicit cutover + one production promotion
-> M10 post-cutover smoke + freeze
```

No insertar auditorías generales entre esos pasos.

## 8. Métrica estable

```text
M1 35 = COMPLETE
M2 20 = COMPLETE
M3 15 = COMPLETE
M4  5 = COMPLETE
M5  8 = 4/8 COMPLETE
M6  5 = COMPLETE
M7  5 = PENDING
M8  3 = PENDING
M9  3 = PENDING
M10 1 = PENDING
```

**Avance certificado: 84%. Restante: 16%.** El denominador queda congelado.

## 9. Circuit breakers

- No reabrir M1-M4 ni M6.
- No repetir owners/scopes/HR, static gate o provider snapshot.
- No hardcodear staff ni projectIds en UI.
- No wildcard de proyectos.
- No crear nueva candidata, rama o PR por rutina.
- No Auth/Firestore writes antes de autorización exacta.
- No deletes.
- No repetir PREWRITE/Activation general.
- No conectar/copiar base legacy.
- Cada interacción reporta avance, acumulado, restante y siguiente gate.

## 10. Estado seguro

Provider snapshot consumió 1 Auth list y 2 Firestore reads. Provider/Auth/Firestore/Rules/Storage/HR writes=0; deletes=0; deploy=0; merge=false; production=false.

# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-11  
**Estado:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

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
```

No reabrir M1-M4 ni M6 sin P0 reproducible.

## 5. Regla permanente de alcance por usuario

Cada alta debe preguntar `TyA completo` o `Proyectos específicos`; el valor debe poder modificarse después.

`TYA_COMPLETE` se expande server-side al inventario vivo exacto. `SPECIFIC_PROJECTS` valida multiselect contra ese inventario. Un proyecto nuevo no se hereda silenciosamente: requiere revisión/confirmación explícita antes de expandir claims.

## 6. M5 — estado actual

Backend source materializado y static gate terminal PASS:

```text
M5a contract source-only                    = 1/8 COMPLETE
M5b executable backend source materialized = 1/8 COMPLETE
M5c static terminal gate                    = 1/8 COMPLETE
M5 total                                    = 3/8 COMPLETE
```

Evidencia terminal:

```text
runId=31513528713
jobId=93852916856
checkoutHead=9d16521ac67c7a9fa7cd6de393e778bc6a05876b
PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT
```

No se habilitó provider/browser profile.

## 7. Prewrite focal

Preparado source-only:

```text
backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json
```

Distingue R1/R2/R3 staff, target D adicional Ops y `R4_CLIENT_HISTORICAL`. El cap Auth histórico de 14 no se reutiliza. El máximo teórico pre-snapshot es 16, sin autorización de writes; el cap final se congela tras provider snapshot read-only.

## 8. Cadena única restante

```text
C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY
-> freeze exact write budget + rollback dry-run
-> autorización específica repair/bootstrap
-> focal repair/bootstrap + readback/rollback
-> wiring localizado Usuarios & Permisos
-> M7 final accumulative multirole smoke contra HR viva
-> M8 human validation + rollback ready
-> M9 explicit cutover + one production promotion
-> M10 post-cutover smoke + freeze
```

No insertar auditorías generales entre esos pasos.

## 9. Métrica estable

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

**Avance certificado: 83%. Restante: 17%.** El denominador queda congelado.

## 10. Circuit breakers

- No reabrir M1-M4 ni M6 sin P0 reproducible.
- No repetir owners/scopes/HR ni static gate.
- No hardcodear staff ni projectIds en UI.
- No wildcard de proyectos.
- No crear nueva candidata, rama o PR por rutina.
- No provider writes antes de snapshot/prewrite PASS y autorización específica.
- No repetir PREWRITE/Activation general.
- No conectar/copiar base legacy.
- Cada interacción reporta avance, acumulado, restante y siguiente gate.

## 11. Estado seguro

Sin provider reads/writes, Auth/Firestore/Rules/Storage/HR writes, deploy, merge ni producción en el bloque cerrado.
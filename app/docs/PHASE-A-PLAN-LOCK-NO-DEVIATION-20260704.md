# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-11  
**Estado:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

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
M6=COMPLETE
```

No reabrir M1-M3 ni M6 sin P0 reproducible.

## 5. M4 staff — COMPLETE

Los cuatro accesos iniciales tienen decisión empresarial `TYA_COMPLETE`.

El inventario canónico actual demostrado contiene:

```text
projectIds=[cinepolis]
count=1
```

No es wildcard. Los target digests A/B/C/D quedaron cerrados source-safe.

```text
M4=5/5 COMPLETE
```

## 6. Regla permanente de alcance por usuario

Cada alta debe preguntar `TyA completo` o `Proyectos específicos`; el valor debe poder modificarse después.

`TYA_COMPLETE` se expande server-side al inventario vivo exacto. `SPECIFIC_PROJECTS` valida el multiselect contra ese mismo inventario. Un nuevo proyecto no se hereda silenciosamente por usuarios `TYA_COMPLETE`: requiere revisión/confirmación explícita antes de expandir claims.

## 7. M5 — backend executable source

Materializado source-only:

```text
backend/runtime/hr-live-service/user-admin.mjs
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
backend/contracts/c6-live-user-admin-v1.json
tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs
```

Se reutiliza el servicio backend existente; no se creó infraestructura nueva. No se modificó UI desde backend.

```text
M5a contract=1/8 COMPLETE
M5b executable source=1/8 COMPLETE
M5c static terminal gate=PENDING
M5 total=2/8 COMPLETE
```

## 8. Cadena única restante

```text
M5c static source gate
-> M5 PREWRITE focal + autorización + repair/bootstrap/readback/rollback
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
M5  8 = 2/8 COMPLETE
M6  5 = COMPLETE
M7  5 = PENDING
M8  3 = PENDING
M9  3 = PENDING
M10 1 = PENDING
```

**Avance certificado: 82%. Restante: 18%.** El denominador queda congelado.

## 10. Circuit breakers

- No reabrir M1-M4 ni M6 sin P0 reproducible.
- No repetir owners/scopes/HR.
- No hardcodear staff ni projectIds en UI.
- No wildcard de proyectos.
- No crear nueva candidata, rama o PR por rutina.
- No provider/Auth/Firestore repair antes del gate terminal y autorización específica.
- No repetir PREWRITE/Activation general.
- No conectar/copiar base legacy.
- Cada interacción reporta avance, acumulado, restante y siguiente gate.

## 11. Estado seguro

Sin provider/Auth/Firestore/Rules/Storage/HR writes, deploy, merge ni producción en este bloque.
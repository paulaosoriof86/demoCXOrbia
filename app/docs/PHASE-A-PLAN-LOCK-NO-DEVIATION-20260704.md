# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-11  
**Estado:** `C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

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

Los identificadores actuales se aceptan como producción futura. El contrato no sustituye los gates finales ni la autorización de cutover.

## 4. Auth congelado y ya ejecutado

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
```

No reabrir PREWRITE/Activation general ni reconstrucción de 340 identidades sin P0 reproducible.

## 5. Bloque vivo — staff canónico administrable

Las referencias empresariales A/B/C y un acceso adicional de Operaciones fueron recibidas transitoriamente en conversación. No volver a pedirlas ni persistirlas como constantes.

Falta únicamente el scope de proyecto de los cuatro accesos:

```text
TYA_COMPLETE
or
SPECIFIC_PROJECTS
```

`TYA_COMPLETE` se expande a IDs canónicos exactos; no wildcard. `SPECIFIC_PROJECTS` se resuelve 1:1. No asumir Cinépolis.

## 6. Administración viva de usuarios

La UI existente `app/modules/configuracion.js#usuarios` ya cubre el flujo visual, pero actualmente usa localStorage y modo preview. El contrato source-only de backend ya está cerrado PASS:

```text
backend/contracts/c6-live-user-admin-v1.json
app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md
```

No rediseñar UI. El siguiente cierre técnico es backend executable/admin adapter + wiring localizado, con Auth/tenant user doc/audit trail, RBAC, idempotencia, readback y rollback.

## 7. Cadena única restante

```text
M4 scopes exactos + target digests
-> M5 backend executable/admin wiring + repair/bootstrap/readback/rollback
-> M6 HR final production evidence
-> M7 final accumulative multirole smoke
-> M8 human validation + rollback ready
-> M9 explicit cutover + one production promotion
-> M10 post-cutover smoke + freeze
```

No insertar nuevas auditorías generales entre esos pasos.

## 8. Métrica estable

```text
M1 Baseline acumulativa/Phase A preservada        35 = COMPLETE
M2 Auth V4 activation/readback/rollback           20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 = COMPLETE
M4 Owners + exact project entitlements             5 = 2/5 COMPLETE
M5 Staff repair/bootstrap + live admin + rollback  8 = 1/8 COMPLETE
M6 HR final production evidence                     5 = PENDING
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                     1 = PENDING
```

**Avance certificado: 73%. Restante: 27%.** El denominador queda congelado.

## 9. Circuit breakers

- No reabrir M1-M3 sin P0 reproducible.
- No repetir preguntas ya respondidas.
- No hardcodear staff ni scopes.
- No crear nueva candidata, rama o PR por rutina.
- No ejecutar provider/repair antes de scope exacto.
- No repetir PREWRITE/Activation general.
- No conectar ni copiar la base legacy.
- No hardcodear periodos HR.
- Cada interacción debe reportar avance nuevo, porcentaje acumulado, porcentaje restante y siguiente gate exacto.

## 10. Estado seguro

Sin provider/HR/Auth/Firestore/Rules/Storage writes, deploy, merge ni producción en el bloque actual.

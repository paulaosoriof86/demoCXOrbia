# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `C6_HR_LIVE_DIRECT_READ_PASS__LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_REPAIR__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock HR vigente: `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md`;
- source lock user-admin: `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md`;
- producción: intacta.

## 2. Baseline Auth protegido

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

No reconstruir las 340 identidades ni repetir PREWRITE/Activation/smoke históricos.

## 3. HR viva — M6 cerrado

Se corrigió la clasificación anterior. La HR no estaba pendiente de mapeo/conexión; el pendiente provenía de un antiguo bloqueo de observabilidad del workflow provider.

Lectura directa actual de la fuente compartida previamente:

```text
source=Google Sheets live
sourceTitle=HR Guatemala - Sincronizacion Google Sheets
sourceModifiedAt=2026-08-10T17:42:27.338Z
period=2026-08
GT visit rows=34
HN visit rows=10
total=44
GT country validation=PASS
HN country validation=PASS
HR_SOURCE_MAPPED=true
HR_SOURCE_LIVE=true
M6=COMPLETE
```

No se almacenaron filas ni PII. No pedir nuevamente enlace/export ni rehacer mapeo. El próximo control de HR ocurre solo dentro de M7 para verificar que el build final consume la misma autoridad viva.

## 4. Input empresarial recibido

Las referencias empresariales para A/Superadministración, B/Administración, C/Operaciones y un acceso adicional de Operaciones fueron recibidas transitoriamente. No volver a pedirlas ni persistirlas como constantes técnicas.

Falta únicamente el alcance de proyecto de cada acceso:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
additional Ops user      -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

No inferir scope por rol ni asumir Cinépolis.

## 5. Autoadministrabilidad — contrato cerrado, executable pendiente

```text
app/modules/configuracion.js#usuarios = UI existente
cx_users/cx_custom_roles/cx_perm = localStorage actual
LIVE_USER_ADMIN_BACKEND=false
backend/contracts/c6-live-user-admin-v1.json = PASS_SOURCE_ONLY
```

El contrato exige datos vivos, cero usuarios hardcodeados, create/update/disable/reactivate, role/project scope administrable, Firebase Auth + `tenants/{tenantId}/users/{uid}`, audit trail, idempotencia, readback y rollback. El frontend no se rediseña.

## 6. Progreso de cierre a producción — métrica estable

```text
M1 Baseline acumulativa/Phase A preservada        35 pts = COMPLETE
M2 Auth V4 activation/readback/rollback           20 pts = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 pts = COMPLETE
M4 Owners + exact project entitlements             5 pts = 2/5 COMPLETE
M5 Staff repair/bootstrap + live admin + rollback  8 pts = 1/8 COMPLETE
M6 HR live current production evidence              5 pts = COMPLETE
M7 Final accumulative multirole smoke               5 pts = PENDING
M8 Human validation + rollback ready                3 pts = PENDING
M9 Explicit cutover + one production promotion      3 pts = PENDING
M10 Post-cutover smoke + freeze                     1 pt  = PENDING
```

**Avance certificado actual: 78%. Restante: 22%.** El denominador no cambia.

## 7. Circuit breaker anti-bucle

1. No reabrir M1-M3 ni M6 sin P0 reproducible.
2. No volver a preguntar owner names ya recibidos.
3. No volver a pedir el enlace HR ni re-mapear la fuente viva.
4. No hardcodear staff, emails ni projectIds.
5. No nueva candidata/rama/PR por rutina.
6. No repetir PREWRITE/Activation general.
7. No repair Auth antes de scopes exactos.
8. El gap de usuarios se resuelve dentro de M5, no con nueva metodología.
9. Cada interacción reportará avance nuevo, porcentaje acumulado, porcentaje restante y siguiente gate exacto.

## 8. Siguiente bloque exacto

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

Prerequisito humano único pendiente: los cuatro scopes. Después cerrar target claims/digests y construir el backend/admin adapter source-only con gate estático. M6 no vuelve a la cola.

## 9. Estado seguro

```text
HR live reads=this session only
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```
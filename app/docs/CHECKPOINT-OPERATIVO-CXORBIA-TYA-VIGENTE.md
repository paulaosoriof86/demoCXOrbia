# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock actual: `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md`;
- contrato nuevo: `backend/contracts/c6-live-user-admin-v1.json`;
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

## 3. Input empresarial recibido

Las referencias empresariales para A/Superadministración, B/Administración, C/Operaciones y un acceso adicional de Operaciones fueron recibidas transitoriamente en la conversación actual. No volver a pedirlas ni persistirlas como constantes técnicas.

Falta únicamente el alcance de proyecto de cada acceso:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
additional Ops user      -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

No inferir scope por rol ni asumir Cinépolis.

## 4. Autoadministrabilidad — hallazgo y contrato

Hallazgo reproducible:

```text
app/modules/configuracion.js#usuarios = UI existente y aprobada
cx_users/cx_custom_roles/cx_perm = localStorage actual
invitation = preview only
app/core/backend-firebase.js = sin user/Auth/claims admin writes
LIVE_USER_ADMIN_BACKEND=false
PRODUCTION_BLOCKER=true
```

Contrato source-only creado y validado:

```text
backend/contracts/c6-live-user-admin-v1.json
PASS_C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY
```

Exige datos vivos, cero usuarios hardcodeados, create/update/disable/reactivate, role/project scope administrable, Firebase Auth + `tenants/{tenantId}/users/{uid}`, audit trail, idempotencia, readback y rollback. Hard delete queda apagado por defecto.

El frontend no se rediseña: el futuro ajuste se limita a sustituir la autoridad localStorage por el adapter vivo preservando la UI existente.

## 5. Progreso de cierre a producción — métrica estable

```text
M1 Baseline acumulativa/Phase A preservada        35 pts = COMPLETE
M2 Auth V4 activation/readback/rollback           20 pts = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 pts = COMPLETE
M4 Owners + exact project entitlements             5 pts = 2/5 COMPLETE
M5 Staff repair/bootstrap + live admin + rollback  8 pts = 1/8 COMPLETE
M6 HR final production evidence                     5 pts = PENDING
M7 Final accumulative multirole smoke               5 pts = PENDING
M8 Human validation + rollback ready                3 pts = PENDING
M9 Explicit cutover + one production promotion      3 pts = PENDING
M10 Post-cutover smoke + freeze                     1 pt  = PENDING
```

**Avance certificado actual: 73%. Restante: 27%.** El denominador no cambia.

## 6. Circuit breaker anti-bucle

1. No reabrir M1-M3 sin P0 reproducible.
2. No volver a preguntar owner names ya recibidos.
3. No hardcodear staff, emails ni projectIds.
4. No nueva candidata/rama/PR por rutina.
5. No repetir PREWRITE/Activation general.
6. No provider/repair antes de scopes exactos.
7. El gap de usuarios se resuelve dentro de M5, no con nueva metodología.
8. Cada interacción reportará avance nuevo, porcentaje acumulado, porcentaje restante y siguiente gate exacto.

## 7. Siguiente bloque exacto

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

Prerequisito único pendiente: recibir los cuatro scopes. Después cerrar target claims/digests y construir el backend/admin adapter source-only con gate estático, sin provider ni writes.

## 8. Estado seguro

```text
providerReadsCurrentBlock=0
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

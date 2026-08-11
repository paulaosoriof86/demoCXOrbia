# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md`;
- producción: intacta.

## 2. Baseline protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
HRSourceMapped=true
HRSourceLive=true
M6=COMPLETE
```

No reconstruir Auth, no reabrir HR y no repetir PREWRITE/Activation históricos.

## 3. M4 — staff inicial cerrado

La decisión empresarial vigente es:

```text
A / Superadministración -> TYA_COMPLETE
B / Administración      -> TYA_COMPLETE
C / Operaciones          -> TYA_COMPLETE
D / Operaciones adicional-> TYA_COMPLETE
```

No volver a pedir owner names, correos o scope inicial.

El inventario canónico source-safe materializado vigente contiene un único projectId TyA:

```text
projectIds=[cinepolis]
count=1
```

`TYA_COMPLETE` se convierte a projectIds exactos; nunca wildcard. Los cuatro target digests quedaron materializados source-safe en `backend/config/c6-staff-bootstrap-targets-v1.json` y `app/docs/evidence/C6-STAFF-TYA-COMPLETE-TARGET-DIGESTS-LATEST.json`.

```text
M4=5/5 COMPLETE
```

## 4. Regla viva de alcance por usuario

Usuarios & Permisos debe preguntar al crear cada usuario:

```text
Alcance de proyectos:
- TyA completo
- Proyectos específicos
```

El alcance es obligatorio en alta y editable después. `Proyectos específicos` usa el inventario vivo de proyectos. `TyA completo` también persiste projectIds exactos; si aparecen proyectos nuevos, no hay herencia silenciosa: se marca revisión de scope hasta confirmar la expansión.

Cada cambio de rol/scope debe actualizar claims + documento vivo + auditoría + readback.

## 5. M5 — backend source preparado

Contrato v1.1 y backend executable source ya existen:

```text
backend/contracts/c6-live-user-admin-v1.json
backend/runtime/hr-live-service/user-admin.mjs
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs
```

Se reutiliza el servicio backend existente; no se creó servicio, proyecto, rama ni PR nuevo.

Subasignación:

```text
M5a contract source-only                    = COMPLETE 1/8
M5b executable backend source materialized = COMPLETE 1/8
M5c static terminal gate                    = PENDING
M5 remaining repair/bootstrap/readback/rollback/wiring = PENDING
```

No se declara el gate estático PASS hasta ejecutar el script contra el checkout vivo.

## 6. Progreso de cierre

```text
M1 Baseline acumulativa/Phase A preservada        35 = COMPLETE
M2 Auth V4 activation/readback/rollback           20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 = COMPLETE
M4 Owners + exact project entitlements             5 = COMPLETE
M5 Staff repair/bootstrap + live admin + rollback  8 = 2/8 COMPLETE
M6 HR live current production evidence              5 = COMPLETE
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                     1 = PENDING
```

**Avance certificado: 82%. Restante: 18%.** El denominador no cambia.

## 7. Circuit breaker anti-bucle

1. No reabrir M1-M4 ni M6 sin P0 reproducible.
2. No volver a pedir owners, scopes iniciales ni HR.
3. No hardcodear staff/emails/projectIds en runtime UI.
4. No nueva candidata/rama/PR por rutina.
5. No provider/Auth/Firestore repair antes del gate source-only terminal.
6. No rediseñar Usuarios & Permisos; wiring localizado únicamente.
7. No producción sin autorización explícita de cutover.

## 8. Siguiente gate exacto

`C6 LIVE USER ADMIN STATIC SOURCE GATE -> STAFF REPAIR/BOOTSTRAP PREWRITE`.

El siguiente paso no requiere información empresarial adicional. Debe ejecutar el gate source-only y, únicamente con PASS, construir snapshot + plan exacto de repair/bootstrap + rollback dry-run. Las mutaciones provider siguen sin autorización.

## 9. Estado seguro

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
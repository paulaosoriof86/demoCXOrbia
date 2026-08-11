# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`;
3. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`;
4. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
5. `backend/config/c6-staff-provider-collision-targets-v1.json`;
6. `backend/contracts/c6-staff-provider-snapshot-runner-v1.json`;
7. `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-HARNESS-REPAIRED-20260811.md`;
8. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
9. `backend/config/c6-staff-bootstrap-targets-v1.json`;
10. `backend/contracts/c6-live-user-admin-v1.json` + `backend/runtime/hr-live-service/user-admin.mjs`;
11. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md` y su evidencia;
12. freeze Auth rector y source locks históricos cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
13. `CAMBIOS-BACKEND.md`;
14. `RESUMEN-PARA-CLAUDE.md`;
15. `PENDIENTES-PROTOTIPO.md`;
16. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Fuentes históricas que indiquen provider snapshot, scopes, HR, SKIP13, HashConfig, direct runner, Activation o static live-user-admin como pendientes quedan superseded.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuthAdjudication=closed
HashConfig=closed PASS
HRSourceMapped=true
HRSourceLive=true
M4=COMPLETE 5/5
M5=4/8 COMPLETE
M6=COMPLETE 5/5
InitialStaffEntitlement=TYA_COMPLETE_ALL_FOUR
CanonicalCurrentProjectIds=[cinepolis]
LiveUserAdminStaticGate=PASS_TERMINAL
StaffProviderSnapshot=PASS
ProviderAuthPopulation=228
ProviderAuthListObservations=1
ProviderFirestoreReads=2
ProviderWrites=0
A=REUSE_EXISTING_CANONICAL_OWNER_BOUND
B=CREATE_NEW_EPHEMERAL
C=CREATE_NEW_EPHEMERAL
D=CREATE_NEW_EPHEMERAL
R4Canonical=PRESERVED_EXACT
FrozenAuthWriteBudget=14
FrozenFirestoreWriteBudget=16
RollbackDryRun=PASS
Production=false
```

## 3. Provider snapshot terminal

```text
requestId=c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-02-harness-rootfix
runId=31518927950
jobId=93870945840
artifactId=9112228351
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE
blockers=[]
```

Se consumió una sola observación Auth efectiva. El request quedó disabled/consumed; no hay segundo provider read autorizado.

A fue adjudicado para reutilización solo por owner-binding independiente + claims exactos; no por unicidad de rol. B/C/D no tienen colisión técnica y requieren canonical nuevo. Los ocho históricos focales siguen enabled y solo podrán retirarse `DISABLE_ONLY_NO_DELETE` después del canonical readback correspondiente. El canónico Cliente permanece exacto e inmutable.

## 4. Write budget congelado

```text
Auth creates=3
customClaims writes=3
Auth disables=8
Auth writes total=14
Auth deletes=0
userDocs=4
auditLogs=12
Firestore writes total=16
Firestore deletes=0
```

El 14 actual fue recalculado desde snapshot y solo coincide numéricamente con el antiguo cap; no es reutilización del presupuesto histórico superseded.

## 5. Rollback

Rollback dry-run PASS con 12 inverse actions; cero deletes; canónico Cliente no se modifica.

## 6. HR y usuarios

M6 permanece cerrado: 2026-08 = 34 GT + 10 HN = 44. Alta staff sigue exigiendo `TyA completo` o `Proyectos específicos`, editable y sin wildcard/herencia silenciosa.

## 7. Progreso estable

**Avance certificado: 84%. Restante: 16%.**

## 8. Pendiente exacto

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

Con autorización: ejecutar una sola operación focal dentro del budget congelado -> readback/rollback evidence -> wiring localizado Usuarios & Permisos -> M7 -> M8 -> M9 -> M10.

## 9. Circuit breaker anti-bucle

- no reabrir M1-M4 ni M6;
- no repetir provider snapshot;
- no repetir static gate;
- no volver a pedir owners/scopes/HR;
- no nueva candidata/rama/PR;
- no Auth/Firestore writes sin autorización exacta;
- no deletes;
- no rediseñar Usuarios & Permisos;
- no deploy/merge/producción sin gate explícito.

## 10. Estado seguro

Provider snapshot realizó 1 Auth list + 2 Firestore reads; provider/Auth/Firestore/HR/Rules/Storage writes 0; deletes 0; deploy 0; merge false; production false.

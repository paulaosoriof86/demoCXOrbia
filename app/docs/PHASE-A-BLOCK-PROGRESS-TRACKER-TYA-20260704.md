# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_PRODUCTION`

## 1. Baseline vigente

```text
Phase A cumulative baseline=preserved
AuthUsersAfter=228
Activation=PASS
Auth Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=PASS
DirectRunnerDEV=PASS
HR live M6=COMPLETE
M4=COMPLETE
```

Estados históricos anteriores no reabren estos bloques.

## 2. Administración viva de usuarios

```text
scope required on create=true
scope editable later=true
modes=TYA_COMPLETE|SPECIFIC_PROJECTS
wildcard=false
future-project silent inheritance=false
backend executable source=materialized
static terminal gate=PASS
provider snapshot=PASS
```

## 3. Provider snapshot/prewrite

```text
runId=31518927950
jobId=93870945840
AuthPopulation=228
A=REUSE_EXISTING_CANONICAL owner-bound
B=CREATE_NEW_EPHEMERAL
C=CREATE_NEW_EPHEMERAL
D=CREATE_NEW_EPHEMERAL
R4 canonical Cliente=preserved exact
historicalEnabled=8
AuthWriteBudget=14
FirestoreWriteBudget=16
RollbackDryRun=PASS
```

No repetir provider snapshot. No hay writes autorizados todavía.

## 4. Tracker estable de 100 puntos

| Milestone | Peso | Estado |
|---|---:|---|
| M1 Baseline acumulativa/Phase A | 35 | COMPLETE |
| M2 Auth V4 activation/readback/rollback | 20 | COMPLETE |
| M3 SKIP13/MultiAuth/HashConfig/direct runner | 15 | COMPLETE |
| M4 Owners + exact project entitlements | 5 | COMPLETE |
| M5 Staff repair/bootstrap + live admin + rollback | 8 | 4/8 COMPLETE |
| M6 HR live current production evidence | 5 | COMPLETE |
| M7 Final accumulative multirole smoke | 5 | PENDING |
| M8 Human validation + rollback ready | 3 | PENDING |
| M9 Explicit cutover + one production promotion | 3 | PENDING |
| M10 Post-cutover smoke + freeze | 1 | PENDING |

**Avance certificado: 84%. Restante: 16%.**

## 5. Cadena única restante

```text
C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION
→ repair/bootstrap focal + readback/rollback
→ wiring localizado Usuarios & Permisos
→ M7 final smoke con HR viva
→ M8
→ M9
→ M10
```

## 6. Anti-bucle

- M1-M4 y M6 no se reabren.
- No repetir static gate ni provider snapshot.
- No repetir PREWRITE/Activation general, HR, owners ni scopes.
- No nueva candidata/rama/PR.
- No Auth/Firestore writes sin autorización exacta.
- No deletes.
- El denominador de 100 puntos no cambia.

## 7. Estado seguro

Una observación Auth provider + dos reads Firestore focales consumidos; cero provider/Auth/Firestore/HR/Rules/Storage writes, deploy, merge y producción.

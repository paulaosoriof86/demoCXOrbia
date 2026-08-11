# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `PASS_C6_LIVE_USER_ADMIN_STATIC_SOURCE_GATE_TERMINAL__STAFF_REPAIR_BOOTSTRAP_PREWRITE_CONTRACT_READY__PROVIDER_SNAPSHOT_PENDING__NO_PRODUCTION`

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
runId=31513528713
jobId=93852916856
```

El backend source usa inventario vivo de proyectos; la UI no debe hardcodear el projectId actual.

## 3. Prewrite focal

`backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json` está preparado. Diferencia target D Ops del histórico `R4_CLIENT_HISTORICAL`, preserva disable-only/no-delete y exige snapshot + rollback dry-run. El cap Auth=14 histórico queda superseded; el cap final se congela después del snapshot provider read-only.

## 4. Tracker estable de 100 puntos

| Milestone | Peso | Estado |
|---|---:|---|
| M1 Baseline acumulativa/Phase A | 35 | COMPLETE |
| M2 Auth V4 activation/readback/rollback | 20 | COMPLETE |
| M3 SKIP13/MultiAuth/HashConfig/direct runner | 15 | COMPLETE |
| M4 Owners + exact project entitlements | 5 | COMPLETE |
| M5 Staff repair/bootstrap + live admin + rollback | 8 | 3/8 COMPLETE |
| M6 HR live current production evidence | 5 | COMPLETE |
| M7 Final accumulative multirole smoke | 5 | PENDING |
| M8 Human validation + rollback ready | 3 | PENDING |
| M9 Explicit cutover + one production promotion | 3 | PENDING |
| M10 Post-cutover smoke + freeze | 1 | PENDING |

**Avance certificado: 83%. Restante: 17%.**

## 5. Cadena única restante

```text
C6 STAFF REPAIR/BOOTSTRAP PROVIDER SNAPSHOT READ-ONLY
→ freeze exact write budget + rollback dry-run
→ autorización específica repair/bootstrap
→ repair/bootstrap + readback/rollback
→ wiring localizado Usuarios & Permisos
→ M7 final smoke con HR viva
→ M8
→ M9
→ M10
```

## 6. Anti-bucle

- M1-M4 y M6 no se reabren sin P0 reproducible.
- No repetir static gate, PREWRITE/Activation general, HR, owners ni scopes.
- No nueva candidata/rama/PR.
- No provider writes antes de snapshot/prewrite PASS y autorización específica.
- El denominador de 100 puntos no cambia.

## 7. Estado seguro

Cero provider reads/writes, Auth/Firestore/HR/Rules/Storage writes, deploy, merge y producción en el bloque cerrado.
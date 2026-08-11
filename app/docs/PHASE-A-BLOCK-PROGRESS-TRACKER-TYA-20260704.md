# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PRODUCTION`

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
```

Estados históricos anteriores no reabren estos bloques.

## 2. M4 staff — cerrado

```text
A scope=TYA_COMPLETE
B scope=TYA_COMPLETE
C scope=TYA_COMPLETE
D scope=TYA_COMPLETE
canonical current projectIds=[cinepolis]
target digests=PASS SOURCE-SAFE
M4=5/5 COMPLETE
```

No volver a preguntar owners ni scopes iniciales.

## 3. Administración viva de usuarios

```text
scope required on create=true
scope editable later=true
modes=TYA_COMPLETE|SPECIFIC_PROJECTS
wildcard=false
future-project silent inheritance=false
backend executable source=materialized
static gate script=prepared
static terminal gate=PENDING
```

El backend source usa inventario vivo de proyectos; la UI no debe hardcodear el projectId actual.

## 4. Tracker estable de 100 puntos

| Milestone | Peso | Estado |
|---|---:|---|
| M1 Baseline acumulativa/Phase A | 35 | COMPLETE |
| M2 Auth V4 activation/readback/rollback | 20 | COMPLETE |
| M3 SKIP13/MultiAuth/HashConfig/direct runner | 15 | COMPLETE |
| M4 Owners + exact project entitlements | 5 | COMPLETE |
| M5 Staff repair/bootstrap + live admin + rollback | 8 | 2/8 COMPLETE |
| M6 HR live current production evidence | 5 | COMPLETE |
| M7 Final accumulative multirole smoke | 5 | PENDING |
| M8 Human validation + rollback ready | 3 | PENDING |
| M9 Explicit cutover + one production promotion | 3 | PENDING |
| M10 Post-cutover smoke + freeze | 1 | PENDING |

**Avance certificado: 82%. Restante: 18%.**

## 5. Cadena única restante

```text
M5c static source gate
→ M5 repair/bootstrap PREWRITE + autorización + readback/rollback
→ wiring localizado Usuarios & Permisos
→ M7 final smoke con HR viva
→ M8
→ M9
→ M10
```

## 6. Anti-bucle

- M1-M4 y M6 no se reabren sin P0 reproducible.
- No repetir PREWRITE/Activation general.
- No pedir HR, owners ni scopes iniciales otra vez.
- No nueva candidata/rama/PR.
- No provider writes antes del gate/autorización.
- El denominador de 100 puntos no cambia.

## 7. Estado seguro

Cero provider/Auth/Firestore/HR/Rules/Storage writes, deploy, merge y producción en este bloque.
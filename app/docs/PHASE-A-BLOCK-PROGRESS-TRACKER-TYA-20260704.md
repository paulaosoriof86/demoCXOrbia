# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `C6_HR_LIVE_DIRECT_READ_PASS__AUTH228_PRESERVED__LIVE_USER_ADMIN_CONTRACT_PASS__SCOPES_PENDING__NO_PRODUCTION`

## 1. Corrección de tracker

Este tracker estaba desactualizado desde el 2026-08-06 y todavía mostraba el plan Auth antiguo con 13 HOLD. Esa representación queda superseded por el índice/checkpoint vigentes.

No usar estados históricos del tracker para reabrir SKIP13, multi-Auth, HashConfig, Activation, direct runner o HR mapping.

## 2. Baseline vigente cerrada

```text
Phase A cumulative baseline=preserved
Auth plan V4=FROZEN
AuthUsersAfter=228
Activation=PASS
Auth Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=PASS
DirectRunnerDEV=PASS
```

## 3. HR viva — M6 COMPLETE

Lectura directa actual 2026-08-11:

```text
source=shared Google Sheets live
period=2026-08
GT=34
HN=10
total=44
country validation=PASS/PASS
source live=true
remap required=false
```

El antiguo source lock de observabilidad HR queda histórico. No volver a poner HR en HOLD por ausencia de un run del workflow anterior.

## 4. Staff canónico/autoadministrable

```text
owner references A/B/C=received transiently
additional Ops access=received transiently
project entitlements=pending
live user-admin UI=exists
live user-admin contract=PASS SOURCE-ONLY
live user-admin executable backend=pending
Auth repair focal=pending after exact scopes
```

Pendiente humano mínimo: `TYA_COMPLETE` o `SPECIFIC_PROJECTS` para A, B, C y acceso adicional Ops.

## 5. Tracker estable de 100 puntos

| Milestone | Peso | Estado |
|---|---:|---|
| M1 Baseline acumulativa/Phase A | 35 | COMPLETE |
| M2 Auth V4 activation/readback/rollback | 20 | COMPLETE |
| M3 SKIP13/MultiAuth/HashConfig/direct runner | 15 | COMPLETE |
| M4 Owners + exact project entitlements | 5 | 2/5 COMPLETE |
| M5 Staff repair/bootstrap + live admin + rollback | 8 | 1/8 COMPLETE |
| M6 HR live current production evidence | 5 | COMPLETE |
| M7 Final accumulative multirole smoke | 5 | PENDING |
| M8 Human validation + rollback ready | 3 | PENDING |
| M9 Explicit cutover + one production promotion | 3 | PENDING |
| M10 Post-cutover smoke + freeze | 1 | PENDING |

**Avance certificado: 78%. Restante: 22%.**

## 6. Cadena única restante

```text
M4 exact scopes/digests
→ M5 live-user-admin executable + focal repair/readback/rollback
→ M7 final multirole smoke using the already-live HR
→ M8 human validation/rollback ready
→ M9 explicit cutover
→ M10 post-cutover smoke/freeze
```

## 7. Anti-bucle

- M1-M3 y M6 no se reabren sin P0 reproducible.
- No repetir PREWRITE/Activation general.
- No pedir nuevamente HR ni remapearla.
- No volver a preguntar owner names.
- No nueva candidata/rama/PR por rutina.
- El denominador de 100 puntos no cambia.

## 8. Estado seguro

Lecturas HR directas sin writes. Cero Auth/Firestore/HR/Rules/Storage writes, deploy, merge y producción en este bloque.
# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_PRODUCTION`

Baseline preservada: Auth 228; Activation/readback/rollback PASS; SKIP13/MultiAuth/HashConfig/direct runner cerrados; M4 COMPLETE; HR M6 COMPLETE; live-user-admin static PASS; provider snapshot PASS.

Exact write request consumido: run `31534505451`, blocker `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`, credential privacy PASS, identity resolution FAIL, Auth writes 0, Firestore writes 0, deletes 0. M5 no suma punto.

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

**84% certificado; 16% restante.**

Cadena única: `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY -> recovery PASS -> nueva autorización exact-write -> repair/readback/rollback -> wiring Usuarios & Permisos -> M7 -> M8 -> M9 -> M10`.

Anti-bucle: no reejecutar request consumido; no repetir provider snapshot/static/HR/owners/scopes; no reabrir Auth 340; no inferir B; no rama/PR/candidata/workflow nuevo; no writes sin recovery PASS + nueva autorización; no deletes.

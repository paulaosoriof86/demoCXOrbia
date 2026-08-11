# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_PRODUCTION`

Baseline preservada: Auth 228; Activation/readback/rollback PASS; SKIP13/MultiAuth/HashConfig/direct runner cerrados; M4 COMPLETE; HR M6 COMPLETE.

Live-user-admin: source materializado; static gate PASS; provider snapshot PASS.

Provider snapshot: Auth population 228; A reutiliza canonical por owner-binding independiente; B/C/D crean canonical nuevo; R4 Cliente preservado exacto; 8 históricos enabled. Budget: Auth=14, Firestore=16, deletes=0; rollback dry-run PASS.

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

Cadena única: `C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION -> repair/readback/rollback -> wiring Usuarios & Permisos -> M7 -> M8 -> M9 -> M10`.

Anti-bucle: no reabrir M1-M4/M6, static/provider snapshot, HR/owners/scopes; no rama/PR/candidata nueva; no writes sin autorización; no deletes.
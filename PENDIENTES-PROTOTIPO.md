# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

Cerrado/protegido: frontend; Auth228; Activation/readback/rollback; SKIP13/MultiAuth/HashConfig/direct runner; M4; HR M6; live-user-admin source/static; provider snapshot PASS; budget Auth14/Firestore16 + rollback PASS.

Exact-write consumido run31534505451: blocker `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`, privacy PASS, identityResolution false, Auth0/Firestore0/deletes0. No reejecutar request ni provider snapshot.

Pendiente: `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY` -> recovery PASS -> nueva autorización exact-write -> repair/readback/rollback -> wiring Usuarios & Permisos -> M7 -> M8 -> M9 -> M10.

No pedir owners/scopes/HR otra vez; no inferir B; no hardcode/wildcard; no nueva candidata/rama/PR/workflow; no writes hasta recovery PASS + nueva autorización; no deletes/deploy/merge/producción.

**84% certificado; 16% restante; M5=4/8.**

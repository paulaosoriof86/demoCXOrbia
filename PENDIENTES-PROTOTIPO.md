# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

Cerrado/protegido: frontend acumulativo; Auth 228; Activation/readback/rollback; SKIP13/MultiAuth/HashConfig/direct runner; M4; HR M6; live-user-admin source/static; provider snapshot PASS; budget Auth14/Firestore16 + rollback dry-run PASS.

Exact write consumido: run `31534505451`, blocker `PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B`, credentialPrivacyPass=true, identityResolutionPass=false, Auth writes=0, Firestore writes=0, deletes=0. No reejecutar request ni repetir provider snapshot.

Pendiente vivo:
1. `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY` desde fuentes privadas existentes, sin provider writes/PII emitida;
2. con recovery PASS, nueva autorización focal exact-write;
3. repair/bootstrap + readback/rollback;
4. wiring localizado Usuarios & Permisos;
5. M7 smoke HR viva;
6. M8 validación humana;
7. M9 cutover;
8. M10 freeze.

No pedir de nuevo owners/scopes/HR; no inferir B; no hardcode/wildcard; no nueva candidata/rama/PR/workflow; no Auth/Firestore writes hasta recovery PASS + nueva autorización; no deletes/deploy/merge/producción.

**84% certificado; 16% restante; M5=4/8.**

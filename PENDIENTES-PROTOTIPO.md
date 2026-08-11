# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Cerrado y protegido

Frontend acumulativo; Auth 228; Activation/readback/rollback; SKIP13; MultiAuth; HashConfig; direct runner; M4; HR M6; live-user-admin source + static gate; provider snapshot PASS; budget Auth=14/Firestore=16 y rollback dry-run PASS.

## Exact write consumido

```text
request=c6-staff-repair-bootstrap-exact-write-20260811-01
run=31534505451
blocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
credentialPrivacyPass=true
identityResolutionPass=false
AuthWrites=0
FirestoreWrites=0
Deletes=0
```

No reejecutar ese request y no repetir provider snapshot.

## Pendiente vivo inmediato

1. `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`: recuperar/validar A-D desde fuentes privadas existentes, sin provider writes ni PII emitida;
2. solo con recovery PASS, preparar una **nueva** autorización focal de exact write bajo el mismo budget congelado y sin deletes;
3. ejecutar repair/bootstrap + readback/rollback;
4. wiring localizado de `app/modules/configuracion.js#usuarios`;
5. M7 smoke acumulativo multirol contra HR viva;
6. M8 validación humana;
7. M9 cutover autorizado;
8. M10 post-smoke/freeze.

No volver a pedir owners/scopes/HR. Tampoco inventar el login faltante; primero agotar recuperación privada source-only.

## Métrica

**84% certificado; 16% restante. M5=4/8.**

## No hacer

No reejecutar request consumido; no repetir static/provider snapshot; no reabrir Auth 340/SKIP13/MultiAuth/HR; no inferir B por nombre/rol; no hardcode/wildcard; no nueva candidata/rama/PR/workflow; no Auth/Firestore writes hasta recovery PASS + nueva autorización; no deletes/deploy/merge/producción.

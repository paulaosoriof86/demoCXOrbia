# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md`;
3. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json`;
4. `.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json`;
5. exact-write contract/executor;
6. provider snapshot PASS run `31518927950` + source lock/evidence;
7. live-user-admin static PASS + contracts/runtime;
8. HR live PASS;
9. Auth/Activation/SKIP13/MultiAuth/HashConfig/direct runner freeze;
10. CAMBIOS/RESUMEN/PENDIENTES/plan/tracker/Academia;
11. PR #7 y HEAD vivo.

## Estado rector

```text
AuthUsersFrozenBaseline=228
M4=COMPLETE 5/5
M5=4/8 COMPLETE
M6=COMPLETE 5/5
ProviderSnapshot=PASS 31518927950
FrozenAuthWriteBudget=14
FrozenFirestoreWriteBudget=16
ExactWriteRequest=CONSUMED
ExactWriteRun=31534505451
ExactWriteDecision=STOP_RETRY
ExactWriteBlocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
CredentialPrivacyPass=true
IdentityResolutionPass=false
ProviderStatePass=false
ExactWriteAuthWrites=0
ExactWriteFirestoreWrites=0
ExactWriteDeletes=0
Production=false
```

Causa raíz: `visibleLogin` B no pudo resolverse exactamente desde fuentes privadas contra digest SHA-256 one-way. No inferir ni sustituir identidad.

**84% certificado; 16% restante.**

Siguiente bloque: `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

No reejecutar request consumido; no repetir provider/static/HR/owners/scopes/Auth 340; no inferir B; no nueva candidata/rama/PR/workflow; no Auth/Firestore writes hasta recovery PASS + nueva autorización; no deletes/deploy/merge/producción.

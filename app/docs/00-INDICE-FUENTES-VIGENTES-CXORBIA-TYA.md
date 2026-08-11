# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md`;
3. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json`;
4. `.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json`;
5. `backend/contracts/c6-staff-repair-bootstrap-exact-write-v1.json` + executor;
6. provider snapshot PASS run `31518927950` y su source lock/evidence;
7. live-user-admin static PASS, contracts y runtime source;
8. HR live PASS y evidencia;
9. freeze Auth/Activation/SKIP13/MultiAuth/HashConfig/direct runner;
10. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, plan/tracker Phase A, Academia;
11. PR #7 y HEAD vivo.

Toda fuente previa que presente el exact write como pendiente de autorización queda superseded.

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

## Causa raíz

El request pasó gates source-only y privacidad criptográfica, pero se detuvo antes del primer provider write porque las fuentes privadas disponibles no resolvieron el `visibleLogin` B exactamente contra el digest SHA-256 congelado. El digest no es reversible y no se permite inferir identidad.

## Progreso

**84% certificado; 16% restante.**

## Siguiente bloque

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

No reejecutar request consumido; no repetir provider snapshot/static/HR/owners/scopes/Auth 340; no inferir B; no nueva candidata/rama/PR/workflow; no Auth/Firestore writes hasta recovery PASS + nueva autorización; no deletes/deploy/merge/producción.

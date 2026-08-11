# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md`;
3. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json`;
4. `.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json`;
5. `backend/contracts/c6-staff-repair-bootstrap-exact-write-v1.json`;
6. `tools/release/cxorbia-c6-staff-repair-bootstrap-exact-write.mjs`;
7. `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`;
8. `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`;
9. `backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json`;
10. `backend/config/c6-staff-provider-collision-targets-v1.json` + `backend/config/c6-staff-bootstrap-targets-v1.json`;
11. `app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-STATIC-PASS-PREWRITE-READY-20260811.md`;
12. `backend/contracts/c6-live-user-admin-v1.json` + `backend/runtime/hr-live-service/user-admin.mjs`;
13. `app/docs/SOURCE-LOCK-C6-HR-LIVE-DIRECT-READ-PASS-20260811.md` y su evidencia;
14. freeze Auth rector y source locks cerrados de Activation, SKIP13, MultiAuth, HashConfig y direct runner;
15. `CAMBIOS-BACKEND.md`;
16. `RESUMEN-PARA-CLAUDE.md`;
17. `PENDIENTES-PROTOTIPO.md`;
18. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

Toda fuente previa que presente el exact write como pendiente de autorización queda superseded por el STOP terminal del request consumido.

## 2. Estado rector

```text
AuthUsersFrozenBaseline=228
Activation/Readback/Rollback=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=PASS
DirectRunnerDEV=PASS
HRSourceLive=true
M4=COMPLETE 5/5
M5=4/8 COMPLETE
M6=COMPLETE 5/5
StaffProviderSnapshot=PASS run 31518927950
FrozenAuthWriteBudget=14
FrozenFirestoreWriteBudget=16
ExactWriteRequest=c6-staff-repair-bootstrap-exact-write-20260811-01 CONSUMED
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

## 3. Causa raíz y estado seguro

El request autorizado llegó hasta validación de contrato, carga privada de service account y descifrado protegido en memoria. Se detuvo antes del primer write porque el runtime no pudo resolver una referencia exacta de `visibleLogin` para B contra el digest técnico congelado. El digest SHA-256 no es reversible y no se permite inferir o sustituir la identidad.

El STOP demuestra:

```text
AuthCreates=0
CustomClaimsWrites=0
AuthDisables=0
FirestoreUserWrites=0
FirestoreAuditWrites=0
AuthDeletes=0
FirestoreDeletes=0
HR/Rules/Storage/Make/Gemini/Payments writes=0
Deploy=0
Merge=false
Production=false
```

R4 Cliente canónico, A, los ocho históricos y el baseline permanecen sin mutación por este request.

## 4. Progreso estable

**Avance certificado: 84%. Restante: 16%.** M5 permanece 4/8 porque no hubo ejecución provider efectiva.

## 5. Pendiente exacto

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

Recuperar/validar los owner-target visible-login inputs exactos desde fuentes privadas ya existentes, sin provider writes ni PII emitida y sin cambiar owners, roles, scopes o digests. Solo con A-D resueltos exactamente podrá prepararse una nueva autorización de exact write.

## 6. Circuit breaker anti-bucle

- no reejecutar el request consumido;
- no repetir snapshot provider `31518927950`;
- no reabrir M1-M4, M6, Auth 340, SKIP13, MultiAuth, HR o static gate;
- no inferir B por rol/nombre/coincidencia aproximada;
- no crear login sustituto ni hardcode;
- no nueva candidata/rama/PR/workflow;
- no Auth/Firestore writes hasta recuperación privada PASS + nueva autorización explícita;
- no deletes/deploy/merge/producción.

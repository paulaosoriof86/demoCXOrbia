# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Baseline preservado

Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, DirectRunnerDEV, M4, HR M6, live-user-admin static PASS y provider snapshot PASS siguen cerrados. No reabrir.

## Archivos creados/tocados en este bloque

```text
backend/contracts/c6-staff-repair-bootstrap-exact-write-v1.json
tools/release/cxorbia-c6-staff-repair-bootstrap-exact-write.mjs
.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json
.github/workflows/cxorbia-corte6-auth-rbac-activation.yml
app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json
app/docs/SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md
```

Se reutilizó el workflow existente; no se creó workflow, rama, PR ni candidata nueva.

## Source self-test

Antes de habilitar el request se ejecutó un self-test source-only con cero provider writes:

```text
runId=31534430007
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_SOURCE_PREFLIGHT
```

## Exact write autorizado — STOP pre-write

```text
requestId=c6-staff-repair-bootstrap-exact-write-20260811-01
requestCommit=ac82cfc4a74d70dbedb8ab099bd430a6e5c372b7
runId=31534505451
jobId=93922274430
decision=STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE
blocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
credentialPrivacyPass=true
identityResolutionPass=false
providerStatePass=false
```

El executor verificó contrato, budget, snapshot authority, service account privada y descifrado protegido en memoria. Se detuvo antes del primer provider write porque las fuentes privadas permitidas no aportaron una coincidencia exacta para el `visibleLogin` de B contra el digest congelado.

## Seguridad y writes reales

```text
AuthCreates=0
CustomClaimsWrites=0
AuthDisables=0
AuthWritesTotal=0
TenantUserWrites=0
AuditLogWrites=0
FirestoreWritesTotal=0
AuthDeletes=0
FirestoreDeletes=0
HRWrites=0
RulesWrites=0
StorageWrites=0
MakeWrites=0
GeminiCalls=0
PaymentsWrites=0
Deploy=0
Merge=false
Production=false
```

No se persistieron ni exportaron login, password, password hash, UID o nombre crudo. A, R4 canónico y los ocho históricos permanecen sin mutación.

## Causa raíz

El modelo source-safe anterior redujo los owner target logins a SHA-256 no reversibles. El write real necesita `visibleLogin` para materializar el tenant user doc y requiere resolución exacta antes del write boundary. Para B no existe actualmente una referencia privada accesible al executor que reproduzca el digest. No es un drift de Auth/HR/Firestore ni un fallo del snapshot.

## Métrica estable

```text
M1 35 COMPLETE
M2 20 COMPLETE
M3 15 COMPLETE
M4  5 COMPLETE
M5  4/8 COMPLETE
M6  5 COMPLETE
M7  0/5
M8  0/3
M9  0/3
M10 0/1
```

**Avance certificado: 84%. Restante: 16%.** No se acredita M5 adicional porque no hubo write provider efectivo.

## Siguiente acción exacta

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

Primero recuperar/validar A-D desde fuentes privadas ya existentes sin provider writes ni PII emitida. El request consumido no se reejecuta. Una nueva autorización de exact write solo se prepara si la recuperación termina PASS.

## Clasificación

- **Reusable CXOrbia:** fail-closed pre-write, digest one-way y recuperación privada controlada.
- **Exclusivo TyA:** target B y presupuesto focal C6.
- **Claude/prototipo:** sin cambios UI; wiring sigue bloqueado.
- **Academia:** impacto conceptual de privacidad y trazabilidad.
- **Sin impacto Claude:** executor/request/evidence técnicos.

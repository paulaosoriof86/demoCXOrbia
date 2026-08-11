# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Baseline preservado

Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, DirectRunnerDEV, M4, HR M6, live-user-admin static PASS y provider snapshot PASS siguen cerrados.

## Archivos creados/tocados en este bloque

```text
backend/contracts/c6-staff-repair-bootstrap-exact-write-v1.json
tools/release/cxorbia-c6-staff-repair-bootstrap-exact-write.mjs
.github/cxorbia-firebase-requests/c6-staff-repair-bootstrap-exact-write.json
.github/workflows/cxorbia-corte6-auth-rbac-activation.yml
app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json
app/docs/SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md
app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md
app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md
RESUMEN-PARA-CLAUDE.md
PENDIENTES-PROTOTIPO.md
app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md
app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md
app/docs/ACADEMIA-ADDENDUM-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md
```

Se reutilizó el workflow existente; no se creó workflow, rama, PR ni candidata nueva.

## Self-test y exact write

Self-test source-only previo:

```text
runId=31534430007
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_SOURCE_PREFLIGHT
providerWrite=0
```

Ejecución autorizada:

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

El executor pasó contrato, budget, snapshot authority, service account privada y descifrado protegido en memoria, pero se detuvo antes del primer provider write porque no encontró una coincidencia exacta para el `visibleLogin` de B dentro de las fuentes privadas permitidas.

## Writes reales

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

No se persistieron ni exportaron login/password/hash/UID/nombre crudos. A, R4 canónico y los ocho históricos permanecen sin mutación.

## Causa raíz

Los owner-target logins quedaron deliberadamente como digests SHA-256 source-safe. El write real necesita el `visibleLogin` exacto, pero la fuente cifrada histórica + documentos vivos accesibles al executor no resolvieron B. SHA-256 no es reversible. No es drift de Auth, HR, Firestore ni del snapshot.

## Métrica

**84% certificado; 16% restante. M5=4/8.** No se suma progreso por un STOP pre-write.

## Siguiente acción exacta

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

No reejecutar el request consumido ni repetir provider snapshot. Recuperar/validar A-D desde fuentes privadas existentes sin provider writes; solo con PASS podrá prepararse nueva autorización exact-write.

## Clasificación

- **Reusable CXOrbia:** fail-closed, digest one-way, separación source-safe/dato operativo recuperable.
- **Exclusivo TyA:** target B y budget C6.
- **Claude/prototipo:** sin cambios UI; wiring pendiente.
- **Academia:** lección conceptual documentada.
- **Sin impacto Claude:** executor/request/evidence.

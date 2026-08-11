# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Baseline preservado

Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, DirectRunnerDEV, M4, HR M6, live-user-admin static PASS y provider snapshot PASS siguen cerrados.

## Bloque exact-write

Se materializaron contrato, executor y request exactos, y se reutilizó el workflow existente. No se creó workflow/rama/PR/candidata.

```text
sourceSelfTestRunId=31534430007
sourceSelfTest=PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_SOURCE_PREFLIGHT
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

El executor se detuvo antes del primer provider write porque las fuentes privadas permitidas no aportaron una coincidencia exacta para el `visibleLogin` de B contra el digest congelado.

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
HR/Rules/Storage/Make/Gemini/Payments writes=0
Deploy=0
Merge=false
Production=false
```

A, R4 canónico y los ocho históricos permanecen sin mutación. No se persistió ni exportó PII/credencial cruda.

## Causa raíz

Los owner-target logins quedaron como SHA-256 source-safe. El write necesita el `visibleLogin` exacto y las fuentes privadas accesibles no resolvieron B. SHA-256 no es reversible. No es drift de Auth/HR/Firestore/snapshot.

## Métrica y siguiente acción

**84% certificado; 16% restante. M5=4/8.**

Siguiente bloque: `C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`. No reejecutar el request consumido ni repetir provider snapshot. Nueva autorización exact-write solo después de recovery PASS.

## Clasificación

- **Reusable CXOrbia:** fail-closed, digest one-way, separación source-safe/dato operativo recuperable.
- **Exclusivo TyA:** target B y budget C6.
- **Claude/prototipo:** sin cambios UI; wiring pendiente.
- **Academia:** lección conceptual documentada.
- **Sin impacto Claude:** executor/request/evidence.

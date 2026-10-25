# CAMBIOS BACKEND — Addendum C6 Auth Activation DEV prewrite

## Estado

`C6_AUTH_FINAL_PLAN_340_HOLD0_MATERIALIZED__AUTH_ACTIVATION_PREWRITE_STOP_RETRY_PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE__ZERO_AUTH_WRITES__NO_PRODUCTION`

## Cambios source-only

- `backend/config/c6-shopper-auth-final-freeze-v2.json`: freeze final adjudicado 340/340, HOLD=0, digest `68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3`.
- `backend/contracts/c6-auth-activation-dev-v1.json`: contrato de PREWRITE, snapshot cifrado, límites de writes, readback y rollback dry-run.
- `tools/qa/cxorbia-c6-auth-activation-dev.mjs`: executor fail-closed; permanece como fuente, sin request ejecutable.
- `backend/config/c6-auth-activation-dev-request-v1.json`: request consumido/deshabilitado después de STOP_RETRY.
- `.github/workflows/cxorbia-c6-auth-activation-dev-once.yml`: workflow one-shot creado para la ejecución y retirado después del run.
- `app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json`: evidencia terminal source-safe.
- `app/docs/SOURCE-LOCK-C6-AUTH-ACTIVATION-DEV-PREWRITE-PASSWORD-ROLLBACK-STOP-RETRY-20260807.md`: source lock vigente.

## Ejecución

```text
runId=31213274602
jobId=92980855907
artifactId=9007517428
artifactDigest=sha256:cc0c5b60cb066930d6d1e55a3eb23fcf6ed3e99f98c14500a1901969ba7b25ee
```

El plan final source-safe se materializó correctamente con `81 CREATE / 46 UPDATE / 81 NO_OP / 0 HOLD / 132 PRESERVE_NO_AUTH`.

PREWRITE detuvo antes de cualquier write por:

`PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd`.

Ese perfil es `UPDATE_AUTH` con cambios de email/password/claims. El contrato exigía hash+salt previo para las 14 actualizaciones de password; no se permitió degradar a compensación parcial.

## Seguridad

```text
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
Firestore/membership/HR/Rules/Storage writes=0
deploys=0
merge=false
production=false
```

No hubo segundo provider attempt.

## Clasificación

- **Reusable CXOrbia:** prewrite de reversibilidad de password y snapshot cifrado antes de write.
- **Exclusivo TyA:** fingerprints, adjudicación keeper/duplicate y plan 340.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** evidencia de fail-close y reversibilidad antes de migración de identidad.
- **Sin impacto Claude:** `CX.data`, HR, módulos y portales preservados.

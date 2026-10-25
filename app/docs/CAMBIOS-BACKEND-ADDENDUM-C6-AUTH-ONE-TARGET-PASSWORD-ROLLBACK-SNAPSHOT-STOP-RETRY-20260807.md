# CAMBIOS BACKEND — Addendum C6 one-target password rollback snapshot read-only

**Fecha:** 2026-08-07  
**Resultado:** `STOP_RETRY` seguro, cero writes.

## Archivos creados/tocados

- `tools/qa/cxorbia-c6-auth-one-target-password-rollback-snapshot-readonly.mjs`: resolver y snapshot read-only focal, con evidencia sanitizada y cifrado AES-256-GCM si el target queda resuelto.
- `.github/workflows/cxorbia-c6-auth-one-target-password-rollback-snapshot-readonly.yml`: workflow one-shot; eliminado tras la ejecución.
- `backend/config/c6-auth-one-target-password-rollback-snapshot-readonly-request-v1.json`: request consumido/deshabilitado.
- `app/docs/evidence/C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`: evidencia terminal source-safe.
- `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`: source lock vigente de este bloque.

## Evidencia

```text
runId=31219919183
jobId=93001987641
artifactId=9009957173
artifactDigest=sha256:22711a12987af5be8731ed82f70c96b1f78fa539c82196f8cd3ea72113168352
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_RESOLUTION_COUNT_0
providerReadCalls=1
hashConfigReads=0
providerWrites=0
AuthWrites=0
FirestoreReads=0
HRReads=0
```

## Causa raíz actualizada

El target no pudo ligarse a un Auth record mediante `customClaims.shopperId` actual. Esto no prueba ausencia de hash/salt; prueba que los claims actuales no son ancla suficiente porque el mismo row congelado tiene `changes.claims=true`.

## Preservación

No se tocó frontend, `CX.data`, HR, visitas, shoppers, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Academia ni producción. El contrato PREWRITE no se relajó.

## Clasificación

- Reusable CXOrbia: separar target-binding de captura de hash/salt.
- Exclusivo cliente: target fingerprint TyA.
- Claude/prototipo: sin cambios.
- Academia: patrón de fail-close y rollback reversible.
- Sin impacto Claude: todo el cambio es backend/gate interno.

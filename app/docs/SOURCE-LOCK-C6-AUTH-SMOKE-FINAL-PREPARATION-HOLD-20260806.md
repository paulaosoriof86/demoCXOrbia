# SOURCE LOCK — C6 preparación final Auth y smoke

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_AUTH_PLAN_340_FREEZE_PASS__IDEMPOTENCY_PASS__SMOKE_MATRIX_PREPARED__SKIPPED_ACCESS_RISK_HOLD__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Alcance autorizado

Bloque exclusivamente source-only sobre el HEAD inicial exacto:

```text
sourceHead=df65bb45629588b7906b957551108a3a5c71b763
authorizationId=chat-20260806-c6-auth-smoke-final-source-only-01
productionStrategy=PROMOTE_EXISTING_CLEAN_PROJECT
```

No se autorizaron provider/HR/Firestore/Auth/Rules/Storage writes, deploy, merge ni cutover.

## 2. Plan Auth congelado

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
emailChanges=39
passwordChanges=14
claimsChanges=38
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

El freeze se liga criptográficamente al artifact provider existente:

```text
providerRunId=31104541809
artifactId=8968941587
artifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
```

No se copiaron las 340 filas ni PII al repositorio. El freeze usa digest, conteos y lineage source-safe.

## 3. SKIP13 preservado

Los 13 fingerprints permanecen bajo:

```text
SKIP_AUTH_REPAIR_PRESERVE_HISTORY
doNotCreateAuth=true
doNotUpdateAuth=true
doNotDeleteAuthByThisPlan=true
futureManualReactivationAllowed=true
```

Visitas, certificaciones, liquidaciones e historia no se modifican.

## 4. Snapshot y rollback preparados

Manifest:

```text
backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json
```

Incluye:

- snapshot previo obligatorio de cuentas objetivo y memberships;
- colisiones de email/UID como circuit breakers;
- rollback diferenciado para CREATE_AUTH, UPDATE_AUTH y membership;
- journal append-only;
- prohibición de cambios de contraseña cuando hash/salt no pueda capturarse y restaurarse de forma autorizada;
- datos sensibles fuera del repositorio y cifrados.

Estado actual: `PREPARED_NOT_EXECUTABLE`.

## 5. Gate pre-write idempotente

```text
tool=tools/qa/cxorbia-c6-auth-smoke-final-preparation-source-only.mjs
nodeCheck=PASS
exitCode=2 esperado fail-closed
failedChecks=0
planFreeze=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
idempotencyKey=d3b2cbade967281a42b77fbdb2a6e87801e92c45223ef361003fafdf081148f6
```

## 6. Hallazgo de acceso omitido

La condición «ninguna identidad omitida tiene acceso efectivo no previsto» no puede declararse PASS source-only.

```text
skippedProfiles=13
surnameResidualProfiles=12
multiAuthResidualProfiles=1
blockingFingerprint=7cc28c78de9bfda01d14
providerCandidates=2
enabledCandidates=2
emailVerifiedCandidates=2
unplannedEffectiveAccessProvenAbsent=false
```

Por ello el dictamen correcto es:

```text
HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED
```

No se ejecutará Auth mientras no exista una adjudicación read-only, acotada a los 13 omitidos, que confirme memberships, claims y acceso efectivo; especialmente para el fingerprint bloqueante.

## 7. Matriz acumulativa de smoke

Se preparó la matriz para:

- Admin/Operaciones;
- Shopper;
- Cliente.

Está ligada a `PROMOTE_EXISTING_CLEAN_PROJECT`, al digest Auth y a `cxorbia-backend-dev`. Incluye tres recargas, nueva pestaña, aislamiento por rol, consistencia de `tenantId/projectId`, misma `sourceRevision`, ausencia de duplicados, preservación histórica y UTF-8. Estado: `PREPARED_NOT_EXECUTED`.

## 8. HR v4

El request `ac2032ec224e6d56bf087788b949691b6690c437` continúa sin evidencia terminal reconciliada. No hubo segundo trigger y este bloque no hizo lectura provider.

## 9. Archivos y commits

```text
freeze=844f8045d2166d963961a562beda14f814f0c863
rollback=374c62636fa13f5cf23f9ac7d6a4cf4ce47f1587
smoke=1d44bb9278599b8571ce92516824b5eab3fc5899
gate=d04e2de8efaaabd4e0b945f4c0d9055086dea3e1
evidence=8435371a6ec7ed40b57b605748c05150fbbc5b4a
```

## 10. Clasificación

- **Reusable CXOrbia:** freeze criptográfico, idempotencia, snapshot/rollback y smoke multirol.
- **Exclusivo TyA:** plan Shopper de 340 filas y adjudicación de los 13 omitidos.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** patrón de gate estructural PASS con HOLD de seguridad operacional.
- **Sin impacto Claude:** `/app/modules`, `/app/core`, `CX.data`, Finanzas, Portales y Reservas preservados.

## 11. Estado seguro

```text
providerReads=0
providerWrites=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

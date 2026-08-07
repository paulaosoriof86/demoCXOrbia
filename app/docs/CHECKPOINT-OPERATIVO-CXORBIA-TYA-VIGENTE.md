# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_RESOLVER_STOP_RETRY_CREDENTIAL_LOGIN_ANCHOR_MISSING__340_SHOPPER_DOC_READS__ZERO_AUTH_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
- producción: intacta;
- request ejecutable: ninguno;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Direct runner DEV

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. Identidad Shopper y plan Auth preservados

SKIP13 permanece cerrado `13/13`. El único par multi-Auth simétrico sigue adjudicado:

```text
profileFingerprint=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

Plan Auth final:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
onePrimaryOperationPerProfile=true
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

Lineage rector:

```text
sourceRun=31104541809
sourceArtifact=8968941587
sourceArtifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
sourcePlanDigest=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
```

## 4. PREWRITE Auth anterior

```text
runId=31213274602
jobId=92980855907
artifactId=9007517428
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
writeBoundaryEntered=false
providerWriteCalls=0
```

El PREWRITE no ejecutó ninguna de las 81 altas ni 46 actualizaciones y no deshabilitó el duplicado adjudicado.

## 5. Root fix password source-only

```text
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
legacyImportAlgorithm=SHA256
legacyImportRounds=1
legacyImportPerUserSaltField=false
saltlessLegacyImportIsValidSourceContract=true
PASS_HERMETIC_SELFTEST
contractMutationAllowed=false
```

El root fix probó que salt vacío puede ser válido para el lineage histórico, pero no ligó source-only el password actual del target a un hash recuperable exacto.

## 6. One-target password rollback snapshot anterior

```text
runId=31219919183
jobId=93001987641
artifactId=9009957173
artifactDigest=sha256:22711a12987af5be8731ed82f70c96b1f78fa539c82196f8cd3ea72113168352
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_RESOLUTION_COUNT_0
authDirectoryPagesRead=1
hashConfigReads=0
FirestoreReads=0
HRReads=0
```

Ese intento demostró que los claims actuales no pueden ser el único ancla porque el target tiene `changes.claims=true`.

## 7. One-target resolver + password snapshot — bloque actual

Autorización: reproducir únicamente las anclas técnicas mínimas usadas por el PREWRITE, exigir candidate exacto y solo después inspeccionar hash/salt/hashConfig.

### 7.1 Incidencias source-only previas

```text
runId=31221442188
failure=STATIC_GATE_FALSE_POSITIVE_MAP_SET
providerReads=0
providerWrites=0

runId=31221635160
failure=REQUEST_SCHEMA_MISMATCH_BEFORE_PROVIDER_READ
providerReads=0
providerWrites=0
```

Ambas fueron corregidas y fail-closed antes del primer provider read; no constituyen segundo provider attempt.

### 7.2 Ejecución terminal

```text
requestId=c6-auth-one-target-resolver-password-snapshot-readonly-20260807-03
requestCommit=e8ae0e7cf55c1e74da0550ce4fe00ee54d7cdac8
runId=31221947755
jobId=93008217242
artifactId=9010690763
artifactDigest=sha256:9d875485492c403500e8345d73e3d6f864a4aaf458e2bc702da92404f47a40e1
workflowConclusion=success
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_CREDENTIAL_LOGIN_ANCHOR_MISSING
```

### 7.3 Lecturas consumidas

```text
shopperIndexQueries=1
shopperDocumentsRead=340
authDirectoryPages=0
hashConfigReads=0
HRReads=0
secondProviderAttempt=false
```

El índice shopper sí resolvió exactamente el profile fingerprint `ac93d90d9e41512acdcd` dentro de 340 documentos. No hubo drift de población.

El bloqueo apareció después: technical/legacy keys y campos de login allowlisted del profile no enlazaron un credential login en el bundle cifrado. El flujo se detuvo en ese punto por la regla de resolución exacta.

Por ello no se evaluó:

```text
authCandidateCountDetermined=false
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
providerHashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

Esto **no significa que no exista Auth/hash/salt**. Significa que las anclas mínimas autorizadas no alcanzaron para enlazar el profile al Auth candidate.

## 8. Fail-close actual

```text
workflowRemovalCommit=358c0bc3f363b5081daaf6e04e6e4a7f582146df
requestConsumeCommit=6019659a61668dfdcf08f31d0da8ecca60bfce3f
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

No queda ejecución one-shot latente.

## 9. Contrato PREWRITE

`backend/contracts/c6-auth-activation-dev-v1.json` permanece sin relajación funcional. El hard stop de rollback exacto sigue activo. No se ejecutó Auth Activation ni rollback real.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 11. Siguiente cadena exacta

1. **Source-only primero:** extraer de matrices/evidencias ya versionadas y del resolver PREWRITE qué fuentes concretas sustentaron `multi_source_full_name_consensus` para `ac93d90d9e41512acdcd`; demostrar qué ancla permite reconstruir `baseLoginFp=493f2b26360648693c37` sin PII y sin provider.
2. Solo si esa lineage exige provider, pedir autorización nueva para una lectura focal de esas fuentes mínimas. No repetir el provider attempt consumido de este bloque.
3. Exigir `candidateCount=1` y cero asociación con otro row.
4. Solo entonces leer hash/salt/hashConfig y construir snapshot cifrado reversible.
5. Con PASS de reversibilidad exacta, volver directamente a PREWRITE + Auth Activation DEV one-shot.
6. Readback integral y rollback dry-run.
7. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
8. Validación humana.
9. Cutover/promoción con autorización expresa.

No volver a abrir SKIP13, el empate multi-Auth ni el plan final 340/HOLD0.

## 12. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
shopperIndexQueriesThisBlock=1
shopperDocumentsReadThisBlock=340
AuthDirectoryPagesThisBlock=0
hashConfigReadsThisBlock=0
HRReadsThisBlock=0
providerWrites=0
AuthWrites=0
passwordChangesApplied=0
duplicateAccessRetired=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```

No se exportó UID, email, login, password, hash, salt ni PII.

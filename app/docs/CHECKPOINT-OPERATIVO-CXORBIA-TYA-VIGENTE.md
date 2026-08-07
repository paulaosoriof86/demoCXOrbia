# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_STOP_RETRY_TARGET_AUTH_UNRESOLVED_BY_FROZEN_CLAIMS__ONE_PROVIDER_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
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

El intento Auth Activation DEV ya consumido se detuvo antes de writes:

```text
runId=31213274602
jobId=92980855907
artifactId=9007517428
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
writeBoundaryEntered=false
providerWriteCalls=0
```

## 5. Root fix password source-only

El bloque source-only estableció que el legado tiene un contrato criptográfico SHA256/1 sin salt por usuario, por lo que salt vacío puede ser legítimo. No pudo, sin provider, demostrar que el estado password actual del target corresponda a un hash recuperable exacto.

```text
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
PASS_HERMETIC_SELFTEST
contractMutationAllowed=false
```

## 6. One-target password rollback snapshot read-only

Autorización focal consumida:

```text
requestId=c6-auth-one-target-password-rollback-snapshot-readonly-20260807-01
requestCommit=7c020b03b2ed113ac05c0ed1a626af85d6840f96
runId=31219919183
jobId=93001987641
artifactId=9009957173
artifactDigest=sha256:22711a12987af5be8731ed82f70c96b1f78fa539c82196f8cd3ea72113168352
workflowConclusion=success
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_RESOLUTION_COUNT_0
```

Pasaron:

```text
exactRequestGate=PASS
staticNoWriteNoFirestoreHRGate=PASS
frozenSourcePlanDownload=PASS
canonicalDevCredentialGate=PASS
sourceSafeEvidenceGate=PASS
zeroWriteGate=PASS
```

## 7. Hallazgo raíz actual

El target `ac93d90d9e41512acdcd` está congelado como:

```text
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
```

El resolver de este bloque intentó ligar el Auth actual usando exclusivamente `customClaims.shopperId` → profile fingerprint y obtuvo:

```text
resolvedTargetCount=0
```

La conclusión correcta es que **los claims actuales no son un ancla suficiente para localizar este Auth target**. No puede exigirse que un claim actual ya tenga el valor canónico cuando precisamente `changes.claims=true`.

El bloque se detuvo allí. Por eso todavía no se evaluó:

```text
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
hashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

Esto no equivale a afirmar que hash o salt no existen.

## 8. Lecturas y límites

```text
authDirectoryPagesRead=1
providerReadCalls=1
targetRecordsRetained=0
hashConfigReads=0
FirestoreReads=0
HRReads=0
secondProviderAttempt=0
```

No se realizó un segundo intento provider porque la autorización exigía STOP_RETRY si no podía demostrarse restauración exacta.

Durante los commits documentales posteriores se observó el workflow histórico de adjudicación SKIP13 en modo **non-request event**. Su run `31220197716` saltó claim, credencial y ejecución provider; por tanto no reabrió SKIP13 ni consumió provider reads/writes. Se registra para trazabilidad y no se cuenta como segundo provider attempt.

## 9. Fail-close

```text
workflowRemovalCommit=132ec6cdf6451fe0b4dfc62c794d9001482874b1
requestConsumeCommit=1a3119c681c4323dbff0730208db4680938b1f10
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

No queda ejecución one-shot latente.

## 10. Contrato PREWRITE

`backend/contracts/c6-auth-activation-dev-v1.json` permanece sin relajación funcional. El hard stop de rollback exacto sigue activo. No se ejecutó Auth Activation ni rollback real.

## 11. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 12. Siguiente cadena exacta

1. Bajo **autorización separada**, ejecutar un resolver read-only focal para `ac93d90d9e41512acdcd` que reproduzca únicamente las anclas técnicas mínimas ya usadas por el PREWRITE anterior y obtenga exactamente un Auth candidate. No usar claims actuales como único ancla.
2. Exigir `candidateCount=1` y verificar que el candidate no quede ambiguamente asociado a otro row antes de tocar hash/salt.
3. Solo entonces leer ese único Auth target para `passwordHash`, distinguir salt vacío/nulo vs no expuesto y leer hash config; crear snapshot cifrado reversible sin exportar valores.
4. Solo con PASS de reversibilidad exacta: nuevo request de PREWRITE + Auth Activation DEV one-shot.
5. Readback integral y rollback dry-run.
6. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
7. Validación humana.
8. Cutover/promoción con autorización expresa.

No volver a abrir SKIP13, el empate multi-Auth ni el plan final 340/HOLD0.

## 13. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
providerReadCallsThisBlock=1
hashConfigReadsThisBlock=0
providerWrites=0
AuthWrites=0
passwordChangesApplied=0
duplicateAccessRetired=0
FirestoreReads=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRReads=0
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

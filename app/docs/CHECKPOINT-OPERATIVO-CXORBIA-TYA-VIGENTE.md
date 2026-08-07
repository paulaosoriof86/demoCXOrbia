# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__PASSWORD_ROLLBACK_ROOTFIX_SOURCE_ONLY_STOP_RETRY_TARGET_PRIOR_PASSWORD_NOT_PROVEN__ZERO_PROVIDER_READS_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
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

## 3. Identidad y plan Auth preservados

SKIP13 está cerrado `13/13`. El único par multi-Auth simétrico permanece adjudicado:

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

## 4. PREWRITE Auth anterior

```text
runId=31213274602
jobId=92980855907
artifactId=9007517428
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
```

Ese intento se detuvo antes de cualquier write.

## 5. Root fix password source-only ejecutado

Autorización limitada al profile fingerprint `ac93d90d9e41512acdcd`, usando solo fuentes técnicas cifradas/versionadas y lineage congelada.

Gate terminal:

```text
requestId=c6-auth-password-rollback-rootfix-source-only-20260807-02
requestCommit=6253ae7a3473146af3d26962abf03d79954408dd
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
workflowConclusion=success
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
```

Pasaron:

```text
exactRequestGate=PASS
staticNoProviderGate=PASS
sourcePlanDigestGate=PASS
PASS_HERMETIC_SELFTEST
PASS_STOP_RETRY_CONTRACT_UNMODIFIED
```

## 6. Hallazgo raíz

La migración legacy sí tiene un contrato criptográfico verificable:

```text
algorithm=SHA256
rounds=1
perUserPasswordSaltField=false
saltlessLegacyImportIsValidSourceContract=true
```

Por lo tanto, un `passwordSalt` vacío puede ser legítimo en ese lineage y no debe interpretarse automáticamente como error.

Pero el problema decisivo es otro: las fuentes source-only existentes **no demuestran** que el estado password actual de `ac93d90d9e41512acdcd` sea ese hash legacy recuperable.

Lineage source-safe del target:

```text
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
sourceSafeSurnameBasis=multi_source_full_name_consensus
suffixApplied=true
sameVisibleBaseLoginProfiles=2
peerUniqueTechnicalHolderProven=true
priorRollback=restore_email_disabled_and_claims_snapshot_password_compensation_only
```

Resultado:

```text
sourceSafeTargetCredentialBindingProven=false
currentPriorPasswordStateProven=false
exactRollbackReconstructible=false
contractMutationAllowed=false
```

No existe snapshot PREWRITE anterior porque el intento Auth se detuvo antes del write boundary.

## 7. Contrato PREWRITE

`backend/contracts/c6-auth-activation-dev-v1.json` **no fue relajado ni modificado funcionalmente**.

Blob SHA vigente:

```text
2e4457cfc8e847143bbebab879dbed2d816fa43a
```

El hard stop de rollback exacto sigue activo.

## 8. Incidencia source-only y fail-close

El primer intento del harness terminó antes de decisión por un typo:

```text
runId=31217471430
jobId=92994249732
failure=SOURCE_REFERENCE_ERROR_BEFORE_DECISION
providerReads=0
providerWrites=0
AuthWrites=0
contractMutation=false
```

Fue corregido dentro del mismo bloque autorizado y se ejecutó el request v2 trazable, sin provider.

Fail-close final:

```text
workflowRemovalCommit=8adb6837efc18af6ab7564d75e222e0d66d2a5b7
requestV1Enabled=false
requestV1Consumed=true
requestV2Enabled=false
requestV2Consumed=true
allowedExecutions=0
workflowPresent=false
```

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 10. Siguiente cadena exacta

1. **C6 AUTH ONE-TARGET PASSWORD ROLLBACK SNAPSHOT read-only**, bajo autorización separada, limitado al profile fingerprint `ac93d90d9e41512acdcd`: leer exclusivamente el Auth target necesario para distinguir `passwordHash` disponible, `passwordSalt` vacío/nulo vs no expuesto y configuración efectiva de hash/restauración; preparar evidencia sanitizada de capacidad de snapshot cifrado. Cero writes.
2. Solo si ese gate demuestra reversibilidad exacta: preparar un request **nuevo** de PREWRITE + Auth Activation DEV. No reutilizar requests anteriores.
3. Ejecutar Auth una sola vez con snapshot completo, readback integral y rollback dry-run.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción con autorización expresa.

Si el provider no permite obtener el hash actual ni con el permiso apropiado, la única alternativa será una autorización explícita separada del tenant para relajar el rollback exacto únicamente para ese target. No se permite compensación silenciosa.

No volver a abrir SKIP13, el empate multi-Auth ni el plan final 340/HOLD0.

## 11. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
providerReadsThisRootFix=0
AuthReadsThisRootFix=0
FirestoreReadsThisRootFix=0
HRReadsThisRootFix=0
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

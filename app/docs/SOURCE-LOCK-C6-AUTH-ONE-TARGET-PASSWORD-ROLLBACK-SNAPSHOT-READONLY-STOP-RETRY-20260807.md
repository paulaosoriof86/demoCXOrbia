# SOURCE LOCK — C6 AUTH ONE-TARGET PASSWORD ROLLBACK SNAPSHOT READ-ONLY — STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_STOP_RETRY_TARGET_AUTH_UNRESOLVED_BY_FROZEN_CLAIMS__ONE_PROVIDER_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- Firebase DEV: `cxorbia-backend-dev`;
- target único: profile fingerprint `ac93d90d9e41512acdcd`;
- Auth ejecutado: no;
- producción: intacta.

## 2. Plan Auth preservado

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
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

SKIP13 sigue cerrado `13/13`. La adjudicación multi-Auth sigue cerrada. No se reabrió ninguna de esas decisiones.

## 3. Autorización aplicada

Se autorizó una sola lectura focal para:

1. resolver el Auth target del fingerprint `ac93d90d9e41512acdcd` desde la lineage congelada;
2. solo si quedaba ligado a un único Auth, inspeccionar disponibilidad de `passwordHash`;
3. distinguir `passwordSalt` vacío/nulo legítimo versus no expuesto;
4. leer la configuración efectiva de hash;
5. validar un snapshot cifrado reversible sin exportar valores sensibles.

Cero Auth/provider/Firestore/HR writes, cero deploys y cero producción.

## 4. Ejecución terminal

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

Todos los pasos técnicos del workflow terminaron `success`. `STOP_RETRY` es la decisión contractual por no poder demostrar reversibilidad exacta dentro del alcance autorizado.

## 5. Lecturas realmente consumidas

```text
authDirectoryPagesRead=1
providerReadCalls=1
targetRecordsRetained=0
hashConfigReads=0
FirestoreReads=0
HRReads=0
secondProviderAttempt=0
```

El gate se detuvo antes de leer hash config o capturar un snapshot.

## 6. Hallazgo raíz del bloque

El resolver focal utilizó el único vínculo que podía reconstruirse sin Firestore/HR: `customClaims.shopperId` actual → fingerprint del profile congelado.

Resultado:

```text
resolvedTargetCount=0
```

Esto **no demuestra** que `passwordHash` o `passwordSalt` estén ausentes. Demuestra que los claims actuales no son un ancla suficiente para este target. Esa conclusión es coherente con el plan congelado del mismo perfil:

```text
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
```

Precisamente porque `claims=true`, no es correcto exigir que el claim actual ya contenga el `shopperId` canónico que se pretende establecer en la actualización.

## 7. Qué no pudo evaluarse

Al no existir un Auth target focal inequívoco dentro del scope autorizado:

```text
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
hashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

No se debe convertir esta ausencia de evaluación en una afirmación de hash inexistente.

## 8. Contrato PREWRITE

`backend/contracts/c6-auth-activation-dev-v1.json` permanece sin relajación. Sigue vigente el hard stop de rollback exacto para los password changes. Este bloque no autorizó ni ejecutó Auth Activation.

## 9. Fail-close

```text
workflowRemovalCommit=132ec6cdf6451fe0b4dfc62c794d9001482874b1
requestConsumeCommit=1a3119c681c4323dbff0730208db4680938b1f10
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondProviderAttempt=0
```

No queda request ejecutable ni workflow one-shot latente.

## 10. Estado seguro

```text
providerReadCalls=1
providerWrites=0
AuthWrites=0
FirestoreReads=0
FirestoreWrites=0
HRReads=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```

No se exportó UID, email, login, password, passwordHash, passwordSalt ni PII en evidencia/logs.

## 11. Bloqueo real y siguiente gate

El bloqueo cambió de `password rollback source-only no probado` a una causa más precisa:

```text
TARGET_AUTH_RESOLUTION_COUNT_0
```

La siguiente autorización, si se decide continuar, debe permitir un **resolver read-only focal** que reproduzca únicamente las anclas mínimas ya usadas por el PREWRITE anterior para ligar este profile a exactamente un Auth candidate. Solo después de `candidateCount=1` puede releerse ese único Auth target para hash/salt/config y producir el snapshot cifrado.

No se autoriza repetir este request ni ampliar silenciosamente a Firestore/HR/provider.

## 12. Clasificación

- **Reusable CXOrbia:** resolver de rollback debe separar `target binding` de `hash availability`; claims futuros no pueden ser el único ancla del estado actual.
- **Exclusivo cliente:** fingerprint `ac93d90d9e41512acdcd` y lineage TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** documentar fail-close, identidad actual vs claims objetivo y snapshot reversible.
- **Sin impacto Claude:** ejecución Auth y producción continúan bloqueadas.

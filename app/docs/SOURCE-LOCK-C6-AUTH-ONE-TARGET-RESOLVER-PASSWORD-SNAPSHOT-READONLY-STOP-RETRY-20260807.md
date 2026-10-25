# SOURCE LOCK — C6 AUTH ONE-TARGET RESOLVER + PASSWORD SNAPSHOT READ-ONLY — STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_RESOLVER_STOP_RETRY_CREDENTIAL_LOGIN_ANCHOR_MISSING__340_SHOPPER_DOC_READS__ZERO_AUTH_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- target: `cxorbia-backend-dev`;
- profile fingerprint único: `ac93d90d9e41512acdcd`;
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

SKIP13 permanece cerrado `13/13`; la adjudicación multi-Auth permanece cerrada y no fue reabierta.

## 3. Intentos source previos dentro del mismo bloque

Antes del primer provider read existieron dos fallos puramente source/integration:

```text
run 31221442188 / job 93006699781
failure=STATIC_GATE_FALSE_POSITIVE_MAP_SET
providerReads=0
providerWrites=0

run 31221635160 / job 93007284992
failure=REQUEST_SCHEMA_MISMATCH_BEFORE_PROVIDER_READ
providerReads=0
providerWrites=0
```

Ambos quedaron fail-closed y no cuentan como segundo provider attempt porque nunca cruzaron provider.

## 4. Ejecución terminal

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

## 5. Qué sí resolvió

La lectura de índice shopper resolvió exactamente el profile fingerprint objetivo dentro de una población de 340 documentos técnicos.

```text
shopperIndexQueries=1
shopperDocumentsRead=340
profileFingerprintResolved=true
```

No hubo drift de población.

## 6. Dónde se detuvo

El resolver intentó reproducir las anclas técnicas mínimas del PREWRITE sin usar claims actuales como único selector. Para el profile objetivo:

- los technical/legacy keys allowlisted del documento shopper no encontraron un credential login correspondiente en el bundle cifrado;
- los campos de login allowlisted del profile tampoco produjeron un credential login utilizable;
- por contrato, sin ese vínculo no podía abrirse una página Auth para buscar candidato por correo interno derivado ni inspeccionarse hash/salt.

Resultado:

```text
credentialLoginAnchorFound=false
authCandidateCountDetermined=false
authDirectoryPages=0
hashConfigReads=0
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
providerHashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

Este resultado **no demuestra ausencia de Auth, passwordHash o passwordSalt**. Demuestra que el subconjunto mínimo de anclas autorizado no alcanzó para ligar el profile a su Auth candidate.

## 7. Lecturas y seguridad

```text
shopperIndexQueries=1
shopperDocumentsRead=340
authDirectoryPages=0
hashConfigReads=0
HRReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
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
secondProviderAttempt=false
```

No se exportó UID, email, login, password, hash, salt ni PII.

## 8. Fail-close

```text
workflowRemovalCommit=358c0bc3f363b5081daaf6e04e6e4a7f582146df
requestConsumeCommit=6019659a61668dfdcf08f31d0da8ecca60bfce3f
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

No queda request ejecutable ni workflow one-shot latente.

## 9. Contrato PREWRITE

`backend/contracts/c6-auth-activation-dev-v1.json` permanece sin relajación. El hard stop de rollback exacto sigue vigente y Auth Activation DEV continúa sin ejecutarse.

## 10. Pendiente real

El siguiente bloque requiere autorización nueva porque este bloque ya consumió su único provider attempt. Debe ampliar **solo lo mínimo indispensable** para reconstruir la identidad canónica que el PREWRITE anterior obtenía por `multi_source_full_name_consensus`, preferiblemente reutilizando evidencia versionada antes de tocar provider.

La ruta segura es:

1. source-only: identificar exactamente qué fuentes técnicas sustentaron `multi_source_full_name_consensus` para este profile y qué ancla permite reconstruir `baseLoginFp=493f2b26360648693c37` sin PII;
2. solo después, si hace falta, un nuevo read-only focal y explícitamente autorizado para esas fuentes mínimas;
3. exigir `candidateCount=1` y cero asociación con otro row;
4. recién entonces inspeccionar hash/salt/hashConfig y construir snapshot cifrado;
5. con PASS de rollback exacto, regresar directamente a PREWRITE + Auth Activation DEV.

No volver a abrir SKIP13, adjudicación multi-Auth ni el plan final 340/HOLD0.

## 11. Clasificación

- **Reusable CXOrbia:** fail-close por ausencia de ancla técnica y separación resolver→hash snapshot.
- **Exclusivo cliente:** fingerprint objetivo y lineage TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de identidad source-safe y rollback verificable.
- **Sin impacto Claude:** Auth/producción continúan bloqueados hasta resolver rollback.

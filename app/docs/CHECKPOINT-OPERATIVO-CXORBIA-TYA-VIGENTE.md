# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_7_UNIQUE_CANONICAL_AUTH__1_DUPLICATE_EFFECTIVE_PAIR_UNRESOLVED_KEEPER__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.md`;
- producción: intacta;
- request ejecutable: ninguno;
- Auth ejecutado: no.

## 2. Direct runner DEV

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 provider V2 preservado

La lectura provider previa quedó cerrada en 13/13 resueltos, 8 perfiles con 9 candidatos Auth efectivos y cero writes. No existe autorización provider residual ni segundo attempt.

## 4. Reconciliación source-only ejecutada

```text
requestId=c6-skip13-access-reconciliation-source-only-20260807-01
requestCommit=a73ad38d7007077837404b4e3a370828551effde
runId=31197299766
jobId=92928580367
artifactId=9001336549
artifactDigest=sha256:e3aa1169e33b97e34639542fd9a2ca6dfa6f8f72372479e24b784c1106b42480
evidenceDigest=sha256:3c9babccf8f2dd736c6ba7efdcd21e67be42a8b6bbea98d1c2b76b2a7d2e2d03
decision=STOP_RETRY_C6_SKIP13_ACCESS_RECONCILIATION_MULTI_AUTH_KEEPER_UNRESOLVED
```

Todos los checks del validador source-only pasaron.

## 5. Clasificación

Siete perfiles efectivos tienen un único candidato Auth ligado por `shopperId` exacto y scope shopper `tya/cinepolis`; quedan reconciliados como identidad canónica vigente y preservación del Auth existente, sin repair:

```text
cc941934f90032aa48e8 -> fa84ea99678c2b2f5953
9ed0cdabf3794b7ccf21 -> bc5b358c6883a46ef4e2
80d716626b85e14778ea -> ff65430db1848288c596
8aea97650e97902f7616 -> 8e80a0b286283139ff2e
540c9e6b71440b393365 -> cc52fe65814c6b9ae201
c01e0f344901f03e78d2 -> 63cb1df5e624217df319
729eb0480d5ec2266a20 -> 26c355c7cabb98038038
```

No se demostró ningún alias histórico ni candidato concreto cuyo acceso deba retirarse entre esos siete.

Perfil especial:

```text
profileFingerprint=7cc28c78de9bfda01d14
candidateA=4e6d26551d11db444bd0
candidateB=9b2b7ca1bd72c1301d29
classification=IDENTIDAD_DUPLICADA
keeper=null
accessToRetire=null
```

Ambos candidatos son efectivos y las fuentes source-safe continúan empatadas. No es válido seleccionar por creationTime, ordinal, first-returned, enabled o emailVerified. Esto activa STOP_RETRY.

## 6. Freeze y overlay

Freeze original preservado e inmutable:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
AuthExecuted=false
```

Overlay provisional no superpuesto:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=80
HOLD=1
PRESERVE_NO_AUTH=132
onePrimaryOperationPerProfile=true
targetHoldZeroSatisfied=false
executable=false
```

No se produjo un plan final HOLD=0 porque la identidad especial no es resoluble con las fuentes autorizadas.

## 7. Fail-close

```text
requestConsumeCommit=b56f372171d23fc7d06089d371ab4fa0b5dd90da
workflowRemovalCommit=a4df8983ab8f07504c939ab34f7361a96a04d649
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 9. Siguiente cadena exacta

1. Resolver con una autorización distinta el discriminador keeper vs acceso a retirar para los candidatos `4e6d26551d11db444bd0` y `9b2b7ca1bd72c1301d29`.
2. Regenerar/congelar plan Auth final 340/340 no superpuesto y HOLD=0.
3. Autorizar Auth con snapshot/rollback.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

## 10. Estado seguro

```text
providerReadsThisBlock=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```

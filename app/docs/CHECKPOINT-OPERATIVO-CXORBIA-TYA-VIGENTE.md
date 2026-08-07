# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_HOLD_FINGERPRINT_NAMESPACE_MISMATCH__ZERO_AUTH_MEMBERSHIP_READS__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-SKIP13-FINGERPRINT-NAMESPACE-MISMATCH-STOP-RETRY-20260807.md`;
- request direct runner ejecutable: ninguno;
- request SKIP13 ejecutable: ninguno;
- Auth ejecutado: no.

## 2. Direct trusted runner DEV — PASS

```text
service=cxorbia-c6-direct-runner-dev
region=us-central1
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
deployDecision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
revision=cxorbia-c6-direct-runner-dev-00001-2vz
private=true
runtime=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 read-only — terminal HOLD

```text
requestId=c6-skip13-auth-access-adjudication-20260807-06
requestCommit=313597f561315ff9f8c75c5a7be741a8cbac5d70
runId=31188368926
jobId=92898589212
artifactId=8997714548
artifactDigest=sha256:9dd0cee0aa205071fa82afb22f69d0cdf29b54d9d8d4b2f6462c58c22fd1e30d
decision=HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR
error=all_skip13_profile_ids_resolved:0
```

El baseline leído fue exactamente 340 shopper document IDs, pero 0/13 fingerprints coincidieron.

## 4. Lecturas consumidas

```text
profileIdIndexQueries=1
shopperIdIndexBaseline=340
authListPages=0
membershipPointReads=0
membershipFieldQueries=0
hrReads=0
providerWrites=0
```

No se alcanzaron Auth, claims ni memberships. No hubo writes.

## 5. Causa raíz demostrada

El plan determinístico produce:

```text
profileFp = fp('deterministic-suffix-plan-profile', profile.id)
```

El adjudicador intentó resolver los mismos fingerprints con:

```text
stableMemberFingerprint(profileId)
namespace=shopper-collision-member-v1
```

La segunda función corresponde a member provenance de grupos del universo equivalente. Los namespaces son válidos individualmente pero no interoperables.

Además el contrato SKIP13 no fija explícitamente `profileFingerprintNamespace`, permitiendo el error de integración.

## 6. Fail-close

```text
failCloseCommit=3966dac8a42404f35245c474f975f696c9cb9f0e
requestEnabled=false
requestConsumed=true
allowedExecutions=0
secondProviderAttempt=false
```

El workflow generado por el commit de fail-close (`runId=31188638266`) clasificó el evento como no ejecutable y saltó claim, credential preparation y adjudication.

## 7. Auth congelado

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
AuthExecuted=false
```

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 9. Siguiente cadena exacta

1. Autorizar root-fix source-only del namespace SKIP13.
2. Corregir el adjudicador para usar `deterministic-suffix-plan-profile` y declarar namespaces en contrato.
3. Ejecutar self-test estático cross-namespace sin provider.
4. Solo con PASS, autorizar una única nueva adjudicación SKIP13 read-only.
5. Con SKIP13 cerrado, ejecutar Auth sobre el plan congelado de 340 filas con snapshot/rollback.
6. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
7. Validación humana.
8. Cutover/promoción autorizada a producción.

## 10. Estado seguro

```text
DirectRunnerDEV=PASS
SKIP13 shopper-id index queries=1
SKIP13 Auth reads=0
SKIP13 claims reads=0
SKIP13 membership reads=0
HR reads=0
provider writes=0
Auth writes=0
HR writes=0
Firestore writes=0
Rules writes=0
Storage writes=0
additional Cloud Builds=0
additional Cloud Run deploys=0
Hosting deploys=0
merge=false
production=false
providerBoundaryEnabled=false
```

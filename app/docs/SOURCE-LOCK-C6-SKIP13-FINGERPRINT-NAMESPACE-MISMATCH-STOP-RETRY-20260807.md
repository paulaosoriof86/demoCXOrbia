# SOURCE LOCK — C6 SKIP13 fingerprint namespace mismatch STOP_RETRY

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_HOLD_FINGERPRINT_NAMESPACE_MISMATCH__ZERO_AUTH_MEMBERSHIP_READS__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Bloque autorizado

```text
requestId=c6-skip13-auth-access-adjudication-20260807-06
requestCommit=313597f561315ff9f8c75c5a7be741a8cbac5d70
targetParent=e3bbdfe3911afba73643383edf5c5b12bb854faf
allowedExecutions=1
mode=READ_ONLY
profiles=13
blockingProfileFingerprint=7cc28c78de9bfda01d14
```

## 2. Evidencia terminal

```text
runId=31188368926
jobId=92898589212
artifactId=8997714548
artifactDigest=sha256:9dd0cee0aa205071fa82afb22f69d0cdf29b54d9d8d4b2f6462c58c22fd1e30d
decision=HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR
error=all_skip13_profile_ids_resolved:0
```

## 3. Lecturas realmente consumidas

```text
profileIdIndexQueries=1
shopperIdIndexBaseline=340
resolvedSkip13Profiles=0
authListPages=0
membershipPointReads=0
membershipFieldQueries=0
hrReads=0
```

La ejecución se detuvo después de leer únicamente los IDs técnicos de los 340 shopper docs. No alcanzó Auth, claims ni memberships.

## 4. Causa raíz

Los fingerprints SKIP13 congelados corresponden al `profileFp` del plan determinístico:

```text
fp('deterministic-suffix-plan-profile', profile.id)
```

El adjudicador intentó resolverlos con:

```text
stableMemberFingerprint(profileId)
namespace=shopper-collision-member-v1
```

Ese namespace pertenece a member provenance de grupos y no es equivalente al namespace del plan Auth.

El caso multi-Auth también demuestra namespaces distintos para la misma persona técnica:

```text
SKIP13/plan profileFp=7cc28c78de9bfda01d14
provider multiAuth profileFp=d15356ed735e87a33e69
candidate fingerprints=9b2b7ca1bd72c1301d29,4e6d26551d11db444bd0
```

## 5. STOP_RETRY

```text
failCloseCommit=3966dac8a42404f35245c474f975f696c9cb9f0e
requestEnabled=false
requestConsumed=true
allowedExecutions=0
secondProviderAttempt=false
```

El workflow disparado por el commit de fail-close (`runId=31188638266`) clasificó el evento como no-request/no-executable y saltó claim, credential preparation y adjudication. No hubo segunda lectura provider.

## 6. Direct runner preservado

```text
directRunnerDecision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

No se redeployó ni modificó el runner.

## 7. Auth preservado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
AuthExecuted=false
```

## 8. Próximo gate permitido

Antes de cualquier nueva lectura provider:

1. root-fix source-only del namespace de `profileFp` SKIP13 a `deterministic-suffix-plan-profile`;
2. declarar namespaces en el contrato de adjudicación;
3. self-test estático que impida mezclar `deterministic-suffix-plan-profile`, `multi-auth-profile-v1` y `shopper-collision-member-v1`;
4. solo después, nueva autorización para una única adjudicación SKIP13 read-only.

## 9. Estado seguro

```text
provider shopper-id index queries=1
Auth reads=0
claims reads=0
membership reads=0
HR reads=0
provider writes=0
Auth writes=0
Firestore writes=0
Rules writes=0
Storage writes=0
HR writes=0
Cloud Build=0
Cloud Run deploy=0
Hosting deploy=0
merge=false
production=false
```

## 10. Clasificación

- **Reusable CXOrbia:** namespace contracts y prevención de cross-namespace identity matching.
- **Exclusivo TyA:** conjunto SKIP13 y plan Auth congelado.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** trazabilidad criptográfica y separación semántica de fingerprints.
- **Sin impacto Claude:** UI/rutas/módulos preservados.

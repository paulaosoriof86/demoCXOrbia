# SOURCE LOCK — C6 SKIP13 root-fix source-gate self-test harness HOLD

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_ROOT_FIX_SOURCE_GATE_HOLD_SELFTEST_OUTPUT_CONTAMINATION__NO_PROVIDER_ATTEMPT__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Autorización

Bloque autorizado: root-fix source-only del namespace SKIP13 y, únicamente con PASS estático, una sola revalidación provider read-only.

La condición de entrada al provider NO se cumplió.

## 2. Cambios source-only materializados antes del gate

```text
contractV2=backend/contracts/c6-skip13-auth-access-adjudication-v2.json
adjudicatorV2=tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs
workflowV2=.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.yml
```

El contrato v2 declara explícitamente:

```text
profileFingerprintNamespace=deterministic-suffix-plan-profile
authCandidateFingerprintNamespace=shopper-auth-candidate-v1
memberProvenanceFingerprintNamespace=shopper-collision-member-v1
multiAuthProfileFingerprintNamespace=multi-auth-profile-v1
crossNamespaceEqualityAllowed=false
```

El adjudicador v2 usa `stablePlanProfileFingerprint(doc.id)` para resolver perfiles SKIP13 y no usa `shopper-collision-member-v1` como join key de perfiles.

## 3. Source gate terminal

```text
runId=31190357507
jobId=92905316953
head=1e693386d097c1fa90c61d0a013c06c3be941563
providerAttempt=false
```

Pasó:

```text
checkout exact PR head=PASS
Node setup=PASS
node --check adjudicator v2=PASS
```

Falló antes de cualquier provider read en `Static namespace root-fix gate`.

### Causa exacta

El adjudicador v2 importó estáticamente `stableAuthCandidateFingerprint` desde `cxorbia-c6-shopper-equivalent-universe.mjs`. Al ejecutar:

```text
node tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs --self-test
```

el argumento global `--self-test` también fue observado por el módulo importado, cuyo bloque module-level imprimió primero:

```text
PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC
```

El workflow esperaba JSON puro en `/tmp/skip13-self-test.json`; al intentar `JSON.parse`, falló con:

```text
SyntaxError: Unexpected token 'P', "PASS_C6_EQ"... is not valid JSON
```

Clasificación:

```text
failureClassification=SOURCE_GATE_SELFTEST_OUTPUT_CONTAMINATION_FROM_IMPORTED_MODULE_ARGV
namespaceRootFixFinalPass=false
```

Esto es un defecto del harness de self-test, no evidencia de provider drift ni de un nuevo problema en los 13 perfiles.

## 4. STOP_RETRY y fail-close

Por autorización expresa, un fallo source activa STOP_RETRY.

Por lo tanto:

```text
v2RequestCreated=false
providerCredentialPrepared=false
providerAttempt=false
shopperIdReads=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
providerWrites=0
secondProviderAttempt=false
```

El workflow v2 fue retirado para evitar ejecución tardía:

```text
workflowRemovalCommit=e269347c8305c6ff60ad182aa6190c9c94abfe62
workflowPresent=false
```

No existe `backend/config/c6-skip13-auth-access-adjudication-request-v2.json`; por tanto no existe autorización provider residual.

## 5. Estado previo preservado

Direct runner DEV permanece PASS:

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

Auth congelado permanece:

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

## 6. Próximo gate permitido

Requiere nueva autorización source-only para corregir exclusivamente el harness de self-test sin provider:

1. eliminar el side effect argv entre módulos;
2. mantener namespaces v2 ya declarados;
3. ejecutar `node --check` y self-test cross-namespace con salida determinística;
4. validar el contrato v2 y el join `stablePlanProfileFingerprint(doc.id)`;
5. detenerse con PASS source-only.

Solo una autorización posterior distinta puede crear un nuevo request provider read-only SKIP13.

## 7. Estado seguro

```text
DirectRunnerDEV=PASS
sourceGatePass=false
providerAttempt=false
providerReads=0
providerWrites=0
AuthWrites=0
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

## 8. Clasificación

- **Reusable CXOrbia:** contrato explícito de namespaces y prevención de joins cross-namespace.
- **Exclusivo TyA:** conjunto SKIP13 y fingerprint congelado del plan Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** side effects de argv en módulos importados y gates fail-closed.
- **Sin impacto Claude:** UI/rutas/módulos preservados.

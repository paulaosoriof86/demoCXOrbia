# SOURCE LOCK — C6 SKIP13 self-test harness root-fix source-only PASS

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_NAMESPACE_ROOT_FIX_PASS__SELFTEST_HARNESS_PASS__NO_PROVIDER_ATTEMPT__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Alcance autorizado

Corregir exclusivamente el side effect de `--self-test` entre:

```text
tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs
tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs
```

Sin provider/Auth/claims/membership/HR reads, writes, deploy, Cloud Build, Cloud Run, Hosting, merge ni producción.

## 2. Root-fix materializado

```text
file=tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs
commit=02bbca9371c2736a7ed993be6361eb1b84bfd0bf
blobSha=2055ed250c9fe1058759f582089fe112b84b9a06
```

El módulo ahora ejecuta su CLI self-test únicamente cuando es el módulo principal:

```text
isMainModule && process.argv.includes('--self-test')
```

Un módulo importado ya no reacciona a un `--self-test` perteneciente al proceso llamador.

## 3. Contrato de namespaces preservado

```text
profileFingerprintNamespace=deterministic-suffix-plan-profile
authCandidateFingerprintNamespace=shopper-auth-candidate-v1
memberProvenanceFingerprintNamespace=shopper-collision-member-v1
multiAuthProfileFingerprintNamespace=multi-auth-profile-v1
crossNamespaceEqualityAllowed=false
forbiddenProfileJoinNamespaces=shopper-collision-member-v1,multi-auth-profile-v1
```

Fuentes preservadas:

```text
adjudicatorV2 blob=b93e01198200a1133dcaf78a9515be8556222392
contractV2 blob=3348cb1c694ca76d1fce7e3134013f6d0edc20fa
```

El adjudicador continúa resolviendo perfiles con:

```text
stablePlanProfileFingerprint(doc.id)
```

y no usa `stableMemberFingerprint(doc.id)` como join de perfiles SKIP13.

## 4. Gates ejecutados

Ejecución hermética source-only, sin red ni credenciales provider:

```text
equivalentUniverseSyntax=PASS
directSelfTest=PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC
foreignSelfTestArgvImportOutputBytes=0
crossNamespaceSelfTest=PASS_C6_SKIP13_FINGERPRINT_NAMESPACE_SELF_TEST
plannerAlgorithmExact=true
profileVsMemberSeparated=true
profileVsMultiAuthSeparated=true
memberVsMultiAuthSeparated=true
authCandidateNamespaceExact=true
allFingerprintsTwentyHex=true
```

El adjudicador v2 no cambió respecto del source gate inmediatamente anterior, donde `node --check` había pasado antes del fallo de contaminación de stdout.

Evidencia:

```text
app/docs/evidence/C6-SKIP13-SELFTEST-HARNESS-ROOT-FIX-SOURCE-ONLY-PASS-20260807.json
```

## 5. Workflow temporal

Se creó un workflow estrictamente source-only, sin secretos ni comandos provider, para intentar evidencia observable del gate. El conector disponible no permite enumerar runs disparados por `push`, por lo que no se afirma un PASS de ese workflow. Fue retirado al cerrar el bloque:

```text
workflowRemovalCommit=c465cab01292d599a03c038e8de5486aecaff943
workflowPresent=false
```

La decisión PASS se basa en la ejecución hermética terminal registrada, no en una inferencia sobre GitHub Actions.

## 6. Estado seguro

```text
providerReads=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
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

Direct runner DEV sigue PASS y sin cambios. El plan Auth de 340 filas continúa congelado y no ejecutado.

## 7. Siguiente gate permitido

El root-fix source-only queda cerrado en PASS. La siguiente operación requiere autorización distinta: una única revalidación provider SKIP13 read-only usando el contrato/adjudicador v2 ya corregidos.

## 8. Clasificación

- **Reusable CXOrbia:** main-module guard para CLI self-tests y prevención de contaminación argv entre módulos ESM.
- **Exclusivo TyA:** conjunto SKIP13 y fingerprints congelados.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** aislamiento de harness, namespaces criptográficos y fail-close.
- **Sin impacto Claude:** UI, rutas y módulos preservados.

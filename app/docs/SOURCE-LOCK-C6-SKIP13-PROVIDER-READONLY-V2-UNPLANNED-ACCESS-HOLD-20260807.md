# SOURCE LOCK — C6 SKIP13 provider read-only V2 / unplanned effective access HOLD

**Fecha:** 2026-08-07  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 abierto, draft, sin merge  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_13_OF_13_RESOLVED__8_PROFILES_9_EFFECTIVE_AUTH_CANDIDATES__STOP_RETRY__AUTH_PLAN_FROZEN__NO_WRITES__NO_PRODUCTION`

## 1. Autorización consumida

Una única revalidación SKIP13 provider read-only V2 sobre `cxorbia-backend-dev`, con contrato/adjudicador V2 corregidos, 13 fingerprints congelados y especial foco en `7cc28c78de9bfda01d14` y sus dos candidate fingerprints.

## 2. Ejecución terminal

```text
requestId=c6-skip13-auth-access-adjudication-v2-20260807-01
requestCommit=5e32b000816303132f1e47dc17a901e4aebf3cab
targetHead=47fcf4992b1d7708c037670e4df0a1ad70aa9f0d
runId=31194614899
jobId=92919661755
artifactId=9000260368
artifactDigest=sha256:05056323adb7a39df129fb3e7b498a331f0ef9ff9e8d9457614ac4294041d051
```

Pasaron checkout exacto, namespace/harness root gate, request-only source lock, claim único, request V2, credential target y resolución exacta `13/13`.

## 3. Decisión

```text
decision=HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND
profilesWithAuthCandidates=8
profilesWithUnplannedEffectiveAccess=8
authCandidates=9
effectiveProjectAccessCandidates=9
effectiveOwnShopperAccessCandidates=9
```

Los nueve candidatos efectivos observados cumplen:

```text
enabled=true
passwordProvider=true
tenantAllowed=true
projectAssigned=true
roleShopper=true
shopperIdExact=true
rulesProjectReadEffective=true
rulesOwnShopperEffective=true
```

Membership no es requisito para project read en el contrato vigente y los nueve candidatos observados no presentaron membership válido/presente.

## 4. Matriz source-safe

```text
cc941934f90032aa48e8 -> fa84ea99678c2b2f5953
9ed0cdabf3794b7ccf21 -> bc5b358c6883a46ef4e2
80d716626b85e14778ea -> ff65430db1848288c596
8aea97650e97902f7616 -> 8e80a0b286283139ff2e
540c9e6b71440b393365 -> cc52fe65814c6b9ae201
c01e0f344901f03e78d2 -> 63cb1df5e624217df319
729eb0480d5ec2266a20 -> 26c355c7cabb98038038
7cc28c78de9bfda01d14 -> 4e6d26551d11db444bd0, 9b2b7ca1bd72c1301d29
```

Sin candidato Auth emparejado/effective access demostrado:

```text
3451d618b5d6307b87da
32e2de62067ab6ecfb7b
b31bdc0c7514acbe25ba
4a59de15805804cbe398
cfbd0c519e59f40c6239
```

El perfil bloqueante resolvió exactamente `2/2` candidate fingerprints congelados y ambos tienen acceso efectivo own-shopper. No hubo drift del set bloqueante.

## 5. Lecturas consumidas

```text
profileIdIndexQueries=1
shopperProfileBaseline=340
authListPages=1
authUsersScanned=110
membershipPointReads=9
membershipFieldQueries=27
hrReads=0
```

No se exportaron raw UIDs, shopper IDs, emails, claims ni PII.

## 6. STOP_RETRY / fail-close

```text
secondProviderAttempt=false
requestDisableCommit=c6314294315757a971c2d31d31ac72f1dc3bcf13
failCloseNonProviderRunId=31194826915
failCloseNonProviderJobId=92920375094
failCloseProviderStepsSkipped=true
workflowRemovalCommit=a42008d5e0e9819dbdba7196071ca18a8c998d9c
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

El run disparado por el commit de fail-close ejecutó únicamente gates source-only; claim, credencial y adjudicación provider quedaron `skipped`.

## 7. Estado seguro

```text
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRReads=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```

Direct runner DEV permanece PASS y sin cambios. El plan Auth de 340 filas permanece congelado y no ejecutado.

## 8. Bloqueo real para Auth 340

No procede ejecutar Auth 340 mientras ocho perfiles SKIP13 conservan nueve candidatos con acceso efectivo TyA/Cinépolis, incluyendo dos candidatos efectivos para el fingerprint bloqueante.

El siguiente bloque debe ser source-only, usando exclusivamente freeze, matrices técnicas ya existentes y esta evidencia, para reconciliar cada uno de los ocho perfiles entre identidad canónica vigente, alias histórico, identidad duplicada o acceso que debe retirarse. No requiere una nueva lectura provider para iniciar esa reconciliación.

## 9. Clasificación

- **Reusable CXOrbia:** adjudicación criptográfica source-safe y detección de acceso efectivo por claims/reglas.
- **Exclusivo TyA:** 13 fingerprints SKIP13 y sus candidatos observados.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** least privilege, identity adjudication y fail-close ante acceso inesperado.
- **Sin impacto Claude:** UI, rutas y módulos preservados.

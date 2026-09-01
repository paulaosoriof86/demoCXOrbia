# DIAGNÓSTICO DE CAUSA RAÍZ — C6 ruta a producción

**Fecha:** 2026-08-07  
**Estado:** diagnóstico acumulativo con evidencia terminal.

## 1. Causa raíz principal ya cerrada — geometría de permisos incorrecta

La credencial conectada a GitHub es:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

La política IAM le asigna capacidades operativas amplias —entre otras `roles/run.admin`, `roles/cloudbuild.editor`, `roles/firebaseauth.admin`, `roles/iam.serviceAccountTokenCreator`, `roles/iam.serviceAccountUser` y `roles/artifactregistry.reader`— pero originalmente no tenía los permisos IAM de inventario/creación necesarios para cerrar el runtime aislado.

Esto produjo una secuencia repetitiva:

```text
Cloud Run/build capabilities present
+ IAM service-account create absent
+ IAM policy/key visibility absent
= deployment path advances until the next IAM boundary and then STOP_RETRY
```

Este bloqueo quedó cerrado con identidad runtime aislada, reviewer temporal revocado y deploy DEV terminal PASS.

## 2. Causa raíz secundaria ya mitigada — workflows one-shot efímeros

El PR es extremadamente acumulativo y dispara numerosas Actions históricas en cada cambio. La estrategia one-shot exigía distinguir el request exacto antes de cualquier provider access.

El patrón vigente usa:

```text
1. request-only commit exacto;
2. PR_HEAD_SHA=github.event.pull_request.head.sha;
3. detección exacta de parent/head/request-only;
4. claim durable previo al provider;
5. fail-close del request al terminar.
```

El direct runner DEV materializó y pasó con este patrón.

## 3. Causa ya corregida — SHA sintético del PR

El primer intento de direct runner comparó el source contra `GITHUB_SHA`, que para `pull_request` corresponde al ref/merge sintético. El contrato vigente usa exclusivamente:

```text
github.event.pull_request.head.sha
```

Ese problema no debe reaparecer.

## 4. Hallazgo de seguridad no bloqueante para el runtime

La credencial Firebase Admin SDK conserva roles amplios. El runtime nuevo, en cambio, quedó demostrado con:

```text
projectRoleCount=0
directServiceAccountBindingCount=0
userManagedKeyCount=0
```

La separación runtime/control-plane funciona. El hardening de la credencial Firebase Admin SDK sigue siendo deuda separada y no debe mezclarse con el cierre Phase A salvo P0 demostrado.

## 5. Direct runner — cerrado PASS

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runId=31186229092
cloudBuilds=1
cloudRunDeploys=1
private=true
authenticatedHealth=PASS
lease=PASS
idempotencyDuplicate409=PASS
providerBoundaryEnabled=false
```

No existe pendiente IAM ni de deploy para el runner técnico actual.

## 6. Nueva causa raíz demostrada — namespace incorrecto de fingerprints SKIP13

El run autorizado SKIP13:

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

La lectura inicial sí confirmó el baseline real:

```text
shopper_id_index_baseline=340
profileIdIndexQueries=1
resolvedSkip13Profiles=0
authListPages=0
membershipPointReads=0
membershipFieldQueries=0
hrReads=0
```

Por tanto no es ausencia de perfiles ni drift de población. El tool se detuvo antes de Auth/claims/memberships.

### Contrato de origen de los 13 fingerprints

Los 13 SKIP13 provienen del plan determinístico congelado. Ese planner genera cada `profileFp` así:

```text
fp('deterministic-suffix-plan-profile', profile.id)
```

El mismo planner genera el vector multi-Auth con otro namespace:

```text
fp('multi-auth-profile-v1', profile.id)
```

Y los candidatos Auth usan:

```text
shopper-auth-candidate-v1
```

Esto explica por qué el mismo caso multi-Auth aparece como:

```text
plan/SKIP13 profileFp=7cc28c78de9bfda01d14
provider multiAuth profileFingerprint=d15356ed735e87a33e69
candidateFingerprints=9b2b7ca1bd72c1301d29,4e6d26551d11db444bd0
```

### Defecto del adjudicador

`tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs` intenta resolver los 13 documentos usando:

```text
stableMemberFingerprint(profileId)
namespace=shopper-collision-member-v1
```

Ese namespace pertenece a la procedencia de miembros de grupos del universo equivalente, no al `profileFp` del plan de Auth. Consecuencia determinística: 0/13 coincidencias pese a existir exactamente 340 shopper IDs.

### Gap contractual adicional

`backend/contracts/c6-skip13-auth-access-adjudication-v1.json` limita correctamente dominios de lectura y escritura, pero no declara explícitamente el namespace del `profileFingerprint`. Esa omisión permitió que el adjudicador reutilizara un fingerprint técnicamente válido pero semánticamente distinto.

### Root fix requerido

Antes de otra lectura provider se debe corregir source-only:

```text
SKIP13 profile fingerprint namespace = deterministic-suffix-plan-profile
Auth candidate fingerprint namespace = shopper-auth-candidate-v1
collision member namespace = shopper-collision-member-v1  // NO usar para SKIP13 profileFp
```

El contrato debe declarar esos namespaces y el tool debe compartir la misma función/versionado del planner, con self-test que demuestre que no pueden cruzarse namespaces accidentalmente.

## 7. STOP_RETRY aplicado correctamente

Después del HOLD no hubo segundo intento provider. El request quedó consumido/deshabilitado:

```text
failCloseCommit=3966dac8a42404f35245c474f975f696c9cb9f0e
allowedExecutions=0
secondProviderAttempt=false
```

El workflow posterior generado por el commit de fail-close clasificó el evento como no ejecutable y saltó claim, credencial y adjudicación; por tanto no constituyó segunda lectura provider.

## 8. Conclusión

El atraso actual no corresponde a una regresión general del frontend ni del plan Auth. La infraestructura DEV del direct runner está cerrada PASS. El bloqueo vivo es ahora un defecto source-contractual focal en la traducción de fingerprints SKIP13.

Estado:

```text
direct runner DEV=PASS
runtime isolation=PASS
provider boundary runner=OFF
SKIP13 adjudication=HOLD_NAMESPACE_MISMATCH
SKIP13 shopper ID index reads=1
SKIP13 Auth/claims/membership reads=0
Auth execution=pending
production=cutover pending
```

La siguiente acción no debe ser otra lectura provider inmediata: primero root-fix source-only del namespace, gates estáticos y contrato; después, con autorización nueva, una única adjudicación SKIP13 read-only corregida.

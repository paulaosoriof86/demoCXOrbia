# SOURCE LOCK — C6 MULTI-AUTH FINAL DISCRIMINATOR READ-ONLY

**Fecha:** 2026-08-07  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_MULTI_AUTH_FINAL_DISCRIMINATOR_NO_UNIQUE_TECHNICAL_ANCHOR__TENANT_ADJUDICATION_REQUIRED__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Autorización consumida

Se ejecutó una única lectura focal Auth/custom claims sobre `cxorbia-backend-dev`, limitada al perfil:

```text
7cc28c78de9bfda01d14
```

y exclusivamente a los candidatos:

```text
4e6d26551d11db444bd0
9b2b7ca1bd72c1301d29
```

No se autorizaron Firestore, memberships, HR, visitas, certificaciones, liquidaciones, Storage ni credenciales legacy.

## 2. Evidencia terminal

```text
requestId=c6-multi-auth-final-discriminator-readonly-20260807-01
sourceHead=f6c18173c028a3f04e08c16b027a211ce8cbc526
requestCommit=1a2c2f95334ae1869d8ba8d7f665f31c080ad4e2
runId=31199988897
jobId=92937409808
artifactId=9002409950
artifactDigest=sha256:0387c7323cf16b50f8d0596fff7bb19bec4aba94e830b2d998761041f5d723e5
decision=STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TENANT_ADJUDICATION_REQUIRED
```

El workflow terminó técnicamente en success y el STOP_RETRY es una decisión de negocio/identidad, no un error de ejecución.

## 3. Resultado de los dos candidatos

Los dos candidatos siguen siendo técnicamente equivalentes bajo la evidencia autorizada:

```text
tenantAllowed=true
projectAssigned=true
roleShopper=true
passwordProvider=true
shopperIdPresent=true
shopperIdFingerprint=37eddd3b0db728c2b0b565b3
allowlistedClaims=projectId,projectIds,role,shopperId,tenantId
source/batch/migration/import markers=0
decisiveMatches=0
```

No se usaron `creationTime`, ordinal, primer resultado, `disabled/enabled` ni `emailVerified` como selectores.

No se exportaron UID, nombre, correo, contraseña, shopperId crudo ni claims crudos.

## 4. Conclusión de identidad

No existe en los atributos Auth/custom claims permitidos un marcador versionado de migración, source, batch o import que distinga de forma única a uno de los candidatos.

Por tanto:

```text
keeper=null
accessToRetire=null
decisiveCandidateCount=0
tenantAdjudicationRequired=true
```

Está prohibido inferir el keeper por diferencias no contractuales o por el orden de los candidatos.

## 5. Freeze y plan

El freeze Auth original permanece intacto y no ejecutado:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

La reconciliación operacional sigue provisionalmente:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=80
HOLD=1
PRESERVE_NO_AUTH=132
onePrimaryOperationPerProfile=true
finalPlanProduced=false
executable=false
```

No se fabricó un overlay final HOLD=0.

## 6. Fail-close

```text
requestConsumeCommit=f587489c0d025ab47085a1bc7074e7345d891f0b
workflowRemovalCommit=55c9777698594815ef18bb380a0f0fad79f6f4b8
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondAttempt=0
```

El workflow tuvo una corrección pre-ejecución en `f6c18173c028a3f04e08c16b027a211ce8cbc526`: se retiró un falso positivo del gate estático que confundía la verificación `legacyCredentials=false` con una lectura legacy. Antes de esa corrección no existía request ejecutable y no se consumió ninguna lectura provider.

## 7. Estado seguro

```text
Auth list pages=1
Auth users scanned only for candidate fingerprint=110
target candidates inspected=2
non-target attributes inspected=false
Firestore reads=0
membership reads=0
HR reads=0
Storage reads=0
legacy credential reads=0
provider writes=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
CloudBuild=0
CloudRun=0
Hosting=0
merge=false
production=false
```

## 8. Siguiente gate exacto

No repetir Auth/provider reads para este caso.

La siguiente acción válida es una **adjudicación explícita del tenant por candidate fingerprint únicamente**, escogiendo cuál de los dos candidatos debe conservarse como keeper. Solo esa decisión humana puede permitir materializar el overlay final 340/340 HOLD=0.

Incluso después de la adjudicación, cualquier retiro de acceso del duplicado y cualquier ejecución Auth requieren una autorización de write separada con snapshot, readback y rollback.

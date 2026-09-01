# SOURCE LOCK — C6 IAM read-only inventory / ADMIN_IDENTITY_CREATION_REQUIRED

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `C6_IAM_READONLY_PARTIAL_INVENTORY__ONLY_SYSTEM_DEFAULT_AND_FIREBASE_ADMIN_IDENTITIES__ADMIN_IDENTITY_CREATION_REQUIRED__NO_WRITES__NO_DEPLOY__STOP_RETRY`

## 1. Autorización

Paula autorizó un único bloque C6 IAM read-only sobre `cxorbia-backend-dev` para inventariar cuentas de servicio y bindings, sin crear, modificar ni eliminar identidades o permisos y sin deploy, provider reads, SKIP13, merge o producción.

## 2. Ejecución observable

```text
requestId=c6-iam-readonly-inventory-20260806-01
requestCommit=754e7ee1e8b81d27ad7f90dd8c4f4c594c411c02
parentCommit=7ac7ac10e968ae53800afdb4e9ea2fcf76f60d2e
runId=31133025584
jobId=92726136842
artifactId=8976819925
artifactDigest=sha256:f3e1330b6e5777317255389f1d5a330f94b85bf897093049ca22b06d01a5ea69
```

Pasaron:

```text
checkout exacto=PASS
request/source lock=PASS
claim único=PASS
Google Cloud authentication=PASS
gcloud setup=PASS
service account list=PASS
```

## 3. Inventario recuperado

La lista completa visible para el principal autenticado contiene exactamente dos cuentas:

### 3.1 Default Compute

```text
email=87461567267-compute@developer.gserviceaccount.com
uniqueId=111386648265978071009
disabled=false
classification=SYSTEM_DEFAULT_COMPUTE_IDENTITY_EXCLUDED
fingerprint=49e094a8f498fba2827c46785bc298557973959945434200c868b700afb3daf5
```

No se reutiliza porque es una identidad predeterminada de infraestructura y no cumple el aislamiento de runtime exigido.

### 3.2 Firebase Admin SDK

```text
email=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
uniqueId=115771268599010410289
disabled=false
classification=FIREBASE_ADMIN_SDK_IDENTITY_EXCLUDED
fingerprint=c9dd358bd886e96fb4b53f6edead9cc6a2c91d1c712ad70c21ebabcb55e58489
```

No se reutiliza porque pertenece explícitamente a Firebase Admin SDK y rompe el aislamiento frente a Firebase/Auth/Firestore/Storage.

## 4. Bindings no legibles

La lectura del IAM policy del proyecto fue rechazada:

```text
failureClassification=IAM_PERMISSION_DENIED_PROJECT_GET_IAM_POLICY
permission=resourcemanager.projects.getIamPolicy
principal=firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

Por ello no se completó el detalle de roles directos ni las IAM policies individuales.

## 5. Decisión

```text
decision=ADMIN_IDENTITY_CREATION_REQUIRED
candidateCount=0
```

La conclusión es determinística aunque los bindings no fueran legibles: las únicas dos identidades existentes están excluidas categóricamente por su tipo. No existe una identidad user-managed limpia que pueda reutilizarse para `cxorbia-c6-direct-runner-dev`.

Contrato de decisión:

```text
backend/contracts/c6-direct-runner-runtime-identity-decision-v1.json
```

La identidad requerida continúa siendo:

```text
cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Debe crearse mediante una identidad administrativa, sin roles de proyecto ni roles provider/Firebase/Auth/Firestore/Storage/HR/Cloud Build o administrativos.

## 6. Fail-close

```text
workflowRemovalCommit=7d7c33562f6cd6b2fde9a7677dd938139c5a9fe5
requestDisableCommit=a40fdf9c392c5c5eebf1f7337386ff348a247b57
workflowPresent=false
requestExecutable=false
allowedExecutions=0
secondAttempt=0
STOP_RETRY=true
```

## 7. Estado seguro

```text
iamControlPlaneReads=2
providerDataReads=0
iamWrites=0
deploys=0
providerWrites=0
SKIP13Executed=false
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
merge=0
production=false
```

## 8. Clasificación

- **Reusable CXOrbia:** inventario y exclusión segura de identidades default/Firebase; fingerprint técnico.
- **Exclusivo TyA:** dependencia del cierre C6 para SKIP13 y Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** least privilege, visibilidad IAM parcial y decisión determinística por tipo de identidad.
- **Sin impacto Claude:** UI, módulos, Portales, Finanzas, Reservas y Academia preservados.

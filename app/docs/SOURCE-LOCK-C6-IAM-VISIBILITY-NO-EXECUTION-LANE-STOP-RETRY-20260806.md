# SOURCE LOCK — C6 IAM visibility no execution lane / STOP_RETRY

**Fecha:** 2026-08-06  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` abierto, draft, sin merge  
**Estado:** `C6_RUNTIME_IDENTITY_EXISTS_ENABLED__IAM_VISIBILITY_EXECUTION_LANE_NOT_MATERIALIZED__ZERO_IAM_WRITES__DIRECT_RUNNER_NOT_DEPLOYED__STOP_RETRY`

## 1. Autorización

Paula autorizó un único bloque C6 IAM VISIBILITY DEV para conceder temporalmente `roles/iam.securityReviewer` a:

```text
firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com
```

con el único objetivo de verificar en modo read-only:

```text
cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
```

Máximo dos IAM writes autorizados: grant temporal y revoke inmediato. Cero deploy, provider reads, SKIP13, Auth, HR, Firestore, Rules, Storage, Hosting, Cloud Build, Cloud Run, merge o producción.

## 2. Preparación del carril

Se creó un workflow one-shot nuevo y no superpuesto:

```text
.github/workflows/cxorbia-c6-iam-visibility-temporary-security-reviewer-once-v1.yml
workflowCreateCommit=3a1bb800950e00ac5caa0482afa26d69429d7047
```

Se creó el request autorizado:

```text
backend/config/c6-iam-visibility-temporary-security-reviewer-request-v1.json
requestCreateCommit=6d14c9b4458f4b7a37efa77542f101d617b745b4
```

El primer trigger incluía `paths:`. Debido al tamaño acumulado del PR, se eliminó ese filtro antes de cualquier ejecución provider para evitar depender del filtrado de archivos del evento:

```text
workflowTriggerCorrectionCommit=338dd13d73920b372d005092afd2cce6375152d9
requestRearmCommit=891a6acedcd620abbf70c4fc55d11b716c22d4dd
```

## 3. Resultado observable

No se materializó un run del workflow C6 IAM Visibility para los commits del request. Las consultas de workflow runs del commit y los status contexts no mostraron el workflow/contexto esperado.

```text
workflowRunMaterialized=false
claimMaterialized=false
GoogleCloudAuthenticationReached=false
iamGrantAttempted=false
iamRevokeAttempted=false
iamWritesSucceeded=0
providerReads=0
providerWrites=0
deploys=0
```

No se atribuye causa raíz no demostrada. La clasificación segura es:

```text
GITHUB_ACTIONS_NEW_WORKFLOW_NOT_MATERIALIZED
```

## 4. Fail-close

Ante ausencia de carril observable se aplicó STOP_RETRY y se retiró el workflow temporal:

```text
workflowRemovalCommit=74ffa1c3049af2e79598b48ef6d3650c5bc6abb3
```

El request quedó consumido y deshabilitado:

```text
requestDisableCommit=2a3a08acce1b8d4ea57bedca9a70692e24c95910
enabled=false
consumed=true
allowedExecutions=0
allowedIamWrites=0
```

No se reutilizarán workflow ni request.

## 5. Estado de identidad runtime

Permanece confirmado por el bloque anterior:

```text
email=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
exists=true
enabled=true
uniqueId=112507526829412676643
```

Siguen sin demostrarse terminalmente:

```text
zeroUserManagedKeys
zeroDirectServiceAccountBindings
zeroProjectRoles
```

## 6. Bloqueo real

El principal GitHub disponible sigue sin tener las lecturas IAM requeridas, y el entorno conectado no dispone de una identidad administrativa demostrada que pueda aplicar de forma observable el grant temporal autorizado.

```text
decision=ADMINISTRATIVE_IAM_AUTHORITY_STILL_REQUIRED
```

No procede desplegar el direct runner hasta obtener PASS final de aislamiento.

## 7. Estado seguro

```text
newBranch=0
newPR=0
workflowPresent=false
requestExecutable=false
IAMWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
providerReads=0
providerWrites=0
Auth/HR/Firestore/Storage reads=0
Auth/HR/Firestore/Rules/Storage writes=0
SKIP13Executed=false
merge=0
production=false
```

## 8. Clasificación

- **Reusable CXOrbia:** fail-close cuando el carril de ejecución no materializa evidencia observable.
- **Exclusivo TyA:** cierre IAM previo al deploy C6.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** diferencia entre autorización, preparación source y ejecución efectiva observable.
- **Sin impacto Claude:** UI, módulos, Portales, Finanzas, Reservas y Academia preservados.

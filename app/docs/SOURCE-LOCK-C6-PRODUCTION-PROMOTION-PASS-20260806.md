# SOURCE LOCK — C6 promoción del proyecto limpio existente

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_PRODUCTION_PROMOTION_CONTRACT_PASS__EXISTING_CLEAN_PROJECT_ACCEPTED__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Autorización vigente

Paula autorizó expresamente:

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
acceptCurrentIdentifiersAndUrlAsProduction=true
```

La autorización permite materializar el contrato y ejecutar el gate source-only. No autoriza provider/HR/Firestore/Auth/Rules/Storage writes, deploy, merge ni cutover.

## 2. Contrato materializado

```text
path=backend/config/cxorbia-production-promotion-contract.json
commit=3197aa5056375ddcffd3a67836ba5cf55a91eede
blob=972943da9698c07ff3af21eca8a4c539433d8d2d
authorizationId=chat-20260806-promote-existing-clean-project-v1
authorizedAt=2026-08-06T13:39:00-06:00
```

El contrato conserva:

```text
legacyProjectReuseForBackend=false
writesAuthorizedByThisContract=false
deployAuthorizedByThisContract=false
mergeAuthorizedByThisContract=false
productionCutoverAuthorizedByThisContract=false
```

## 3. Gate source-only

```text
tool=tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
toolBlobSha=db42189a74e165c90c0dd13907c243702d9ba0b6
node --check=PASS
exitCode=0
decision=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
failedChecks=0
holdReason=null
```

Configuración validada:

```text
project=cxorbia-backend-dev
hostingTarget=cxorbia-dev
hostingSite=cxorbia-backend-dev
cloudRunService=cxorbia-live-hr-dev
region=us-central1
public=app
UTF-8=PASS
```

## 4. Advertencias aceptadas

Los identificadores técnicos conservan el sufijo `dev`. La autorización actual acepta expresamente esos identificadores y la URL vigente como producción futura. Esto no equivale a deploy ni cutover.

## 5. Gates aún pendientes

```text
LIVE_HR_CURRENT_PERIOD_AND_HISTORY_REVISION_PASS
SHOPPER_AUTH_REPAIR_PASS
ACCUMULATIVE_MULTIROLE_SMOKE_PASS
HUMAN_VALIDATION_PASS
ROLLBACK_READY
EXPLICIT_CUTOVER_AUTHORIZATION
```

El request HR v4 `ac2032ec...` permanece sin evidencia terminal reconciliada. No se emitió segundo trigger.

## 6. Clasificación

- **Reusable CXOrbia:** contrato explícito de promoción y gate source-only.
- **Exclusivo TyA:** promoción futura de `cxorbia-backend-dev` y gates operativos restantes.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** aceptación consciente de identificadores técnicos al promover un entorno limpio.
- **Sin impacto Claude:** frontend, `CX.data`, Login, Finanzas, Portales, Reservas y SKIP13 preservados.

## 7. Estado seguro

```text
provider reads=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

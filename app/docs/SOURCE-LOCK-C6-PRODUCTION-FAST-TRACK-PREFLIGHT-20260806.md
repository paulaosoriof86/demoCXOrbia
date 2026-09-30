# SOURCE LOCK — C6 fast-track de producción source-only

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PRODUCTION_STRATEGY_UNMATERIALIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo

No esperar pasivamente por el request HR v4. Se ejecutó un preflight paralelo source-only para identificar qué puede cerrarse de inmediato y qué decisión real falta antes del cutover.

## 2. Fuentes exactas revalidadas

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
- `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
- `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
- `firebase.json`;
- `.firebaserc`;
- PR #7 y HEAD vivo.

## 3. Estado HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
request modificado después de emisión=false
commit statuses observados=0
evidencia terminal=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
segundo trigger=0
```

No se emitió otro request ni se reabrió el diagnóstico de registro/trigger.

## 4. Configuración actual

La configuración versionada actual apunta al proyecto limpio vigente:

```text
.firebaserc default=cxorbia-backend-dev
.firebaserc alias dev=cxorbia-backend-dev
firebase hosting target=cxorbia-dev
hosting site=cxorbia-backend-dev
Cloud Run rewrite=cxorbia-live-hr-dev
region=us-central1
public=app
UTF-8=PASS
```

Esto prueba qué entorno está configurado, pero no decide por sí solo la estrategia de producción.

## 5. Gate source-only corregido y ejecutado

Se agregó y ajustó:

```text
tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
```

El gate no impone crear otro proyecto. Acepta exclusivamente una estrategia autorizada y materializada mediante contrato:

```text
PROMOTE_EXISTING_CLEAN_PROJECT
SEPARATE_CLEAN_PROD_PROJECT
```

En ambos casos prohíbe usar la base legacy como backend nuevo.

Resultado actual:

```text
node --check=PASS
execution exitCode=2 esperado fail-closed
decision=HOLD_PRODUCTION_STRATEGY_UNMATERIALIZED
holdReason=PRODUCTION_PROMOTION_STRATEGY_NOT_AUTHORIZED_OR_MATERIALIZED
productionPromotionContractPresent=false
provider/HR/Auth/Firestore/Rules/Storage writes=0
deploys=0
```

Evidencia canónica:

- `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`.

## 6. Contrato preparado sin autorización

Se creó una plantilla deshabilitada:

```text
backend/config/cxorbia-production-promotion-contract.template.json
authorized=false
strategy=null
writesAuthorizedByThisContract=false
deployAuthorizedByThisContract=false
productionCutoverAuthorizedByThisContract=false
```

La plantilla reduce el siguiente bloque a materializar únicamente la estrategia expresamente elegida. No modifica el entorno ni habilita writes o deploy.

## 7. Corrección antidesvío

No se asume que producción exige obligatoriamente un proyecto separado. La decisión debe ser expresa:

- **promover el proyecto limpio existente**, aceptando conscientemente sus identificadores y URL actuales como producción; o
- **usar un proyecto PROD limpio separado**, materializando archivos de configuración distintos.

Ninguna opción ha sido autorizada todavía. No se crea proyecto ni se cambia target por inferencia.

## 8. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
PRESERVE_NO_AUTH=140
HOLD=0
Auth writes ejecutados=false
```

El plan está listo source-only, pero su ejecución continúa separada y requiere autorización de writes, snapshot, idempotencia, readback y rollback.

## 9. Cadena mínima restante

1. Reconciliar evidencia terminal del request HR v4.
2. Confirmar `2026-08`, GT/HN, mutación histórica y `sourceRevision` transversal.
3. Ejecutar Auth con gate separado.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Autorizar una de las dos estrategias de producción.
6. Materializar el contrato y la configuración correspondiente.
7. Obtener PASS del gate de producción.
8. Completar validación humana, rollback y autorización específica.
9. Ejecutar un único cutover.

## 10. Clasificación

- **Reusable CXOrbia:** gate de promoción/target autorizado sin imponer topología.
- **Exclusivo TyA:** HR viva 2026-08 GT/HN y cutover operativo.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** diferencia entre entorno configurado y estrategia de promoción autorizada.
- **Sin impacto Claude:** frontend, `CX.data`, Login, Finanzas, Portales, Reservas y SKIP13 preservados.

## 11. Estado seguro

```text
provider reads del preflight=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

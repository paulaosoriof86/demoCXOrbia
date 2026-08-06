# SOURCE LOCK — C6 fast-track de producción source-only

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PROD_TARGET_UNMATERIALIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo

No esperar pasivamente por el request HR v4. Se ejecutó un preflight paralelo source-only para identificar qué puede cerrarse de inmediato y qué sigue impidiendo un cutover seguro.

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

## 4. Hallazgo de producción

La configuración versionada actual es exclusivamente DEV:

```text
.firebaserc default=cxorbia-backend-dev
.firebaserc alias dev=cxorbia-backend-dev
firebase hosting target=cxorbia-dev
hosting site=cxorbia-backend-dev
Cloud Run rewrite=cxorbia-live-hr-dev
production alias configurado=false
production hosting target configurado=false
production Cloud Run service configurado=false
```

Por tanto, el repositorio todavía no contiene un carril de producción materializado. Un deploy desde el estado actual apuntaría al entorno DEV y no constituye un cutover de producción válido.

## 5. Gate source-only creado y ejecutado

Se agregó:

```text
tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs
```

Evidencia:

```text
node --check=PASS
execution exitCode=2 esperado fail-closed
decision=HOLD_PRODUCTION_TARGET_UNMATERIALIZED
holdReason=PRODUCTION_CONFIGURATION_FILES_NOT_MATERIALIZED
productionRcPresent=false
productionFirebasePresent=false
provider/HR/Auth/Firestore/Rules/Storage writes=0
deploys=0
```

El gate exige archivos separados `.firebaserc.prod` y `firebase.prod.json`, proyecto/target/site/servicio distintos de DEV, región `us-central1`, `public=app` y UTF-8. No crea infraestructura ni despliega.

Evidencia canónica:

- `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`.

## 6. Identidades Shopper

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

## 7. Cadena mínima restante

1. Reconciliar evidencia terminal del request HR v4.
2. Confirmar `2026-08`, GT/HN, mutación histórica y `sourceRevision` transversal.
3. Ejecutar Auth con gate separado.
4. Ejecutar smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Materializar `.firebaserc.prod` y `firebase.prod.json` contra un proyecto nuevo y separado.
6. Obtener PASS del gate de target PROD.
7. Completar validación humana, rollback y autorización específica.
8. Ejecutar un único cutover.

## 8. Qué sí avanzó

- fuentes canónicas revalidadas;
- request v4 confirmado sin modificación posterior;
- configuración Firebase auditada;
- target DEV-only demostrado;
- gate reutilizable DEV/PROD creado;
- `node --check` PASS;
- HOLD de producción reproducible y fail-closed;
- no se emitió segundo trigger.

## 9. Clasificación

- **Reusable CXOrbia:** separación verificable DEV/PROD y gate de target antes de deploy.
- **Exclusivo TyA:** HR viva 2026-08 GT/HN y cutover operativo.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** evidencia de por qué un deploy DEV no equivale a producción.
- **Sin impacto Claude:** frontend, `CX.data`, Login, Finanzas, Portales, Reservas y SKIP13 preservados.

## 10. Estado seguro

```text
provider reads del preflight=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

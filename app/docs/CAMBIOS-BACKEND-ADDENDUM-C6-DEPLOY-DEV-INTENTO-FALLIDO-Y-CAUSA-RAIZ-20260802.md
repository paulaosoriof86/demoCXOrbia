# CAMBIOS BACKEND — C6 DEPLOY DEV: INTENTO FALLIDO Y CORRECCIÓN DE CAUSA RAÍZ

**Fecha:** 2026-08-02  
**Estado:** `DEPLOY_COMMAND_ATTEMPTED__NO_RELEASE_CREATED__ROOT_CAUSE_FIXED__FRESH_AUTHORIZATION_REQUIRED`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Resultado real de la autorización

La autorización de un único deploy del Hosting DEV se utilizó para iniciar una ejecución controlada.

La ejecución cerró antes de crear una release:

- etapa fallida: `deploy_hosting_once`;
- intento de comando de deploy: 1;
- deploy exitoso: 0;
- releases Hosting creadas: 0;
- gates remotos ejecutados: 0;
- Cloud Run deploys: 0;
- producción: intacta.

Evidencia: `app/docs/evidence/CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`.

## 2. Predeploy que sí pasó

Antes del comando fallido se comprobó:

- source lock exacto;
- mismo árbol `app` bloqueado y observado;
- 2,291 archivos y manifest de fuente registrado;
- gate estático acumulativo PASS;
- credenciales Staff, Shopper y Cliente leídas sin writes;
- configuración de destino DEV exacta;
- cero cambios de aplicación entre lock y runner.

No fue una regresión funcional, de HR, Auth, Finanzas, Cliente, Shopper o Reservas.

## 3. Causa raíz reproducible

El runner generaba la configuración alternativa únicamente en:

`.tmp/c6-hosting-dev-deploy/firebase.deploy.json`

y ejecutaba Firebase CLI con ese path mediante `--config`.

Firebase CLI detecta primero el directorio raíz del proyecto y carga el **basename** de la configuración alternativa dentro de esa raíz. En consecuencia, buscó:

`<project-root>/firebase.deploy.json`

Ese archivo no existía durante el intento. La operación terminó antes de crear una release.

La clasificación correcta es:

`FIREBASE_CLI_ALTERNATE_CONFIG_PATH_RESOLUTION`

No se ha demostrado un problema de IAM, proveedor, source lock ni aplicación.

## 4. Corrección de raíz aplicada

### `firebase.json`

La configuración canónica ahora conserva explícitamente:

- target `cxorbia-dev`;
- public `app`;
- rewrite `/api/tya/cinepolis/hr-live` hacia el servicio existente `cxorbia-live-hr-dev` en `us-central1`;
- wildcard posterior hacia `/index.html`;
- UTF-8 para HTML, JS, CSS, JSON y webmanifest.

### `firebase.deploy.json`

Se creó en la raíz del proyecto la configuración Hosting-only que Firebase CLI resuelve realmente cuando recibe `--config .../firebase.deploy.json`.

Contiene únicamente:

- Hosting DEV existente;
- carpeta `app`;
- rewrite del endpoint HR vivo hacia el servicio ya existente;
- wildcard SPA;
- headers UTF-8.

No contiene Firestore, Auth, Rules, Storage, Functions, Cloud Run ni producción.

### Compatibilidad de credenciales

Se conserva `tools/qa/cxorbia-c6-existing-users-e2e-envelope-compat.mjs`, que adapta en memoria el metadata faltante del envelope v3 sin modificarlo ni exponer secretos.

## 5. Restricción posterior al fallo

Aunque no se creó una release, el comando de deploy sí fue intentado. Por tanto:

- no se reintenta automáticamente;
- la autorización anterior queda consumida;
- se requiere autorización fresca y explícita;
- el próximo intento continuará limitado a exactamente un deploy Hosting DEV;
- ante cualquier nuevo fallo no habrá segundo deploy automático.

## 6. Archivos creados o tocados

- `firebase.json`.
- `firebase.deploy.json`.
- `tools/qa/cxorbia-c6-existing-users-e2e-envelope-compat.mjs`.
- `.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`.
- `app/docs/evidence/CORTE6-HOSTING-DEV-DEPLOY-REMOTE-GATES-FAILURE-LATEST.json`.
- `app/docs/evidence/CORTE6-HOSTING-DEV-DEPLOY-ROOT-CAUSE-FIX-LATEST.json`.
- este addendum y documentos canónicos.

## 7. Estado seguro

Después de la corrección:

- Hosting deploys: 0;
- Hosting deploy attempts: 0;
- Cloud Run deploys: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- credenciales/tokens expuestos: 0;
- merge: false;
- producción: false.

## 8. Siguiente bloque exacto

Con autorización fresca:

`SOURCE LOCK ACTUAL → STATIC GATE → CREDENCIALES READ-ONLY → UN ÚNICO HOSTING DEV DEPLOY → PARIDAD REMOTA → LIVE HR → STAFF/CLIENTE/SHOPPER → DOMINIO/FINANZAS/PORTALES/RESERVAS → 3 RELOADS + NEW TAB → EVIDENCIA PASS/FAIL`.

## 9. Clasificación

- **Reusable CXOrbia:** configuración Hosting raíz, source lock y evidencia de intento/release separada.
- **Exclusivo TyA:** endpoint `/api/tya/cinepolis/hr-live` y site DEV actual.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** distinguir intento de comando, release creada y deploy validado.
- **Sin impacto proveedor después del fix:** no se ejecutó un nuevo comando de deploy.

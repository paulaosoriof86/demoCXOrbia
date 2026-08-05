# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `LOGIN_ROOT_FIX_DEPLOYED__STAFF_SHOPPER_CLIENT_AUTH_PASS__REMOTE_SEMANTIC_CLIENT_ROUTE_WAIT_STOP_RETRY__NO_MORE_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- carril: ChatGPT + runners controlados de GitHub;
- Hosting DEV acumulado: `2`;
- deploys adicionales autorizados: `0`.

## 2. Root fix de Login

La compatibilidad acumulativa quedó aplicada en:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

Selector vigente:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

El fix conserva el Login V7.2 y compatibilidad legacy. No se modificaron `app/app.js`, CSS, módulos, credenciales, Auth, memberships ni HR.

## 3. Reconciliación contractual — PASS

Se actualizaron únicamente los dos pins autorizados en:

`app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`

Commit:

`8642e87c655edfa81f813d1a3ccad9236312c5ea`

Gate source/static:

```text
run=31025221503
artifact=8938295964
digest=sha256:5482f4d00b69ac37b926771f69226efdd18ff4aa36e22288ba9c3d5578c4d9ad
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Segundo Hosting DEV correctivo

El deploy autorizado se ejecutó una sola vez y completó la release en:

`https://cxorbia-backend-dev.web.app`

```text
deployAttempted=true
deploySucceeded=true
hostingDeploysThisRun=1
hostingDeployAttempts=1
automaticSecondDeploys=0
```

## 5. Gates remotos aprobados

### Paridad y HR viva

```text
PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR
allCriticalAssetsMatch=true
liveEndpoint.ok=true
```

Los dos archivos corregidos coinciden entre fuente y Hosting DEV.

### Staff y Shopper

```text
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
```

- Login Staff: PASS;
- Login Shopper: PASS;
- tres recargas: PASS;
- nueva pestaña: PASS;
- visita propia Shopper: PASS;
- credenciales/tokens expuestos: false.

La fuente remota observó `15` periodos, `660` visitas y periodo vigente `2026-08`.

### Cliente

```text
PASS_C6_CLIENT_AUTH_EXISTING_CREDENTIAL_RUNTIME
```

- credencial existente seleccionada;
- autenticación Cliente: PASS;
- tenant `tya`, proyecto `cinepolis`;
- recarga y nueva pestaña: PASS;
- cambios de contraseña/Auth: `0`.

## 6. STOP_RETRY vigente

El gate acumulativo de dominio/Finanzas/portales/Reservas se detuvo en:

```text
failedStage=remote_domain_finance_portals_reservations
semantic.failedStage=client_route_wait
errorCode=page.waitForFunction: Timeout 30000ms exceeded.
```

Antes del timeout quedó comprobado:

```text
clientModule=true
routerAvailable=true
requested=true
routeAfterRequest=cli_dashboard
```

La evidencia no separó cuál condición visual quedó falsa entre:

- `#nav-cli_dashboard.active`;
- `#view .ph`;
- contenido no vacío de `#view`.

No se ha demostrado todavía si corresponde a producto o harness/timing. No modificar runtime ni repetir deploy sin diagnóstico focal y autorización nueva.

## 7. Finanzas, Reservas y dominio preservados

Antes del timeout se observó:

- modelo financiero delegado;
- `localBilling=false`;
- regalías `0`;
- contrato financiero listo;
- cero valores inventados;
- Reservas fail-closed;
- mutaciones de Reservas deshabilitadas;
- módulos de Cliente, Shopper, Finanzas y Reservas registrados.

## 8. Estado seguro

```text
HOSTING_DEPLOYS_TOTAL=2
HOSTING_DEPLOYS_THIS_BLOCK=1
ADDITIONAL_DEPLOYS_AUTHORIZED=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_MEMBERSHIP_WRITES_TOTAL=1
FIRESTORE_WRITES_THIS_BLOCK=0
AUTH_WRITES=0
CLAIMS_WRITES=0
USER_CREATES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MAKE_WRITES=0
GEMINI_CALLS=0
PAYMENTS_WRITES=0
CREDENTIALS_EXPOSED=false
TOKENS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

## 9. Phase A preservada

Se preservan V7.2-P0F1, composición acumulativa Phase A, HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

El P0 original del Login queda cerrado técnicamente. El cierre completo del gate acumulativo permanece en HOLD por `client_route_wait`.

## 10. Siguiente bloque exacto

Requiere autorización expresa nueva:

`DIAGNÓSTICO READ-ONLY FOCAL DE client_route_wait → CAPTURAR session.view, navElementExists, navActive, viewExists, pageHeaderExists, viewTextLength Y renderException POR SEPARADO → CLASIFICAR PRODUCTO VS HARNESS → DETENERSE SIN DEPLOY`.

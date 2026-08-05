# CAMBIOS BACKEND — Addendum C6 Login root fix y STOP remoto

**Fecha:** 2026-08-05  
**Estado:** `LOGIN_ROOT_FIX_DEPLOYED__STAFF_SHOPPER_CLIENT_AUTH_PASS__REMOTE_SEMANTIC_CLIENT_ROUTE_WAIT_STOP_RETRY__NO_MORE_DEPLOY__NO_PRODUCTION`

## 1. Bloque autorizado y ejecutado

Se ejecutó el macrobloque autorizado por Paula sobre la rama viva `docs-tya-v6-v71-audit`, sin nueva rama, PR, candidata ni metodología.

Secuencia ejecutada:

1. reconciliación contractual de exactamente dos blob pins;
2. gate source/static read-only;
3. segundo Hosting DEV correctivo, únicamente después del PASS;
4. paridad remota y HR viva;
5. Staff, Shopper, Cliente y gate acumulativo de dominio/Finanzas/portales/Reservas;
6. STOP_RETRY ante el primer fallo remoto restante.

## 2. Reconciliación contractual exacta

Archivo modificado:

- `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`.

Pins reconciliados, sin otros cambios runtime:

- `app/core/backend-browser-auth.js` → `35c4fa2fab09fc4fd17a7547b721e4693f93f495`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js` → `3acc508ac242407ea688b6a4ba964409af1125ba`.

Commit de reconciliación:

`8642e87c655edfa81f813d1a3ccad9236312c5ea`

No se modificó nuevamente ninguno de los dos archivos runtime, ni `app/app.js`, CSS, módulos, credenciales, Auth, memberships, HR o datos.

## 3. Gate source/static — PASS

Request:

`c6-login-selector-two-pin-reconciliation-source-static-20260805-02`

Evidencia:

```text
workflowRunId=31025221503
artifactId=8938295964
artifactDigest=sha256:5482f4d00b69ac37b926771f69226efdd18ff4aa36e22288ba9c3d5578c4d9ad
```

Resultados:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

El gate dejó el repositorio sin delta propio y el request quedó consumido y deshabilitado.

## 4. Segundo Hosting DEV correctivo

Request:

`c6-login-selector-root-fix-second-hosting-dev-20260805-03`

Resultado:

```text
deployAttempted=true
deploySucceeded=true
hostingDeploysThisRun=1
hostingDeployAttempts=1
automaticSecondDeploys=0
```

La release quedó publicada en el Hosting DEV existente:

`https://cxorbia-backend-dev.web.app`

No se creó proyecto, sitio, rama ni entorno adicional.

## 5. Gates remotos que sí pasaron

### Paridad y HR viva

```text
PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR
allCriticalAssetsMatch=true
liveEndpoint.ok=true
```

Los dos archivos corregidos coincidieron byte a byte entre la rama viva y Hosting DEV.

### Staff y Shopper

```text
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
```

Observado:

- Staff autenticado por el wrapper oficial;
- Shopper autenticado por el wrapper oficial;
- tres recargas estables;
- nueva pestaña estable;
- Shopper con una visita propia;
- credenciales y tokens no expuestos.

La autoridad remota observó `15` periodos y `660` visitas, con periodo vigente `2026-08`.

### Cliente

```text
PASS_C6_CLIENT_AUTH_EXISTING_CREDENTIAL_RUNTIME
```

Observado:

- credencial existente seleccionada;
- autenticación real;
- tenant `tya` y proyecto `cinepolis`;
- recarga y nueva pestaña estables;
- cero cambios de contraseña o Auth.

### Finanzas y Reservas — diagnóstico previo al fallo

El diagnóstico financiero observó el modelo delegado configurado, `localBilling=false`, regalías `0`, contrato financiero listo y cero valores inventados.

Reservas permaneció fail-closed: fuente canónica no conectada para mutaciones y escrituras deshabilitadas.

## 6. STOP_RETRY remoto

El gate acumulativo se detuvo en:

```text
failedStage=remote_domain_finance_portals_reservations
semantic.failedStage=client_route_wait
errorCode=page.waitForFunction: Timeout 30000ms exceeded.
```

Estado parcial comprobado antes del timeout:

```text
clientModule=true
routerAvailable=true
requested=true
routeAfterRequest=cli_dashboard
```

La evidencia actual no identifica cuál subcondición visual quedó pendiente entre:

- navegación activa `#nav-cli_dashboard`;
- encabezado `.ph` dentro de `#view`;
- contenido no vacío dentro de `#view`.

Por ello no se atribuye todavía la causa a producto o harness. Se requiere un diagnóstico focal read-only del predicado `client_route_wait`; queda prohibido inventar una causa o modificar runtime sin evidencia reproducible.

## 7. Seguridad y límites consumidos

```text
HOSTING_DEPLOYS_THIS_BLOCK=1
HOSTING_DEPLOYS_ACCUMULATED=2
ADDITIONAL_DEPLOYS_AUTHORIZED=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_WRITES_THIS_BLOCK=0
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MAKE_CALLS=0
GEMINI_CALLS=0
PAYMENTS_WRITES=0
CREDENTIALS_EXPOSED=false
TOKENS_EXPOSED=false
MERGE=false
PRODUCTION=false
```

El request quedó `consumed_fail_stop_retry`. No se ejecutó reintento ni deploy adicional.

## 8. Clasificación obligatoria

- **Reusable CXOrbia:** selector acumulativo compatible con markup nuevo/legacy; reconciliación de pins; gate de paridad; diagnóstico focal de rutas por predicados observables.
- **Exclusivo cliente:** identidad del tenant `tya`, proyecto `cinepolis` y datos observados del periodo vivo.
- **Claude/prototipo:** no rediseñar Login ni Portal Cliente; conservar `.lg2-card` y el wrapper oficial. El único pendiente de interfaz es verificar por qué el panorama `cli_dashboard` no satisface todo el predicado visual del gate acumulativo.
- **Academia:** Login por roles, continuidad de sesión y acceso Cliente quedan validados; el recorrido visual completo del Portal Cliente continúa pendiente del diagnóstico focal.
- **Sin impacto Claude:** source lock, pins, artifacts, consumo de requests y evidencia de seguridad.

## 9. Siguiente bloque exacto

`DIAGNÓSTICO READ-ONLY FOCAL DE client_route_wait → OBSERVAR POR SEPARADO session.view, navActive, pageHeader Y viewText → CLASIFICAR PRODUCTO VS HARNESS → STOP SIN DEPLOY`.

Cualquier fix o nuevo Hosting DEV requiere autorización expresa posterior y evidencia reproducible.

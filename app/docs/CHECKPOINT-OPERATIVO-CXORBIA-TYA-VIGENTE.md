# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `HOSTING_DEV_DEPLOYED__REMOTE_PARITY_PASS__P0_LOGIN_CONTAINER_SELECTOR_MISMATCH__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Codex: opcional, no dependencia operativa;
- carril: ChatGPT + runners controlados de GitHub.

## 2. Repair DEV de membresía Cliente

Autorización ejecutada sobre:

`tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`

Resultado comprobado:

```text
PASS_C6_CLIENT_ACCESS_TRANSACTION
PASS_C6_CLIENT_AUTH_MEMBERSHIP_REPAIRED
PASS_C6_CLIENT_AUTH_MEMBERSHIP_IDEMPOTENT_NOOP
PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT_DRY_RUN
```

Límites consumidos:

```text
membershipWrites=1
authWrites=0
claimsWrites=0
userCreates=0
passwordChanges=0
passwordResets=0
```

La membresía quedó retenida porque el acceso pasó, el readback fue exacto y la autorización indicó continuar con Hosting DEV.

## 3. Único Hosting DEV autorizado

El único Hosting DEV autorizado fue ejecutado y consumido.

```text
deployAttempted=true
deploySucceeded=true
hostingDeploysThisRun=1
hostingDeployAttempts=1
automaticSecondDeploys=0
```

Firebase Hosting completó la release en:

`https://cxorbia-backend-dev.web.app`

La paridad remota posterior pasó:

```text
PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR
allCriticalAssetsMatch=true
liveEndpoint.ok=true
```

## 4. P0 comprobado posterior al deploy

El bloque remoto se detuvo en:

```text
failedStage=remote_staff_shopper
decision=FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP
failedPrincipal=staff
```

La evidencia observable mostró:

```text
firebaseWrapper=true
backendAuthPresent=true
backendAuthReady=false
earlyGuardInstalled=true
earlyGuardIntercepts=0
integratedStep=false
integratedLogin=false
appOn=false
```

### Causa raíz reproducible

La candidata V7.2-P0F1 cambió el contenedor visible del login a:

```html
<form class="lg2-card" id="loginForm">
```

Sin embargo, los dos puntos que montan el formulario integrado de credenciales todavía buscan exclusivamente:

```js
loginRoot.querySelector('.login-card')
```

Archivos afectados:

- `app/core/backend-browser-auth.js` → `showCredentialStep()`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js` → `clientCredentialStep()`.

Como `.login-card` ya no existe en el login V7.2, ambos métodos retornan sin montar `#cxIntegratedAuthStep`. El wrapper oficial sí intercepta el rol Staff; el guard temprano no interviene porque detecta que el wrapper oficial está instalado. Por eso el botón responde sin abrir usuario/contraseña y el smoke cierra en `integratedStep=false`.

Clasificación:

```text
P0_PROVEN=STAFF_LOGIN_CANNOT_START
ROOT_CAUSE=LEGACY_LOGIN_CONTAINER_SELECTOR_AFTER_V7_2_MARKUP_CHANGE
```

No es un problema de credenciales, Firebase Auth, claims, membresía, HR, propagación de Hosting ni paridad de archivos.

## 5. Correctivo source-only exacto

En ambos archivos, sustituir el selector rígido por compatibilidad acumulativa:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

Esto conserva compatibilidad con el login nuevo V7.2 y con cualquier shell histórico que aún use `.login-card`. No requiere rediseño, nueva candidata ni cambio de contratos backend.

El correctivo todavía no se aplicó porque el gate exigió STOP_RETRY y el único deploy autorizado ya fue consumido.

## 6. Estado seguro

```text
HOSTING_DEPLOYS=1
SECOND_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_MEMBERSHIP_WRITES=1
AUTH_WRITES=0
CLAIMS_WRITES=0
USER_CREATES=0
PASSWORD_CHANGES=0
RULES_WRITES=0
STORAGE_WRITES=0
HR_WRITES=0
MAKE_WRITES=0
GEMINI_CALLS=0
PAYMENTS_WRITES=0
MERGE=false
PRODUCTION=false
```

## 7. Phase A preservada

Se preservan V7.2-P0F1, composición acumulativa Phase A, HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 8. Siguiente bloque exacto

Requiere autorización expresa nueva:

`APLICAR FIX SOURCE-ONLY P0 EN LOS DOS SELECTORES → GATES SOURCE/STATIC → SEGUNDO HOSTING DEV DE CORRECCIÓN → PARIDAD → STAFF → SHOPPER CON TRES RECARGAS Y NUEVA PESTAÑA → CLIENTE → DOMINIO/FINANZAS/PORTALES/RESERVAS → DETENERSE PARA VALIDACIÓN HUMANA`.

Queda prohibido ejecutar el segundo Hosting DEV sin esa autorización.

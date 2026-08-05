# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `HOSTING_DEV_DEPLOYED__REMOTE_STAFF_AUTH_HOLD__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- Codex: opcional, no dependencia operativa;
- carril: ChatGPT + runners controlados de GitHub.

## 2. Repair de membresía Cliente

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

La membresía quedó retenida porque el acceso pasó y la autorización indicó continuar con Hosting DEV.

## 3. Hosting DEV

El único Hosting DEV autorizado fue ejecutado y consumido.

Resultado:

```text
deployAttempted=true
deploySucceeded=true
hostingDeploysThisRun=1
hostingDeployAttempts=1
automaticSecondDeploys=0
```

Firebase Hosting reportó release completo en:

`https://cxorbia-backend-dev.web.app`

La paridad remota posterior pasó:

```text
PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR
allCriticalAssetsMatch=true
liveEndpoint.ok=true
```

## 4. Bloqueo posterior al deploy

El bloque remoto se detuvo en:

```text
failedStage=remote_staff_shopper
decision=FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP
failedPrincipal=staff
```

Estado observable en la pantalla Staff:

```text
backendAuthPresent=true
backendAuthReady=false
earlyGuardInstalled=true
directRoleEntryAllowed=false
integratedStep=false
integratedLogin=false
appOn=false
sessionRole=null
```

La app y los botones de rol cargaron, pero la autoridad de autenticación del navegador no alcanzó estado ready antes de la interacción Staff. No se ejecutó Shopper, Cliente, Finanzas, portales ni Reservas porque STOP_RETRY se aplicó inmediatamente.

## 5. Estado seguro

```text
HOSTING_DEPLOYS=1
SECOND_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_MEMBERSHIP_WRITES=1
AUTH_WRITES=0
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

## 6. Phase A preservada

Se preservan V7.2-P0F1, composición acumulativa Phase A, HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 7. Siguiente bloque exacto

`DIAGNÓSTICO READ-ONLY DE backendAuthReady=false EN LA RUTA STAFF SOBRE EL HOSTING DEV YA DESPLEGADO → ROOT FIX SOURCE-ONLY SI SE DEMUESTRA CAUSA → GATES READ-ONLY REMOTOS SIN SEGUNDO DEPLOY`.

Queda prohibido un segundo deploy automático. Cualquier nuevo deploy requerirá autorización expresa separada.

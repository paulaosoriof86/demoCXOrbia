# CAMBIOS BACKEND — membresía Cliente PASS, Hosting DEV y P0 selector de Login

**Fecha:** 2026-08-05  
**Estado:** `HOSTING_DEV_DEPLOYED__REMOTE_PARITY_PASS__P0_LOGIN_CONTAINER_SELECTOR_MISMATCH__STOP_RETRY`

## 1. Repair DEV ejecutado

Ruta exclusiva:

`tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`

Resultado:

- snapshot previo PASS;
- target único PASS;
- claims exactos PASS;
- `membershipWrites=1`;
- `authWrites=0`;
- `claimsWrites=0`;
- `userCreates=0`;
- `passwordChanges=0`;
- idempotencia PASS;
- readback PASS;
- rollback dry-run PASS.

## 2. Control plane endurecido

### `tools/qa/cxorbia-c6-client-auth-materialization.mjs`

- guard `CXORBIA_MEMBERSHIP_ONLY_REPAIR`;
- falla si detecta drift de claims en un repair membership-only;
- impide escrituras Auth fuera del alcance autorizado.

### `tools/qa/cxorbia-c6-client-access-runtime-orchestrator.mjs`

- exige `membershipOnlyRepair=true`;
- exige `maxClaimsWrites=0`;
- snapshot valida `claimsExact=true`;
- apply e idempotencia validan cero Auth/claims writes y máximo una membership write.

### `tools/release/cxorbia-focal-text-patch-runner.mjs`

- allowlist focal ampliada para el orquestador del repair;
- preserva parent/hash exactos, sintaxis, commit/push atómico y cero deploy durante los fixes source-only.

## 3. Hosting DEV

Se ejecutó el único deploy autorizado:

- proyecto: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- sitio: `cxorbia-backend-dev`;
- resultado: release complete;
- URL: `https://cxorbia-backend-dev.web.app`;
- segundo deploy: `0`.

Paridad posterior:

- assets críticos: match;
- endpoint HR: HTTP 200 y JSON válido;
- decisión: `PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR`.

## 4. P0 posterior al deploy

Gate:

```text
FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP
failedPrincipal=staff
```

Causa raíz:

- V7.2 usa `.lg2-card` como contenedor de Login;
- `backend-browser-auth.js` y `tya-c6-unified-human-runtime-v1.js` siguen buscando `.login-card`;
- el formulario integrado no se monta y `integratedStep=false`.

Correctivo pendiente:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

en:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

## 5. Clasificación

- **Reusable CXOrbia:** guard membership-only, límites de writes, selector compatible nuevo/legacy.
- **Exclusivo cliente:** membresía tenant `tya`, proyecto `cinepolis`.
- **Claude/prototipo:** P0 de compatibilidad entre markup V7.2 y bridge de Login; no rediseñar.
- **Academia:** separación Auth/claims/membership y contratos de selectores DOM acumulativos.
- **Sin impacto Claude:** request, evidence y control plane.

## 6. Estado seguro

```text
Hosting DEV=1
segundo deploy=0
Firestore membership writes=1
Auth/claims/user/password writes=0
Cloud Run/Rules/Storage/HR/Make/Gemini/pagos=0
merge=false
production=false
```

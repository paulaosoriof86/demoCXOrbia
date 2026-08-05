# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `LOGIN_SELECTOR_SOURCE_FIX_APPLIED__LAB_CONTRACT_PASS__SOURCE_STATIC_HOLD_MANIFEST_BLOB_PINS_STALE__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta;
- carril: ChatGPT + runners controlados de GitHub;
- Hosting DEV acumulado antes de este bloque: `1`;
- segundo Hosting DEV ejecutado en este bloque: `0`.

## 2. Estado preservado antes del bloque

- membresía Cliente reparada con un único write y readback exacto;
- Auth/claims/user/password writes: `0`;
- Hosting DEV anterior: release completa;
- paridad remota anterior y HR viva: PASS;
- P0 comprobado: el Login V7.2 usa `.lg2-card`, mientras los bridges buscaban solo `.login-card`.

## 3. Root fix source-only aplicado

Se aplicó exactamente el selector acumulativo autorizado:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

Archivos y commits:

- `app/core/backend-browser-auth.js` — `d5cd7741dafd032138bd4f61d2f0500e9c68e64a`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js` — `9e59fcb81290c80e43233e5202356983a340bf4b`.

No se modificaron `app/app.js`, CSS, credenciales, usuarios Auth, memberships, HR ni módulos de negocio.

## 4. Gate source/static ejecutado

Request:

```text
c6-login-container-selector-root-fix-source-static-20260805-01
```

Evidencia:

```text
workflowRunId=31023829902
artifactId=8937732266
artifactDigest=sha256:59442b8fa74ec77ab61c655a3380134ddbd91feec7c99c17bbe09128ef1df0f8
repositoryUnchangedByGate=true
```

Resultados:

```text
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
HOLD_READONLY_POST_GATES
FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE
```

## 5. Causa raíz del HOLD

El código autorizado no presentó un fallo semántico adicional. El gate encontró exactamente dos diferencias de blob porque el manifiesto acumulativo aún fija las versiones anteriores de los dos archivos corregidos:

```text
app/core/backend-browser-auth.js
manifest expected=d052a4b62e5320817d42055946e94de463914b24
actual authorized=35c4fa2fab09fc4fd17a7547b721e4693f93f495

app/adapters/tya-c6-unified-human-runtime-v1.js
manifest expected=7c00752d9a34209366f3c328ea3e5f5fddb4e1db
actual authorized=3acc508ac242407ea688b6a4ba964409af1125ba
```

Clasificación:

```text
ROOT_CAUSE=ACTIVE_COMPOSITION_MANIFEST_STILL_PINS_PRE_FIX_AUTH_BRIDGE_BLOBS
SCOPE_OF_MISMATCH=EXACTLY_THE_TWO_AUTHORIZED_FILES
```

No se detectaron archivos faltantes, scripts duplicados, secretos, regresión de rutas ni fallo del contrato de Laboratorio.

## 6. STOP_RETRY aplicado

Como el source/static no obtuvo PASS:

- no se intentó el segundo Hosting DEV;
- no se ejecutaron gates remotos contra un build nuevo;
- no hubo reintento automático;
- el request quedó consumido y deshabilitado;
- se registró evidencia en `app/docs/evidence/CORTE6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-LATEST.json`.

## 7. Estado seguro

```text
HOSTING_DEPLOYS_TOTAL=1
SECOND_HOSTING_DEPLOYS=0
CLOUD_RUN_DEPLOYS=0
FIRESTORE_MEMBERSHIP_WRITES_TOTAL=1
FIRESTORE_WRITES_THIS_BLOCK=0
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

## 8. Phase A preservada

Se preservan V7.2-P0F1, la composición acumulativa Phase A, HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, multi-tenant, multi-proyecto, Finanzas, Portal Cliente, Portal Shopper, Reservas, sincronización HR/plataforma y Academia.

## 9. Siguiente acción exacta

Reconciliar únicamente los dos blob pins autorizados en el manifiesto/build-lock activo, ejecutar un nuevo gate source/static y, solo con PASS, continuar con el segundo Hosting DEV correctivo y la cadena remota ya autorizada. No modificar nuevamente el Login ni abrir una auditoría general.

# CAMBIOS BACKEND — Addendum G2-B provider reconciliation y recovery

Fecha: 2026-08-20
Estado: `G2B_P0_DEPLOY_ATTEMPT_A_NO_PROVIDER_DEPLOY_OBSERVED__RECOVERY_REARM_AUTH_REQUIRED`

## 1. Evidencia forense cerrada

La incertidumbre `G2B_EXTERNAL_DEPLOY_STATE_UNRECONCILED` quedó resuelta mediante lectura directa y sin mutación de Cloud Run y Firebase Hosting.

Evidencia canónica:

- `app/docs/evidence/I5-G2B-PROVIDER-READONLY-RECONCILIATION-LATEST.json`
- decisión: `A_NO_G2B_PROVIDER_DEPLOY_OBSERVED`;
- execute original: `c746bdf068edf1322b7c9a5e497ea5aff13e6b58`;
- Cloud Run actual: `cxorbia-live-hr-dev-00010-n78`, sin cambio desde 2026-08-16;
- Hosting último release: `sites/cxorbia-backend-dev/releases/1787196507030000`, `2026-08-20T03:28:27.030Z`, anterior al execute G2-B;
- ruta G2-B directa y por Hosting: HTTP 405 `method_not_allowed`, por lo que el source corregido no está materializado;
- provider/business/Auth/HR/payment/Make/Gemini writes: 0.

Conclusión: el intento original no desplegó la corrección G2-B en Cloud Run ni en Hosting. No corresponde stage/test todavía.

## 2. Cambios source-only realizados

### `8a493f3c0b82e5f8c73cf3da52ed896f81a78941`

Se extendió el workflow read-only existente `cxorbia-live-hr-provider-capability-preflight.yml` para reconciliar Cloud Run + Hosting + ruta G2-B sin mutaciones. El run pasó y produjo la evidencia anterior. El commit automático de evidencia dejó HEAD posterior `1b692f98f35ea92d7d9ee4959a2e1a33b8352d9b`.

### `f47d44c35ea3feaa300bde32726ff9d5dc9cd66b`

Se endureció el workflow existente `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` sin ejecutar proveedor:

- I3 permanece congelado;
- el one-shot G2-B original queda congelado y no admite replay;
- se agregó dentro del mismo workflow un carril de recuperación explícito, aún no ejecutable sin re-arm;
- pre-readback exige identidad exacta de Cloud Run y Hosting antes de cualquier mutación;
- el payload a desplegar queda fijado al source-fix `1d2cfecba0a89b637398d747a628e549d9823c68` mediante worktree detached;
- Cloud Build, Cloud Run y Hosting tienen máximo una ejecución cada uno;
- Hosting solo puede ocurrir después de Cloud Run + smoke directo PASS;
- cada mutación tiene readback inmediato y status durable con identificador externo;
- el cierre clasifica `RECOVERY_PASS_FULL`, `RECOVERY_PARTIAL_CLOUD_RUN_ONLY`, `RECOVERY_PARTIAL_OR_NONTERMINAL` o `RECOVERY_NO_PROVIDER_SIDE_EFFECT`;
- cualquier resultado consume el recovery one-shot y mantiene `automaticRetryAllowed:false`;
- solo `RECOVERY_PASS_FULL` habilita `G2B_STAGE_AND_TEST_SYNTHETIC_ONLY`.

### `100a3b736880344886013ea5fb7798dc7ca05327`

Se preparó `backend/config/cxorbia-g2b-p0-writepath-deploy-recovery-request.json` en estado seguro:

- `enabled:false`;
- `authorizedBy:null`;
- `paulaExplicitInCurrentConversation:false`;
- `executionCount:0/1`;
- Cloud Build/Cloud Run/Hosting máximo `1/1/1`;
- Firestore/Auth/Storage/HR externo/datos y credenciales reales/pagos/Rules/Make/Gemini: 0;
- merge false;
- automatic retry false.

No existe recovery execute file y por tanto no puede arrancar ninguna mutación de proveedor.

## 3. Seguridad y alcance

Durante este bloque:

- deploys: 0;
- provider writes: 0;
- Firestore writes: 0;
- Auth writes: 0;
- Storage writes: 0;
- external HR writes: 0;
- pagos: 0;
- Make/Gemini: 0;
- merge: 0;
- nueva rama/PR/workflow: 0.

PR #7 permanece draft/open/unmerged. Phase A permanece 98/100.

## 4. Clasificación obligatoria

- **Reusable CXOrbia:** reconciliación read-only antes de retry, source-fix inmutable, readback después de cada side effect y recuperación sin retry automático.
- **Exclusivo cliente:** proyecto `cxorbia-backend-dev`, servicio `cxorbia-live-hr-dev`, Hosting `cxorbia-backend-dev`, tenant TyA/proyecto Cinépolis.
- **Claude/prototipo:** sin cambio UI; el prototipo no debe modificarse por este bloque.
- **Academia:** sin cambio de contenido; G2-B continúa pendiente de prueba productiva sintética.
- **Sin impacto Claude:** hardening del control-plane y evidencia de proveedor.

## 5. Siguiente gate exacto

`PAULA_I5_G2B_P0_WRITEPATH_RECOVERY_REARM`

Hasta autorización expresa no se arma ni crea `cxorbia-g2b-p0-writepath-deploy-recovery-execute.json` y no se ejecuta Cloud Build, Cloud Run, Hosting ni stage sintético.

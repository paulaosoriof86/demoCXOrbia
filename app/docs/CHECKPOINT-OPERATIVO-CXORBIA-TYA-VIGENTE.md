# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_LIVE_HR_DEV_DEPLOY_BLOCKED_CLOUD_BUILD_API_DISABLED`

## Estado comprobado

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- HEAD funcional de la rama viva antes de este checkpoint: `6845c20d05d1226d27e6f96668c650b78e3ebaf1`.
- Baseline activa: V161C/R21.
- V164 está integrada como candidata técnica de Corte 1, pero NO está congelada.
- La validación visual de Paula detectó inconsistencias reproducibles entre KPI, detalle, reportes y cambio de periodo.
- Corte 2 continúa bloqueado.

## Causa raíz funcional demostrada

El build V164 no usaba la HR como verdad runtime viva:

1. `tools/release/tya-r21-build-and-gates.sh` reutilizaba por defecto una copia publicada desde `FROZEN_SOURCE_URL`.
2. El gate validaba conteos fijos del snapshot aprobado.
3. El adapter declaraba `runtimeSyncActive:false`, `CX_TYA_HR_VIVA_SOURCE_SAFE=false` y `CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=true`.

Los conteos documentados son evidencia histórica de una lectura, nunca constantes operativas.

## Modelo operacional aclarado por Paula

- Cada proyecto tiene su propia hoja de ruta y configuración de fuente.
- Los cambios manuales en la hoja de ruta deben reflejarse en CXOrbia.
- Las futuras automatizaciones plataforma→HR requieren un gate separado de escritura y cubrirán asignación, agenda, reprogramación, cancelación, cuestionario y otros eventos autorizados.
- El cuestionario es configurable por proyecto o visita: CXOrbia, TyAOnline, plataforma externa, enlace general o enlace individual.
- TyAOnline es solo un posible proveedor de cuestionarios del tenant TyA; no sincroniza de forma general la hoja de ruta.

## Corte 1A preparado y validado

Se crearon y validaron:

- `backend/contracts/phase-a-live-hr-runtime-read-v1.json`;
- `tools/qa/tya-live-hr-read-probe-gate.mjs`;
- `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`;
- `backend/runtime/hr-live-service/`;
- `app/adapters/tya-live-source-refresh-watch.js`;
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`;
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml`.

Evidencia previa:

- `cxorbia/live-hr-read-probe`: SUCCESS en `de508a8b60f63b60fae0aacf4a8fc464e164c4d9`.
- `cxorbia/live-hr-runtime-predeploy`: SUCCESS en `4db471e8852f85444843862bb0c8fd453873af30`.

## Autorización DEV y carril temporal

Paula autorizó expresamente:

1. Cloud Run DEV read-only;
2. republicación de Hosting DEV;
3. una excepción temporal para alojar el runner en `main`;
4. cero producción, escrituras HR/Firestore, imports y pagos.

La autorización base está en `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json`, commit `6d87bbf6330182a03da64fe350032a1c5335dac3`.

El runner temporal en `main` sí logró ejecutar Actions y comprobar la rama viva. No se utilizó nueva rama, nuevo PR, PowerShell, blobs/trees ni transporte manual.

## Bloqueo exacto comprobado

El endpoint Cloud Run DEV y el nuevo Hosting DEV todavía NO fueron desplegados.

Evidencia del carril temporal:

- Run `29787418426`: diagnóstico exacto del principal GCP.
- Principal: service account Firebase Admin SDK del proyecto DEV.
- `gcloud services list`: `AUTH_PERMISSION_DENIED`.
- `gcloud services enable`: `AUTH_PERMISSION_DENIED` para Cloud Build, Cloud Run, Firebase Hosting, Container Registry y Artifact Registry.
- Run `29787549700`: los gates de HR viva y runtime volvieron a pasar; el fallo ocurrió únicamente en `gcloud builds submit`.
- Error exacto: `cloudbuild.googleapis.com` está deshabilitada o nunca utilizada en el proyecto `cxorbia-backend-dev`.
- El principal actual no tiene permiso `serviceusage.services.enable`, por lo que no puede habilitarla desde GitHub Actions.

Esto demuestra que el bloqueo ya no es del empalme, de la HR, del código, de los gates ni del trigger de Actions. Es un bloqueo administrativo de Google Cloud: API requerida deshabilitada y principal sin permiso para habilitarla.

## Qué está confirmado y qué no

Confirmado:

- V164 y los overlays/backend de Corte 1A están en la rama viva.
- El adapter live, el watcher, el servicio read-only y los gates predeploy existen y pasan.
- La HR actual puede leerse en CI de forma source-safe.
- No se alteraron `/app/modules/**` ni `/app/core/**` desde backend para resolver este bloqueo.

Aún no confirmado:

- Cloud Run DEV desplegado.
- rewrite same-origin en Hosting DEV.
- actualización visible después de un cambio real en HR.
- coherencia final KPI ↔ modal ↔ histórico ↔ reportes.
- correcciones de reportes y Panorama.
- aprobación visual y freeze de Corte 1.

Por tanto, no es correcto afirmar todavía que solo falta revisión visual.

## Condición de salida

1. Un principal autorizado habilita Cloud Build API y las APIs DEV requeridas que continúen deshabilitadas.
2. Se reejecuta el runner temporal contra `docs-tya-v6-v71-audit`.
3. Cloud Run DEV y Hosting DEV pasan smoke remoto.
4. Un cambio posterior de HR se refleja mediante inicio/foco/sondeo.
5. KPI, detalle, histórico y reportes consumen la misma revisión y facets.
6. Paula realiza revisión visual.
7. Se corrigen diferencias reproducibles.
8. Se elimina el workflow temporal de `main`.
9. Se congela Corte 1 únicamente con `APROBADO`.

## Siguiente paso exacto

`HABILITAR CLOUD BUILD API EN cxorbia-backend-dev CON UN PRINCIPAL SERVICE USAGE ADMIN → REEJECUTAR RUNNER TEMPORAL → CLOUD RUN DEV → HOSTING DEV → SMOKE REMOTO → PRUEBA DE CAMBIO HR → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos. Los intentos no alcanzaron Cloud Run ni Hosting DEV.
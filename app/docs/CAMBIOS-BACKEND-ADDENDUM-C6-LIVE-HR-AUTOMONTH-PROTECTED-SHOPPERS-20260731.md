# CAMBIOS-BACKEND — Corte 6 · HR live automática + shopper protegido

**Fecha:** 2026-07-31  
**Estado:** `AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED_PROVIDER_BLOCK__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## Regla operacional confirmada
- La HR se lee en vivo.
- Cada nueva pestaña mensual válida debe crear/detectar el periodo automáticamente, sin configuración mensual por chat ni operación técnica.
- Julio puede mantener visitas en ejecución mientras el siguiente mes ya tiene visitas disponibles originadas en plataforma.
- Una visita/periodo originado en plataforma puede existir antes de la pestaña HR; cuando HR aparezca, se reconcilia por IDs estables y `assignmentSource`/`assignmentSyncStatus`, sin duplicar ni sobrescribir silenciosamente.
- Nunca deduplicar por nombre.

## Corrección reusable de raíz — descubrimiento mensual
Se eliminó del runtime HR la dependencia de inventario mensual estático como límite operativo.

Cambios:
- `backend/runtime/hr-live-service/server.mjs`: cada `fresh=1` construye desde HR viva y aplica `tya-enforce-live-tab-registry.mjs`; no filtra el runtime contra el inventario estático de julio.
- `tools/hr-source/tya-enforce-live-tab-registry.mjs`: si Google Sheets API está disponible, deriva automáticamente el registry desde metadata provider en cada refresh; si no está disponible, conserva el último registry provider y falla cerrado contra tabs fantasma GViz.
- `app/adapters/tya-live-source-refresh-watch.js` ya refresca cada ~20 s y al recuperar foco/visibilidad; una nueva pestaña válida podrá entrar en runtime sin reload ni configuración manual cuando la metadata provider esté habilitada.
- `backend/runtime/hr-live-service/Dockerfile`: incluye el registry fail-closed de respaldo.
- predeploy `cxorbia/live-hr-runtime-predeploy`: PASS sin deploy.

## Bloqueo provider exacto detectado
Evidencia read-only `LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`:
- proyecto existente: `cxorbia-backend-dev` / projectNumber `87461567267`;
- Google Sheets API: `DISABLED`;
- service account existente: `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`;
- `serviceusage.services.enable`: **no concedido**;
- `run.services.update`: concedido;
- `iam.serviceAccounts.actAs`: concedido;
- `cloudbuild.builds.create`: concedido;
- Drive metadata desde esa identidad: 403 `accessNotConfigured` mientras la capacidad provider no está activada.

Consecuencia: el código automático está preparado y validado, pero con Sheets API deshabilitada el runtime debe mantener fallback fail-closed; no puede afirmar que una pestaña nueva existe a partir de GViz.

## Shopper real — preparación segura
Firestore protegido ya fue validado read-only:
- shoppers 340/340 con nombre real;
- visitas 616/616 con nombre real;
- placeholders 0;
- perfiles canónicos referenciados 194/194 existentes/con nombre real.

Se preparó una ruta DEV autenticada separada del preview público:
- nuevo `app/core/backend-protected-dev-mode.js`;
- `app/index-backend-dev.html` carga Firebase Hosting init del proyecto canónico y permite activar `cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`;
- backend Firestore real solo después de Firebase Auth + custom claims + Firestore Rules;
- Admin/Coordinación puede validar identidad real; shopper queda limitado por su rol/scopes;
- `humanVisualSourceSafe=false` únicamente en esta ruta protegida;
- writes continúan deshabilitados.

No se copiaron nombres al JS source-safe. El preview público puede seguir mostrando `Shopper protegido`; la validación de módulos shopper debe hacerse en runtime DEV protegido.

## Cambios de configuración
`backend/config/tya-phase-a-platform-project-config.source-safe.json` ahora declara:
- `autoDiscoverNewMonthlyTabs=true`;
- `autoCreatePeriodFromDetectedTab=true`;
- `monthlyManualConfigurationRequired=false`;
- `platformOriginMayExistBeforeHrTab=true`;
- `hrArrivalReconcilesExistingPlatformOriginPeriod=true`;
- `platformOriginAllowedBeforeHrTab=true`;
- dedupe por nombre prohibido; conflictos a revisión.

## Gates
PASS read-only:
- `cxorbia/live-hr-current-reconcile`;
- `cxorbia/live-hr-runtime-predeploy`;
- protected identity gate previo.

Provider capability preflight: lectura completada; Sheets API deshabilitada y la identidad disponible no puede habilitarla.

## Clasificación
- **Reusable CXOrbia:** auto-discovery de periodos por metadata provider; runtime polling; fail-closed contra tabs fantasma; separación source-safe/protected runtime; plataforma→HR y HR→plataforma sin duplicación.
- **Exclusivo TyA:** workbook HR Cinépolis, patrón de tabs `<MES> <YY>` / `<MES> <YY> HN`, proyecto `cinepolis`.
- **Claude/prototipo:** no tocar `app/modules/*`; conservar UX; shopper real debe verse solo en runtime protegido, no en source-safe.
- **Academia:** enseñar fuente viva, origen de asignación, conciliación bidireccional, privacidad por capa y gate provider.
- **Sin impacto Claude:** Service Usage/Cloud Run/Hosting DEV gates y preflights.

## Estado seguro
No se ejecutó enable de API, share, Cloud Run deploy, Hosting deploy, Firestore data write, HR write, Auth write, Rules deploy, Storage, Make, Gemini, pagos, merge ni producción. Histórico 1,406/Auth91 preservados.

## Siguiente bloque exacto
Un único bloque de activación, con autorización específica:
1. habilitar Google Sheets API en el proyecto existente `cxorbia-backend-dev` mediante una identidad con `serviceusage.services.enable`;
2. verificar/otorgar solo lectura del HR a la service account existente si fuera necesario;
3. redeploy único del Cloud Run existente `cxorbia-live-hr-dev` con auto-month runtime;
4. redeploy único del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev` para publicar la ruta protegida de shoppers;
5. readback/smoke: detectar HR viva, validar July en curso, validar identidad shopper real y módulos por rol.

No producción ni Firestore data writes en ese bloque.
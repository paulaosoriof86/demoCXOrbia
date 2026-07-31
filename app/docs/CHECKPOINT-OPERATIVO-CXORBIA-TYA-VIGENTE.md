# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data Firestore: cinepolis,14 periodos,616 visitas,currentPeriod2026-07,fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS.
- Identidad protegida: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 3. Regla operacional confirmada
- La HR debe leerse en vivo.
- Cada nueva pestaña mensual válida debe generar/detectar automáticamente el periodo sin configuración por chat.
- Julio puede continuar ejecutándose mientras el siguiente mes ya tiene visitas disponibles de origen plataforma.
- Una visita/periodo `assignmentSource=platform` puede existir antes de la pestaña HR. Cuando HR aparezca se reconcilia por `tenantId/projectId/visitId/hrRowId/shopperId`, sin duplicar ni sobrescribir conflictos.
- Dedupe por nombre: prohibido.

## 4. Auto-month — causa de raíz y fix
El runtime tenía dos problemas: fallback GViz podía aparentar tabs inexistentes y el servicio runtime se filtraba contra inventario estático hasta julio.

Corregido:
- tabs GViz solo se aceptan si figuran en registry provider;
- el runtime ya no usa el inventario estático como límite mensual;
- con Sheets API disponible, cada `fresh=1` regenera registry desde metadata provider y descubre tabs nuevas automáticamente;
- watcher del navegador refresca periódicamente y al volver a foco;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS, sin deploy.

## 5. Bloqueo provider exacto
Preflight read-only:
- proyecto `cxorbia-backend-dev`, projectNumber `87461567267`;
- Google Sheets API `DISABLED`;
- service account `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`;
- no tiene `serviceusage.services.enable`;
- sí tiene `run.services.update`, `iam.serviceAccounts.actAs`, `cloudbuild.builds.create`;
- acceso Drive desde esa identidad devuelve 403 `accessNotConfigured` mientras la capacidad provider no está activada.

Por tanto la automatización mensual está implementada, pero no puede quedar operativa de punta a punta hasta habilitar Sheets API una sola vez en el proyecto existente.

## 6. Shopper real
El problema no es ausencia de datos: Firestore protegido tiene identidad real. El preview público los enmascara por diseño.

Preparado, aún no desplegado:
- `app/core/backend-protected-dev-mode.js`;
- `index-backend-dev.html` usa Firebase Hosting init y activa modo protegido solo con flag DEV explícito;
- Auth + custom claims + Rules obligatorios;
- Admin/Coordinación podrá validar nombres y módulos; shopper queda restringido por rol;
- writes deshabilitados;
- source-safe público permanece sin PII.

## 7. Agosto hoy
HR no tiene tabs de agosto. La afirmación operativa vigente es que julio aún tiene visitas ejecutándose y agosto ya tiene visitas disponibles fuera de HR/plataforma-origin. El sistema debe soportar esa coexistencia y reconciliar cuando aparezcan tabs HR.

No crear agosto por clonación ciega de julio ni escribir Firestore sin la fuente operacional exacta de esas visitas.

## 8. Gate vivo exacto
Un único bloque de activación posterior a autorización:
`ENABLE SHEETS API EN PROYECTO EXISTENTE → VERIFICAR/OTORGAR SOLO LECTURA HR SI HACE FALTA → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Sin producción ni Firestore data writes.

## 9. Estado seguro
No API enable, no share, no Cloud Run/Hosting deploy, no HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes, no merge/producción. Histórico/Auth91 preservados.

## 10. Siguiente autorización requerida
Solo una autorización combinada para activación provider DEV + dos redeploys existentes. La habilitación de Sheets API requiere además una identidad propietaria con `serviceusage.services.enable`; la service account disponible no posee ese permiso.
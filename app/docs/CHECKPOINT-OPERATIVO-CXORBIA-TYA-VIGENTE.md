# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

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
- Una visita/periodo `assignmentSource=platform` puede existir antes de la pestaña HR. Cuando HR aparezca se reconcilia por IDs estables, sin duplicar ni sobrescribir conflictos.
- Dedupe por nombre: prohibido.

## 4. Auto-month — implementado y prevalidado
Corregido:
- runtime no se limita por inventario estático hasta julio;
- `fresh=1` usa metadata Sheets para descubrir meses automáticamente cuando API está disponible;
- fallback GViz conserva último registry provider fail-closed;
- watcher refresca periódicamente y al volver a foco;
- `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

## 5. Provider capability
Read-only preflight:
- proyecto `cxorbia-backend-dev`, projectNumber `87461567267`;
- Google Sheets API `DISABLED`;
- service account `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` no tiene `serviceusage.services.enable`;
- sí tiene `run.services.update`, `iam.serviceAccounts.actAs`, `cloudbuild.builds.create`.

Drive metadata confirma que **esa misma service account ya es reader del HR canónico**, así que no hace falta una nueva cuenta ni compartir de nuevo; tras habilitar Sheets API solo corresponde revalidar acceso.

## 6. P0 de seguridad HR
El HR canónico tiene permiso `anyone=writer`. Cualquier persona con el enlace puede editar la fuente operativa.

Clasificación: `P0_PROVEN_SECURITY_SOURCE_SHARING`.

Antes de producción debe removerse el acceso público writer y quedar restringido a usuarios autorizados, manteniendo la service account como reader. No se cambió sharing porque no existe autorización provider específica y la herramienta disponible no expone eliminación de ese permiso.

## 7. Shopper real
Firestore protegido sí tiene los datos. El preview público los enmascara deliberadamente.

Preparado, no desplegado:
- `app/core/backend-protected-dev-mode.js`;
- `index-backend-dev.html` con Firebase Hosting init;
- Auth + custom claims + Rules obligatorios;
- Admin/Coordinación ve identidad real, shopper solo su scope;
- read-only, writes bloqueados;
- sin PII en source-safe.

Un redeploy Hosting DEV autorizado hará visible esta ruta para la comprobación de módulos shopper.

## 8. Julio/agosto
HR todavía no tiene tabs de agosto. Operativamente julio puede continuar en ejecución y agosto puede existir como disponibilidad platform-origin antes de HR. El sistema ya tiene este contrato configurado.

Las fuentes inspeccionadas todavía no contienen el registro exacto source-of-truth de las visitas agosto platform-origin. Ese origen exacto debe recuperarse/conectarse antes de materializar el delta; no clonar julio ni inferir IDs/ubicaciones/estado.

## 9. Gate vivo exacto
`CORREGIR SHARING HR P0 + HABILITAR SHEETS API EN PROYECTO EXISTENTE → REVALIDAR SERVICE ACCOUNT READER → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Después: recuperar/conectar fuente operacional exacta agosto → delta-only autorizado → preprod/cutover.

## 10. Academia
Fuente: `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`. Patrón reusable: auto-month + platform-origin + conciliación + sharing mínimo + source-safe/protected runtime.

## 11. Estado seguro
No API enable, no sharing change, no Cloud Run/Hosting deploy, no HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes, no merge/producción. Histórico/Auth91 preservados.
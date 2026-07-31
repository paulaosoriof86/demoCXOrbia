# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__DEV_REDEPLOY_AUTH_RETAINED__SHEETS_API_DISABLED__HR_PUBLIC_WRITE_P0__NO_DEPLOY__NO_PRODUCTION`

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

## 5. Autorización DEV y preflight actual
Paula autorizó un único redeploy del Cloud Run DEV existente y un único redeploy del Hosting DEV existente, condicionados a verificar primero Sheets API habilitada y HR restringido con la service account como reader.

Revalidación read-only ejecutada `2026-07-31T02:06:59.600Z`:
- Google Sheets API: `DISABLED`, `enabled=false`;
- service account sin `serviceusage.services.enable`;
- sí conserva `run.services.update`, `iam.serviceAccounts.actAs`, `cloudbuild.builds.create`;
- Drive metadata directa: HR todavía tiene `anyone=writer`;
- la service account existente continúa como `reader` del HR.

Las precondiciones fallaron, por lo que Cloud Run deploy=0 y Hosting deploy=0. La autorización queda **retenida/no consumida** para ejecutarse una sola vez cuando ambas precondiciones pasen y el alcance no cambie.

## 6. P0 de seguridad HR
El HR canónico mantiene permiso `anyone=writer`. Cualquier persona con el enlace puede editar la fuente operativa.

Clasificación: `P0_PROVEN_SECURITY_SOURCE_SHARING`.

Debe removerse el acceso público writer y quedar restringido a usuarios autorizados, manteniendo la service account como reader. No se ejecutó cambio de sharing en este bloque.

## 7. Shopper real
Firestore protegido sí tiene los datos. El preview público los enmascara deliberadamente.

Preparado, no desplegado:
- `app/core/backend-protected-dev-mode.js`;
- `index-backend-dev.html` con Firebase Hosting init;
- Auth + custom claims + Rules obligatorios;
- Admin/Coordinación ve identidad real, shopper solo su scope;
- read-only, writes bloqueados;
- sin PII en source-safe.

El redeploy Hosting DEV autorizado se ejecutará únicamente después del PASS de las dos precondiciones.

## 8. Julio/agosto
HR todavía no tiene tabs de agosto. Operativamente julio puede continuar en ejecución y agosto puede existir como disponibilidad platform-origin antes de HR. El sistema ya tiene este contrato configurado.

Las fuentes inspeccionadas todavía no contienen el registro exacto source-of-truth de las visitas agosto platform-origin. Ese origen exacto debe recuperarse/conectarse antes de materializar el delta; no clonar julio ni inferir IDs/ubicaciones/estado.

## 9. Gate vivo exacto
`SHEETS API ENABLED + HR RESTRICTED (SERVICE ACCOUNT READER PRESERVED) → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No pedir nueva autorización para esos dos redeploys si el alcance no cambia: la autorización vigente está retenida y no consumida.

Después: recuperar/conectar fuente operacional exacta agosto → delta-only autorizado → preprod/cutover.

## 10. Academia
Fuentes: `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md` y addendum de autorización/precondiciones. Patrón reusable: auto-month + platform-origin + conciliación + sharing mínimo + precondition-first deploy.

## 11. Estado seguro
No API enable, no sharing change, no Cloud Run/Hosting deploy, no HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes, no merge/producción. Histórico/Auth91 preservados.

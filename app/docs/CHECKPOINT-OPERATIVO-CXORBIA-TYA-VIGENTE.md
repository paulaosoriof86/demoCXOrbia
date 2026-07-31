# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__DEV_REDEPLOY_AUTH_RETAINED__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__NO_DEPLOY__NO_PRODUCTION`

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
- runtime no se limita por inventario estático hasta julio;
- `fresh=1` usa metadata Sheets para descubrir meses automáticamente;
- fallback GViz conserva último registry provider fail-closed;
- watcher refresca periódicamente y al volver a foco;
- `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

## 5. Autorización DEV y preflight actual
Paula autorizó un único redeploy del Cloud Run DEV existente y un único redeploy del Hosting DEV existente, condicionados a verificar primero Sheets API habilitada y HR restringido con la service account como reader.

Revalidación read-only `2026-07-31T02:26:46.862Z`:
- Google Sheets API: `ENABLED`;
- service account puede leer la HR canónica por Sheets API: HTTP 200;
- HR canónica: 30 tabs, 28 mensuales, último `JULIO 26 HN`;
- decisión provider: `PASS_SHEETS_API_AND_CANONICAL_HR_READER`.

Sharing directo de Drive:
- HR canónica todavía tiene `anyone=writer`;
- service account sigue `reader`;
- existe otra hoja homónima con una sola pestaña `Hoja 1` que sí está restringida; no es la fuente canónica.

Por tanto Cloud Run deploy=0 y Hosting deploy=0. La autorización queda **retenida/no consumida**.

## 6. P0 de seguridad HR
Bloqueante único actual: remover `anyone=writer` de la HR canónica de 30 tabs y dejarla restringida a usuarios autorizados, preservando la service account como reader.

## 7. Shopper real
Firestore protegido sí tiene los datos. Preparado, no desplegado:
- `app/core/backend-protected-dev-mode.js`;
- `index-backend-dev.html` con Firebase Hosting init;
- Auth + custom claims + Rules obligatorios;
- Admin/Coordinación ve identidad real, shopper solo su scope;
- read-only, writes bloqueados;
- sin PII en source-safe.

## 8. Julio/agosto
HR todavía no tiene tabs de agosto. Julio puede continuar en ejecución y agosto puede existir como disponibilidad platform-origin antes de HR. El origen exacto de esas visitas se recupera/conecta antes del delta Firestore; no clonar julio ni inferir IDs/ubicaciones/estado.

## 9. Gate vivo exacto
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No pedir nueva autorización para esos dos redeploys si el alcance no cambia.

Después: recuperar/conectar fuente operacional exacta agosto → delta-only autorizado → preprod/cutover.

## 10. Academia
Patrón reusable: auto-month + platform-origin + conciliación + sharing mínimo + distinguir fuente canónica por provider ID/estructura y no solo por título.

## 11. Estado seguro
Sheets API quedó habilitada por acción externa del owner. Desde este bloque: provider reads únicamente; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false. Histórico/Auth91 preservados.

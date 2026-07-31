# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_PREPARED`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- Corte5:1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones; CX.data14 periodos/current2026-07 PASS.
- Corte6: Auth91/91, claims5/5, Rules PASS; auto-entry Admin observado; Firestore protegido shoppers340/340 y visitas616/616 con identidad real, placeholders0.

## 2. HR auto-month — implementado en código
- runtime live ya no se limita al inventario estático de meses;
- una lectura `fresh=1` usa metadata provider para descubrir tabs mensuales nuevas cuando Sheets API está disponible;
- fallback GViz usa registry provider fail-closed y no acepta tabs fantasma;
- watcher refresca ~20 s/focus/visibility;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

## 3. Provider y seguridad
- Google Sheets API de `cxorbia-backend-dev`: `DISABLED`.
- Service account no tiene `serviceusage.services.enable`, pero ya es `reader` del HR canónico y sí tiene capacidad Cloud Run/actAs/Cloud Build.
- P0 probado: el HR canónico tiene `anyone=writer`. Debe quitarse el acceso público de edición antes de producción y mantener solo usuarios autorizados + service account reader.

## 4. Shopper real
La identidad real ya existe. Se preparó ruta DEV autenticada separada del preview source-safe para probar módulos con datos reales según Auth/claims/Rules. Pendiente de un único redeploy Hosting DEV autorizado; no se tocó `app/modules/*`.

## 5. Julio/agosto
Julio puede seguir ejecutándose mientras agosto ya está disponible como origen plataforma antes de HR. La llegada futura de tabs HR debe conciliar por IDs estables y no duplicar.

El source-of-truth exacto de las visitas agosto platform-origin todavía no aparece en las fuentes inspeccionadas. No copiar julio ni inferir datos. Ese origen se recupera/conecta antes del delta Firestore.

## 6. Siguiente bloque
`CORREGIR SHARING HR P0 + ENABLE SHEETS API EXISTENTE → REVALIDAR HR READER → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Luego: fuente operacional exacta agosto → delta-only autorizado → readback/preprod/cutover.

## 7. Claude/Academia
- Claude: preservar UX, no nueva candidata, no `app/modules/*`; source-safe no sustituye identidad real.
- Academia: auto-month, plataforma-origin antes de HR, conciliación, provider capability, sharing mínimo y privacidad por capa.

## 8. Estado seguro
API enable0; sharing changes0; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
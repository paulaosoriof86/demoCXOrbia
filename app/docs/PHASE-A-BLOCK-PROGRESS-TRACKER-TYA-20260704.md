# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_PREPARED`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- Corte5:1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones; CX.data14 periodos/current2026-07 PASS.
- Corte6: Auth91/91, claims5/5, Rules PASS; auto-entry Admin observado; Firestore protegido shoppers340/340 y visitas616/616 con identidad real, placeholders0.

## 2. HR auto-month — implementado en código
- runtime live ya no se limita al inventario estático de meses;
- `fresh=1` usa metadata provider para descubrir tabs mensuales nuevas;
- fallback GViz usa registry provider fail-closed y no acepta tabs fantasma;
- watcher refresca ~20 s/focus/visibility;
- predeploy `cxorbia/live-hr-runtime-predeploy` PASS sin deploy.

## 3. Provider — PASS
- Google Sheets API de `cxorbia-backend-dev`: `ENABLED`.
- Service account puede leer la HR canónica mediante Sheets API: PASS.
- HR canónica: 30 tabs / 28 mensuales / último `JULIO 26 HN`.

## 4. P0 seguridad — único bloqueo inmediato
La HR canónica todavía tiene `anyone=writer`. Debe quitarse acceso público de edición y mantener usuarios autorizados + service account reader.

Existe una hoja homónima con una sola pestaña `Hoja 1` que sí está restringida; no es la fuente canónica. Identificar fuente por provider ID/estructura, no por título.

## 5. Shopper real
La identidad real ya existe. Ruta DEV autenticada separada del preview source-safe está preparada para probar módulos con datos reales según Auth/claims/Rules. Pendiente del Hosting DEV redeploy ya autorizado, retenido/no consumido.

## 6. Julio/agosto
Julio puede seguir ejecutándose mientras agosto está disponible como origen plataforma antes de HR. La llegada futura de tabs HR debe conciliar por IDs estables y no duplicar.

El source-of-truth exacto de las visitas agosto platform-origin todavía no aparece en las fuentes inspeccionadas. No copiar julio ni inferir datos.

## 7. Siguiente bloque
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → REVALIDACIÓN READ-ONLY PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

Luego: fuente operacional exacta agosto → delta-only autorizado → readback/preprod/cutover.

## 8. Claude/Academia
- Claude: preservar UX, no nueva candidata, no `app/modules/*`; source-safe no sustituye identidad real.
- Academia: auto-month, plataforma-origin antes de HR, conciliación, provider capability, sharing mínimo, privacidad por capa y fuente canónica por identidad provider.

## 9. Estado seguro
Desde este bloque: provider reads + repo/docs; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.

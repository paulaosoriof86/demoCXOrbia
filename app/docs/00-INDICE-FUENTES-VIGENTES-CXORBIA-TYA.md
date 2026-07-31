# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__DEV_REDEPLOY_AUTH_RETAINED__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.
- No crear Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-DEV-REDEPLOY-AUTH-PRECONDITIONS-HOLD-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-LIVE-HR-AUTOMONTH-PROTECTED-SHOPPERS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
8. `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`;
9. `evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`;
10. `evidence/LIVE-HR-SHARING-REVALIDATION-LATEST.json`;
11. `evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json`;
12. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
13. `backend/runtime/hr-live-service/server.mjs`;
14. `app/core/backend-protected-dev-mode.js`;
15. `app/index-backend-dev.html`;
16. `backend/config/tya-phase-a-platform-project-config.source-safe.json`;
17. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth legacy91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 con nombre real; visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 4. Regla operacional viva
- HR se lee en vivo.
- Una pestaña mensual nueva válida se incorpora automáticamente como periodo, sin configuración mensual por chat.
- Julio puede seguir ejecutándose mientras el siguiente mes tiene visitas disponibles originadas en plataforma.
- Plataforma→HR y HR→plataforma se concilian con IDs estables + `assignmentSource`/`assignmentSyncStatus`; no duplicar y nunca deduplicar por nombre.

## 5. Provider HR — PASS parcial
Revalidación `2026-07-31T02:26:46.862Z`:
- Google Sheets API `ENABLED`;
- service account puede leer la HR canónica por Sheets API: PASS;
- HR canónica: 30 tabs / 28 mensuales / último `JULIO 26 HN`;
- decisión: `PASS_SHEETS_API_AND_CANONICAL_HR_READER`.

El preflight fue corregido para validar la HR por Sheets API directamente; Drive API no es requisito del runtime.

## 6. P0 de seguridad HR aún vivo
Metadata Drive de la HR canónica de 30 tabs sigue mostrando `anyone=writer`. La service account permanece `reader`.

Existe otra hoja con el mismo título pero con una sola pestaña `Hoja 1`, restringida. No es la fuente canónica. La fuente debe distinguirse por provider ID/estructura, no por nombre visual.

## 7. Autorización DEV retenida
Paula autorizó 1x redeploy Cloud Run DEV `cxorbia-live-hr-dev` + 1x redeploy Hosting DEV `cxorbia-backend-dev/cxorbia-dev`, únicamente después de Sheets API PASS + HR canónica restringida + service account reader.

Sheets API/reader ya PASS. Sharing canónico aún FAIL. Por fail-closed ambos deploys siguen en 0 y la autorización está retenida/no consumida.

## 8. Shopper real
La identidad real ya existe en Firestore protegido. La ruta DEV autenticada está preparada y se publicará con el Hosting redeploy autorizado una vez cierre el P0 de sharing. No copiar PII al source-safe.

## 9. Julio/agosto
HR todavía no tiene tabs de agosto. La arquitectura acepta agosto platform-origin antes de HR y reconciliación posterior. El source-of-truth exacto de esas visitas se conecta antes del delta Firestore; no fabricar copiando julio.

## 10. Gate vivo único
`HR CANÓNICA 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

Después: fuente exacta agosto platform-origin → delta-only autorizado → preprod/cutover.

## 11. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. Desde este bloque: provider reads y repo/docs; Cloud Run/Hosting deploy0; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; PII exportada0.

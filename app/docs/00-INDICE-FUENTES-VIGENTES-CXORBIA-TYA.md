# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_AND_HR_READER_PASS__OPEN_READ_VALID__DEV_GATE_CORRECTED__REDEPLOY_AUTH_NOT_CONSUMED__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-CORRECCION-LECTURA-ABIERTA-HR-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-LIVE-HR-AUTOMONTH-PROTECTED-SHOPPERS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
8. `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`;
9. `evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`;
10. `backend/runtime/hr-live-service/server.mjs`;
11. `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
12. `app/core/backend-protected-dev-mode.js`;
13. `app/index-backend-dev.html`;
14. `backend/config/tya-phase-a-platform-project-config.source-safe.json`;
15. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: cinepolis,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0.

## 4. HR viva — regla corregida
- La HR se lee en vivo.
- Lectura abierta/source-safe es válida y ya estaba soportada mediante fallback GViz público read-only.
- Sheets API está `ENABLED` y la service account puede leer la HR canónica: PASS.
- Nueva pestaña mensual válida debe incorporarse automáticamente sin configuración mensual manual.
- El sharing `Restricted` **no es requisito técnico de lectura ni de redeploy DEV**.

Drive reporta `anyone=writer`; eso se trata separadamente como revisión/hardening de permisos antes de producción si representa edición pública no deseada. No volver a mezclar lectura y edición.

## 5. Shopper real
La identidad real ya existe en Firestore protegido. Ruta DEV autenticada preparada para mostrarla según Auth/claims/Rules; source-safe puede seguir enmascarado.

## 6. Autorización DEV
La autorización previa de 1x Cloud Run DEV + 1x Hosting DEV sigue no consumida, pero contenía la condición `HR restringido` sugerida por ChatGPT. Como el gate fue corregido, no ampliar esa autorización por inferencia.

Gate correcto:
`SHEETS API ENABLED + HR CANÓNICA READABLE + SERVICE ACCOUNT READER → CONFIRMACIÓN EXPRESA DEL GATE CORREGIDO → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

## 7. Julio/agosto
Julio puede seguir ejecutándose mientras agosto existe como platform-origin antes de HR. Cuando aparezcan tabs de agosto, reconciliar por IDs estables; no duplicar ni fabricar copiando julio.

## 8. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Cloud Run/Hosting deploy0 en este bloque; HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0.

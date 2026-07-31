# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

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
5. `CAMBIOS-BACKEND-ADDENDUM-C6-LIVE-HR-AUTOMONTH-PROTECTED-SHOPPERS-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
7. `evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`;
8. `evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json`;
9. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
10. `backend/runtime/hr-live-service/server.mjs`;
11. `app/core/backend-protected-dev-mode.js`;
12. `app/index-backend-dev.html`;
13. `backend/config/tya-phase-a-platform-project-config.source-safe.json`;
14. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth legacy91/91; claims5/5; Rules PASS.
- Firestore protegido: shoppers340/340 con nombre real; visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 4. Regla operacional viva
- La HR se lee en vivo.
- Una pestaña mensual nueva válida debe incorporarse automáticamente como periodo, sin configuración mensual por chat.
- Julio puede seguir ejecutándose mientras el siguiente mes ya tiene visitas disponibles originadas en plataforma.
- Plataforma→HR y HR→plataforma se concilian con IDs estables + `assignmentSource`/`assignmentSyncStatus`; no duplicar y nunca deduplicar por nombre.
- Una visita/periodo de plataforma puede existir antes de la pestaña HR; la llegada posterior de HR reconcilia, no reemplaza silenciosamente.

## 5. Auto-month runtime — código PASS, provider bloqueado
Se eliminó el límite operativo del inventario mensual estático. El runtime `fresh=1` ya está preparado para descubrir tabs desde metadata Google Sheets y el watcher refresca periódicamente/focus.

Predeploy: `PASS` sin deploy.

Bloqueo exacto read-only:
- Google Sheets API en `cxorbia-backend-dev`: `DISABLED`;
- service account existente no tiene `serviceusage.services.enable`;
- sí tiene `run.services.update`, `iam.serviceAccounts.actAs` y `cloudbuild.builds.create`;
- mientras API siga deshabilitada, fallback usa último registry provider fail-closed y rechaza tabs fantasma GViz.

## 6. Shopper real — preparado para validación DEV protegida
El dato real ya existe en Firestore protegido. Se preparó ruta autenticada DEV separada del preview público:
- `backend-protected-dev-mode.js`;
- Firebase Hosting canonical init en `index-backend-dev.html`;
- Auth/custom claims/Rules obligatorios;
- backend read-only, `humanVisualSourceSafe=false` solo en ruta protegida;
- no PII en JS source-safe.

Aún **no se desplegó** esta ruta; requiere un único redeploy Hosting DEV autorizado.

## 7. Agosto hoy
No existen todavía tabs HR de agosto. Por tanto HR no puede ser fuente de esas visitas hoy. La arquitectura acepta que agosto disponible sea de origen plataforma y que después se concilie contra HR cuando aparezca.

No fabricar agosto copiando julio ni declarar datos exactos que no provengan de una fuente operacional real.

## 8. Gate vivo único
`ACTIVAR SHEETS API EXISTENTE + VERIFICAR READ-ONLY HR → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Requiere autorización explícita de provider/deploy. No producción ni Firestore data writes.

## 9. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. Últimos bloques: provider reads + repo/docs; API enable0, Cloud Run deploy0, Hosting deploy0, HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; PII exportada0.
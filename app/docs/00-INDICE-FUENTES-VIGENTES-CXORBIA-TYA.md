# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PASS__HR_AUTOMONTH_CODE_PASS__SHEETS_API_DISABLED__HR_PUBLIC_WRITE_P0__PROTECTED_SHOPPER_RUNTIME_PREPARED__NO_DEPLOY__NO_PRODUCTION`

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
7. `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`;
8. `evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`;
9. `evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json`;
10. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
11. `backend/runtime/hr-live-service/server.mjs`;
12. `app/core/backend-protected-dev-mode.js`;
13. `app/index-backend-dev.html`;
14. `backend/config/tya-phase-a-platform-project-config.source-safe.json`;
15. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

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
El runtime ya no queda limitado por inventario mensual estático. Con Sheets API activa, `fresh=1` descubre tabs desde metadata provider y el watcher refresca periódicamente/focus. En fallback GViz conserva registry provider fail-closed.

Predeploy: PASS sin deploy.

Provider preflight:
- Sheets API en `cxorbia-backend-dev`: `DISABLED`;
- service account no tiene `serviceusage.services.enable`;
- service account **ya es reader del HR canónico**;
- sí tiene capacidad de actualizar Cloud Run/actAs/iniciar Cloud Build.

Por tanto no hace falta crear nueva cuenta ni compartir de nuevo el HR; hace falta habilitar Sheets API una sola vez y revalidar.

## 6. P0 de seguridad HR
Permisos reales del HR canónico muestran `anyone=writer`. Esto permite edición del HR a cualquier persona con el enlace y bloquea cutover productivo.

Debe quedar `Restricted`/restringido a usuarios autorizados, manteniendo la service account existente como `reader`. El cambio de sharing no se ejecutó porque requiere acción/autorización provider específica.

## 7. Shopper real — preparado para validación DEV protegida
El dato real ya existe en Firestore protegido. Se preparó ruta autenticada DEV separada del preview público con Firebase Auth/custom claims/Rules, read-only y `humanVisualSourceSafe=false` solo allí.

Aún no se desplegó esta ruta; requiere un único redeploy Hosting DEV autorizado. No se copia PII al source-safe.

## 8. Agosto hoy
No existen todavía tabs HR de agosto. La arquitectura acepta que agosto disponible sea de origen plataforma y que después se concilie contra HR cuando aparezca. No fabricar agosto copiando julio.

## 9. Gate vivo único
`CORREGIR SHARING HR P0 + ENABLE SHEETS API EXISTENTE → REVALIDAR HR READER → REDEPLOY CLOUD RUN DEV AUTO-MONTH → REDEPLOY HOSTING DEV PROTECTED SHOPPER → READBACK/SMOKE`.

Requiere autorización explícita de provider/deploy. No producción ni Firestore data writes.

## 10. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. API enable0, sharing changes0, Cloud Run deploy0, Hosting deploy0, HR/Firestore/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; PII exportada0.
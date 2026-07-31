# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__88_USERNAME_DELTA_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Cloud Run DEV: `cxorbia-live-hr-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-PROFILE-AUTH-HISTORY-READONLY-PASS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-USERNAME-DELTA-READONLY-PASS-20260731.md`;
8. `evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`;
9. `evidence/CORTE6-USERNAME-DELTA-READONLY-LATEST.json`;
10. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
11. `app/core/backend-config-preview-dev.js`;
12. `app/core/backend-protected-dev-mode.js`;
13. `app/adapters/tya-live-source-refresh-watch.js`;
14. `app/core/backend-browser-auth.js`;
15. `app/core/backend-firebase.js`;
16. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 4. P0 visual
Corte6 sigue abierto porque la visual anterior usó `display_name_only` y el acceso Shopper terminó con `shopperId=null`.

No usar `sh1`, selector anónimo ni match por nombre como solución final.

## 5. Provider protected read-only — PASS
Firestore:
- shoppers340;
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Auth:
- usuarios108;
- shopper claim con shopperId91;
- perfil existente91/91;
- missing0.

Histórico:
- visitas616;
- 616/616 con shopperId;
- 194 perfiles referenciados y existentes194/194;
- estados: submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 6. Fix protegido preparado
Sin deploy:
- protected lane ya no es sobreescrito por `forceHumanVisualSourceSafe()`;
- watcher source-safe se desactiva cuando protected runtime posee CX.data;
- aliases de perfil usan solo valores reales;
- KPI/histórico protegidos reconocen todo el ciclo canónico, incluyendo `submitida`;
- password nunca se sintetiza.

Syntax + marcadores P0: PASS en GitHub read-only.

## 7. Username exacto
Desde el handoff cifrado:
- shopper records109;
- match exacto88;
- Auth claim binding88/88;
- delta username `fill-missing-only`88;
- conflictos0;
- 21 sin perfil exacto: HOLD.

No hubo write. Materializar esos 88 requiere autorización Firestore específica.

## 8. Password / perfil extra
Firebase Auth no permite recuperar la contraseña vigente. No guardar password en Firestore/JS/repo.

Los datos adicionales de la plataforma vigente se recuperan únicamente desde export/import cifrado y matching estable. Nunca conectar la RTDB vieja.

## 9. Gate vivo
`WRITE PLAN USERNAME88 SIN EJECUTAR + RECONCILIACIÓN CIFRADA DEL PERFIL EXTRA → AUTORIZACIONES EXACTAS SI APLICAN → NUEVO REDEPLOY DEV → HUMAN VISUAL PROTEGIDA → FREEZE C6`.

## 10. Julio/agosto
HR live/auto-month permanece PASS. No iniciar delta agosto hasta cerrar P0 y congelar Corte6.

## 11. Estado seguro
Producción no tocada; PR#7 draft/open/no merge. Provider reads sí; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0.

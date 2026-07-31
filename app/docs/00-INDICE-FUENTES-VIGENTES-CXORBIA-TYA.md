# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

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
6. `CAMBIOS-BACKEND-ADDENDUM-C6-LIVE-HR-SHOPPER-DISPLAY-DEV-PASS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
8. `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`;
9. `evidence/CORTE6-LIVE-HR-SHOPPER-DISPLAY-DEV-DEPLOY-LATEST.json`;
10. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
11. `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json`;
12. `app/core/backend-protected-dev-mode.js`;
13. `app/core/backend-browser-auth.js`;
14. `app/core/backend-firebase.js`;
15. `app/app.js`;
16. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 CX.data: cinepolis,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 4. Último redeploy DEV — PASS técnico
One-shot `chat-20260731-c6-live-hr-shopper-display-dev-redeploy-01`: **consumido**.

- Cloud Run executions1; revisión `cxorbia-live-hr-dev-00008-8mf`.
- Hosting executions1; version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`; release `sites/cxorbia-backend-dev/releases/1785467713768000`.
- Remote:14 periodos,616 visitas, auto-month PASS,208 identidades display-only.

No reutilizar esa autorización.

## 5. Validación humana — FAIL / P0 PROVEN
Las capturas de Paula demuestran:
- Admin source-safe sí ve nombres;
- perfil Admin no muestra username/password/teléfono ni campos adicionales;
- histórico por shopper visible incompleto;
- Shopper entra como `Evaluador (sin identidad)` con `shopperId=null`;
- Mi Perfil/Mis Visitas quedan fail-closed.

Causa reproducible en `app/app.js`: el host DEV alojado no satisface `_isDevAccess()` en la ruta source-safe y el acceso Shopper cae a `selectRole('shopper')` sin ID.

Corte6 **NO se congela**.

## 6. Arquitectura correcta de datos de shopper
- Public/source-safe: puede permanecer enmascarado.
- Superadmin/Admin autenticado: debe ver los datos operativos completos que existan y estén autorizados.
- Shopper autenticado: solo su propio perfil/scope.
- Cliente: no recibe PII de shoppers.

El perfil completo se sirve desde backend protegido; no se copia PII/credenciales a JS estático ni repo.

## 7. Credenciales
Regla TyA: username `nombre.apellido` y contraseña inicial histórica tipo `Nombre123*`.

Firebase Auth no devuelve la contraseña actual. Se preserva username + estado de credencial; contraseña legacy/inicial solo si existe evidencia segura. Reset al patrón requiere gate Auth específico.

## 8. Plataforma vigente / legacy
Existe export reciente con `tya_shoppers_extra` y datos adicionales aportados por shoppers. Recuperar únicamente por export/import; nunca conectar la base vieja. Matching por IDs/evidencia estable; conflictos a review; no dedupe por nombre/teléfono.

## 9. Gate vivo
`PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY / LEGACY EXPORT RECONCILIATION → EXACT DELTA PLAN → AUTH/FIRESTORE GATES SI APLICAN → NUEVO REDEPLOY DEV SOLO CON AUTORIZACIÓN → HUMAN VISUAL`.

## 10. Julio/agosto
No iniciar delta agosto hasta cerrar este P0. No copiar julio ni repetir histórico.

## 11. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Desde la visual: nuevos provider writes/deploys0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0. Autorización anterior consumida.

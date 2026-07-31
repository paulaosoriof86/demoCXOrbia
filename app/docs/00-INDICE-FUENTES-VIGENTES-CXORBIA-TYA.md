# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_ONE_HOSTING_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-PROFILE-AUTH-HISTORY-READONLY-PASS-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-PERFIL-COMPLETO-AUTORIZADO-V2-20260731.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-PERFIL-COMPLETO-V2-READONLY-PASS-20260731.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-HOSTING-DEV-REDEPLOY-PASS-20260731.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-LOGIN-REPROCESO-ROOT-FIX-20260731.md`;
11. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
12. `evidence/CORTE6-PROTECTED-RUNTIME-HOSTING-DEPLOY-LATEST.json`;
13. `backend/config/corte6-profile-full-firestore-write-request-v2.json`;
14. `backend/config/corte6-credential-continuity-hosting-request.json`;
15. `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`;
16. `app/core/backend-config-preview-dev.js`;
17. `app/core/backend-protected-dev-mode.js`;
18. `app/core/backend-protected-dev-session-continuity.js`;
19. `app/core/backend-browser-auth.js`;
20. `app/core/backend-firebase.js`;
21. `app/adapters/tya-live-source-refresh-watch.js`;
22. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.

## 4. Protected Hosting DEV anterior — PASS técnico
Un redeploy protegido quedó verificado remotamente: versión `sites/cxorbia-backend-dev/versions/df3b5ce0359bcadd`, release `sites/cxorbia-backend-dev/releases/1785513222990000`.

## 5. Nuevo P0 visual — reproceso de login
La captura humana demostró que Administración/Coordinación vuelve a abrir Usuario/Contraseña. Causa raíz: el carril protegido usaba persistencia Firebase Auth `SESSION` y el bridge de navegador también la forzaba. El gate de autenticación real estaba contaminando cada iteración visual.

## 6. Corrección de raíz preparada — sin deploy nuevo
- `backend-protected-dev-session-continuity.js` fuerza persistencia `LOCAL` exclusivamente en protected DEV;
- no embebe credenciales/tokens/UID;
- no bypass claims/Rules;
- `backend-protected-dev-mode.js` declara `persist:'local'` + `reuseAuthenticatedSession:true`;
- `index-backend-dev.html` carga continuidad antes de `backend-browser-auth.js`.

Resultado esperado: primera autenticación real válida una sola vez por navegador; refresh/redeploy posteriores restauran silenciosamente la sesión mientras no se haga logout explícito.

## 7. Gate vivo
`AUTORIZACIÓN ONE-SHOT 1x HOSTING DEV PARA SESSION CONTINUITY → REMOTE SMOKE → 1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

No reutilizar la autorización Hosting anterior: ya está consumida.

## 8. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 9. Estado seguro
PR#7 draft/open/no merge; producción no tocada. Desde el último deploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0. Corrección de continuidad preparada solamente en repo.

# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

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
15. `backend/config/corte6-protected-session-continuity-hosting-execute.json`;
16. `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`;
17. `app/core/backend-config-preview-dev.js`;
18. `app/core/backend-protected-dev-mode.js`;
19. `app/core/backend-protected-dev-session-continuity.js`;
20. `app/core/backend-browser-auth.js`;
21. `app/core/backend-firebase.js`;
22. `app/adapters/tya-live-source-refresh-watch.js`;
23. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.

## 4. Protected session continuity Hosting DEV — PASS
Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida.

- exactamente1 Hosting DEV redeploy;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `sites/cxorbia-backend-dev/versions/1e8c37163e7451be`;
- release `sites/cxorbia-backend-dev/releases/1785515981786000`;
- persistencia Firebase `LOCAL` verificada remotamente;
- credenciales embebidas=false;
- Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0;
- producción=false; merge=false.

## 5. Gate vivo
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

URL protegida:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`

## 6. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 7. Estado seguro
PR#7 draft/open/no merge; producción no tocada. Autorizaciones one-shot del perfil y Hosting están consumidas.

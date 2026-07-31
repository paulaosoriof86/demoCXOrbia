# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__NO_CREDENTIAL_FULL_VISUAL_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_HOLD__NO_PRODUCTION`

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
5. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-NO-CREDENTIALS-ROOT-FIX-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md` **vigente para el gate actual**;
7. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
8. `evidence/CORTE6-HUMAN-FULL-VISUAL-REDEPLOY-LATEST.json`;
9. `backend/config/corte6-human-full-visual-redeploy-request.json`;
10. `backend/config/corte6-human-full-visual-execute.json`;
11. `backend/runtime/hr-live-service/dev-visual.mjs`;
12. `app/adapters/tya-dev-full-visual-bridge.js`;
13. `app/adapters/tya-live-source-refresh-watch.js`;
14. `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`;
15. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.

## 4. Human visual sin credenciales — PASS técnico
Paula no usa credenciales técnicas Firebase para QA. Auth/claims/Rules quedan como gate técnico separado.

Authorization `chat-20260731-corte6-human-full-visual-no-credential-01` consumida PASS:
- Cloud Run deploys1;
- Hosting deploys1;
- Cloud Run revision `cxorbia-live-hr-dev-00009-xs8`;
- decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`;
- full-profile fail-closed401 sin sesión visual;
- auto-entry y shopper picker preservados;
- source-safe default preservado;
- provider data writes0; merge=false; producción=false.

## 5. Gate vivo
`ENLACE TEMPORAL SIN CREDENCIALES → HUMAN VISUAL ADMIN + SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 6. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 7. Estado seguro
Autorización one-shot consumida; PR#7 draft/open/no merge; producción no tocada.

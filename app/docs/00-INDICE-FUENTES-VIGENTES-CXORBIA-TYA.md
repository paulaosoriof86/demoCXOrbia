# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

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
11. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-NO-CREDENTIALS-ROOT-FIX-20260731.md` **prevalece para human visual**;
12. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
13. `evidence/CORTE6-PROTECTED-RUNTIME-HOSTING-DEPLOY-LATEST.json`;
14. `backend/config/corte6-human-full-visual-redeploy-request.json`;
15. `backend/runtime/hr-live-service/dev-visual.mjs`;
16. `app/adapters/tya-dev-full-visual-bridge.js`;
17. `app/adapters/tya-live-source-refresh-watch.js`;
18. `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`;
19. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.

## 4. Corrección metodológica human visual
Paula no posee ni debe recibir credenciales técnicas Firebase para QA. El contrato correcto es:
- **human visual:** auto-entry del prototipo, sin prompt de usuario/contraseña Firebase;
- **Auth/claims/Rules:** gate técnico/provider separado.

La ruta protected browser-auth queda disponible para pruebas técnicas, pero deja de ser requisito de visual humana.

## 5. Fix no-credential preparado — sin provider mutation
Se preparó un proxy server-side read-only sobre el Cloud Run DEV existente y un bridge human visual que:
- lee perfil completo Firestore con identidad técnica server-side;
- exige sesión visual temporal opaca, cuyo valor crudo no se commitea;
- mantiene auto-entry Admin del prototipo;
- habilita el picker DEV ya existente para elegir shopper real;
- no modifica `/app/modules/*`;
- falla 401 sin token;
- mantiene source-safe como carril por defecto.

Request `corte6-human-full-visual-redeploy-request.json`: `enabled=false`, `consumed=false`, sin autorización.

## 6. Gate vivo
`AUTORIZACIÓN 1x CLOUD RUN DEV EXISTENTE + 1x HOSTING DEV EXISTENTE → REMOTE SMOKE → ENLACE TEMPORAL SIN CREDENCIALES → HUMAN VISUAL ADMIN + SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 7. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 8. Estado seguro
Desde el último deploy no hubo nuevas mutaciones provider. Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; no merge; producción intacta.

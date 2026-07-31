# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.

## 3. Protected Hosting + continuidad de sesión — PASS
Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida PASS.

Resultado:
- exactamente1 Hosting DEV redeploy;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `sites/cxorbia-backend-dev/versions/1e8c37163e7451be`;
- release `sites/cxorbia-backend-dev/releases/1785515981786000`;
- protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI PASS;
- continuidad de sesión asset PASS;
- persistencia Firebase `LOCAL` PASS;
- credentialsEmbedded=false.

Durante este redeploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; producción=false; merge=false.

## 4. Human visual Corte6 — gate actual
La causa del login repetitivo quedó corregida técnicamente. Falta demostrar el comportamiento humano esperado:
1. una autenticación real válida una sola vez;
2. refresh sobre la misma URL protegida;
3. no re-prompt de usuario/contraseña mientras no exista logout explícito;
4. validar Admin/Coordinación con perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp y demás datos actuales;
5. validar KPI con detalle e histórico completo por shopperId incluyendo `submitida`;
6. validar Shopper autenticado con claim shopperId real y módulos propios.

URL: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`

## 5. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 6. Siguiente bloque exacto
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 7. Estado seguro
Autorizaciones Firestore y Hosting consumidas; no reutilizar. PR#7 draft/open/no merge; producción intacta.

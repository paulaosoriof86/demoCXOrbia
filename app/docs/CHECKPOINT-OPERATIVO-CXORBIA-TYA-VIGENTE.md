# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 3. Perfil completo Firestore — WRITE/READBACK PASS
Authorization `chat-20260731-c6-profile-full-firestore-write-01` consumida PASS.

-120 document writes exactos;
-118 docs con cambios +2 marker-only;
-329 valores;
-readback120 docs/329 campos;
-mismatches0;
-31 missing canonical HOLD.

## 4. Protected Hosting DEV — REDEPLOY PASS
Authorization `chat-20260731-corte6-protected-runtime-redeploy-01` consumida PASS.

- un único Hosting deploy ejecutado;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_RUNTIME_REMOTE_VERIFIED`;
- version `sites/cxorbia-backend-dev/versions/df3b5ce0359bcadd`;
- release `sites/cxorbia-backend-dev/releases/1785513222990000`;
- protected assets/Auth bridge/Firestore adapter/profile bridge/history KPI remote PASS;
- carril source-safe por defecto preservado.

Durante este redeploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; producción=false; merge=false.

## 5. Human visual Corte6 — gate actual
Corte6 aún no se congela. Validar en el carril protegido:
- Admin/Coordinación con perfil completo real, username/password legado cuando exista y datos de contacto/personales actuales;
- KPI con detalle;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper autenticado con claim shopperId real y acceso a sus módulos.

URL: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`

## 6. 31 identity HOLD
Probados por legacyShopperId exacto, llaves técnicas exactas/únicas y Auth determinístico + claim:0 resueltos. No match por nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 7. Fuente/precedencia
Export vigente manda para perfil actual. Firebase Auth sigue siendo autoridad de autenticación.616 visitas y77 certificaciones canónicas siguen siendo autoridad histórica.

## 8. Siguiente bloque exacto
`HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → si PASS, ALTA/CONCILIACIÓN31 HOLD → FREEZE C6 → AGOSTO`.

## 9. Estado seguro
Ambas autorizaciones one-shot consumidas. PR#7 draft/open/no merge; producción intacta.

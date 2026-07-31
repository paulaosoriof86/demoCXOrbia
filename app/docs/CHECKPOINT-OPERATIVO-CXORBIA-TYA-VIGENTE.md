# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__NO_CREDENTIAL_FULL_VISUAL_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_HOLD__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.

## 3. Regla human visual prevalente
Paula no necesita ni debe conocer credenciales técnicas Firebase para QA. Human visual usa auto-entry del prototipo; Auth/claims/Rules permanecen como gate técnico/provider separado.

## 4. No-credential full visual DEV — PASS
Autorización `chat-20260731-corte6-human-full-visual-no-credential-01` consumida PASS.

Ejecutado exactamente:
- 1 redeploy Cloud Run DEV existente `cxorbia-live-hr-dev`, revisión `cxorbia-live-hr-dev-00009-xs8`;
- 1 redeploy Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`;
- endpoint full-profile activo y 401 sin sesión visual;
- bridge full visual + auto-entry + picker Shopper DEV publicados;
- source-safe default preservado.

Durante el gate: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.

## 5. Gate humano actual
Usar enlace temporal de sesión visual sin credenciales Firebase. Validar:
1. Administración/Coordinación entra directamente;
2. Shoppers muestra perfil completo materializado, incluido username/password legacy real cuando exista, teléfono/WhatsApp, DPI y demás campos;
3. KPI shopper abre detalle;
4. histórico completo por shopperId incluye `submitida`;
5. Shopper/Evaluador abre picker DEV de identidad real y navega módulos propios.

## 6. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 7. Siguiente bloque exacto
`HUMAN VISUAL ADMIN+SHOPPER SIN CREDENCIALES → PASS/FAIL → resolver/decidir 31 HOLD → FREEZE C6 → AGOSTO`.

## 8. Estado seguro
Autorización one-shot consumida; no reutilizar. PR#7 draft/open/no merge; producción intacta.

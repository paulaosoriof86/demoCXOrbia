# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__NO_CREDENTIAL_FULL_VISUAL_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- PR#7 draft/open/no merge; producción intacta.

## 2. Regla human visual
Paula no usa credenciales técnicas Firebase para QA. Human visual conserva auto-entry del prototipo; Auth/claims/Rules siguen siendo gate técnico/provider separado.

Claude no debe rediseñar login ni módulos por este punto.

## 3. No-credential full visual — desplegado PASS
Authorization `chat-20260731-corte6-human-full-visual-no-credential-01` consumida.

- 1 Cloud Run DEV redeploy existente `cxorbia-live-hr-dev`, revisión `cxorbia-live-hr-dev-00009-xs8`;
- 1 Hosting DEV redeploy existente `cxorbia-backend-dev/cxorbia-dev`;
- decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`;
- proxy Firestore server-side read-only + token temporal;
- sin token:401;
- bridge full visual publicado;
- auto-entry Admin + picker DEV Shopper real preservados;
- `/app/modules/*` intactos.

## 4. Contrato visual actual
Con enlace temporal DEV:
- Administración/Coordinación entra sin username/password Firebase;
- Shoppers muestra perfil completo materializado, incluido username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás campos;
- KPI debe abrir detalle;
- histórico completo por shopperId debe incluir `submitida`;
- Shopper/Evaluador usa picker DEV de identidad real y navega módulos propios.

## 5. Seguridad
Durante el gate: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; nuevos proyectos/Hosting0; merge=false; producción=false. Token crudo no commiteado.

## 6. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. No usar nombre/teléfono/email ni creación silenciosa.

## 7. Siguiente gate
`HUMAN VISUAL ADMIN+SHOPPER SIN CREDENCIALES → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__NO_CREDENTIAL_FULL_VISUAL_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_HOLD__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 4. Regla human visual — prevalente
Paula no necesita credenciales técnicas Firebase para QA. Human visual DEV usa auto-entry del prototipo; Firebase Auth/claims/Rules permanece como gate técnico/provider separado.

## 5. Human full visual no-credential — PASS técnico
Authorization `chat-20260731-corte6-human-full-visual-no-credential-01` consumida PASS.

Ejecutado:
- 1 Cloud Run DEV existente `cxorbia-live-hr-dev`, revisión `cxorbia-live-hr-dev-00009-xs8`;
- 1 Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`;
- proxy Firestore server-side read-only con sesión visual temporal;
- sin token=401;
- bridge full visual, auto-entry Admin y picker Shopper DEV publicados;
- source-safe default preservado.

Provider data writes durante el gate:0. Merge=false; producción=false.

## 6. Human visual objetivo inmediato
- Admin/Coordinación entra sin credenciales Firebase visibles;
- perfil shopper completo con username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás datos materializados;
- KPI/drill e histórico completo por shopperId incluido `submitida`;
- Shopper/Evaluador usa picker DEV de identidad real existente y navega módulos propios.

## 7. 31 identity HOLD
No resueltos por legacyShopperId, llaves técnicas exactas/únicas ni Auth determinístico+claim. No crear/deduplicar por nombre/teléfono/email.

## 8. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → identificar/reconciliar fuente agosto plataforma-origin → materializar solo delta autorizado.

## 9. Claude/prototipo
No rediseñar ni reescribir login/módulos por este punto. La corrección es backend/core/adapters DEV. Mantener UI aprobada.

## 10. Academia
Documentar separación human QA/provider Auth, token visual temporal, server-side read-only, one-shot deploy, fail-closed y validación humana.

## 11. Gate vivo inmediato
`HUMAN VISUAL ADMIN+SHOPPER SIN CREDENCIALES → PASS/FAIL → resolver/decidir 31 HOLD → FREEZE C6 → AGOSTO`.

## 12. Estado seguro
Autorización de redeploy consumida; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0 durante este gate; merge=false; producción=false.

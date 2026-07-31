# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_IDENTITY_HOLD__NO_PRODUCTION`

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

## 4. Corte6 perfil completo — WRITE/READBACK PASS
120 perfiles exactos materializados:118 field-change +2 marker-only;329 valores; readback120/329;0 mismatch. La autorización one-shot está consumida.

## 5. Protected Hosting DEV — PASS
Un único redeploy del Hosting DEV existente quedó ejecutado y verificado remotamente. Version `sites/cxorbia-backend-dev/versions/df3b5ce0359bcadd`, release `sites/cxorbia-backend-dev/releases/1785513222990000`. La autorización one-shot está consumida.

Protected runtime, Auth bridge, Firestore adapter, shopper fail-closed, profile bridge e histórico/KPI incluyendo `submitida` pasan smoke remoto; el carril source-safe por defecto se preserva.

## 6. Human visual Corte6 — gate vigente
Validar ahora sobre el carril protegido:
- Admin/Coordinación: perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp y demás datos actuales;
- KPI de shoppers con detalle;
- histórico completo por shopperId;
- Shopper: autenticación real y custom claim shopperId, sin identidad anónima.

URL: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`.

## 7. 31 identity HOLD
Investigados por legacyShopperId, llaves técnicas exactas/únicas y Auth determinístico + claim:0 resueltos. No crear/deduplicar por nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 8. Fuente/histórico
Export vigente = source-of-truth para perfil actual. Firebase Auth = autoridad de login.616 visitas y77 certificaciones canónicas prevalecen.

## 9. Gate vivo inmediato
`HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → si PASS, ALTA/CONCILIACIÓN31 HOLD → FREEZE C6`.

## 10. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 11. Claude/prototipo
No rediseñar. Mantener UI aprobada. Si backend/adapter entrega datos y la UI no los refleja, documentar ajuste por archivo para Claude; backend no reescribe módulos UI.

## 12. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, authorization one-shot, write/readback, deploy/smoke remoto, validación humana y HOLD explícito.

## 13. Estado seguro
Durante redeploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; merge=false; producción=false.

# CAMBIOS BACKEND — Corte 6 protected Hosting DEV redeploy PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. Autorización consumida
AuthorizationId `chat-20260731-corte6-protected-runtime-redeploy-01`.

Alcance autorizado y ejecutado: un único redeploy del Hosting DEV existente `cxorbia-backend-dev` / target `cxorbia-dev` para publicar el runtime protegido y validar después Admin + Shopper mediante Firebase Auth/custom claims/RBAC.

La autorización quedó `consumed_pass` y no es reutilizable.

## 2. Resultado provider
Gate `PASS_C6_PROTECTED_RUNTIME_HOSTING` y decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_RUNTIME_REMOTE_VERIFIED`.

- Hosting deploy executions: 1;
- version: `sites/cxorbia-backend-dev/versions/df3b5ce0359bcadd`;
- release: `sites/cxorbia-backend-dev/releases/1785513222990000`;
- protected runtime assets: PASS;
- Auth bridge: PASS estático/remoto;
- Firestore adapter: PASS estático/remoto;
- shopper scope fail-closed: PASS;
- profile bridge: PASS;
- histórico/KPI incluye `submitida`: PASS;
- carril source-safe por defecto preservado: PASS.

## 3. Datos preservados
El redeploy no repitió el write de perfiles ni el histórico. Permanecen cerrados:
-120 Firestore profile writes /329 valores /readback0 mismatch;
- R17N1,406/1,406;
-616 visitas canónicas;
-77 certificaciones;
- Auth91/91, claims y Rules previos.

## 4. Exclusiones confirmadas
Durante este redeploy: Firestore writes0; Auth writes0; Firebase Auth password changes0; Rules0; Cloud Run0; Storage0; HR/legacy writes0; Make/Gemini0; pagos0; merge=false; producción=false.

## 5. P0 visual
El P0 técnico que impedía publicar el carril protegido queda preparado y desplegado, pero Corte6 **no se congela todavía**. Falta la validación humana de:
- Admin/Coordinación autenticado con perfil completo visible;
- username/password legacy real cuando exista;
- teléfono/WhatsApp y demás datos actuales del perfil;
- KPI con drill/details;
- histórico completo por shopperId, incluyendo estados canónicos y `submitida`;
- Shopper autenticado con custom claim `shopperId` real y módulos de su propia identidad.

## 6. 31 identity HOLD
Los31 perfiles legacy sin vínculo canónico reproducible permanecen HOLD. Este redeploy no los creó, deduplicó ni emparejó por nombre/teléfono/email. Requieren bloque explícito posterior de alta/conciliación.

## 7. URL de validación protegida
`/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`

El carril source-safe normal continúa separado y no debe usarse para validar PII/perfil completo.

## 8. Clasificación
- **Reusable CXOrbia:** carril protegido separado, one-shot Hosting gate, smoke remoto y coexistencia source-safe/protected.
- **Exclusivo cliente:** perfiles TyA y31 identity HOLD.
- **Claude/prototipo:** no rediseño; validar UI existente con datos reales del adapter.
- **Academia:** separación source-safe/protected y validación humana posterior a readback/deploy.
- **Sin impacto Claude:** infraestructura del gate/deploy/evidencia.

## 9. Siguiente bloque exacto
`HUMAN VISUAL ADMIN+SHOPPER → documentar PASS/FAIL → si PASS, bloque explícito31 HOLD → FREEZE C6 → AGOSTO`.

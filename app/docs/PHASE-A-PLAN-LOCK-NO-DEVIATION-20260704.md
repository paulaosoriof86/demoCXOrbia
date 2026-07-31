# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

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

## 4. Protected session continuity Hosting DEV — PASS
El P0 visual de login repetitivo fue causado por persistencia Auth `SESSION` en protected runtime/browser-auth. La corrección de raíz fue aplicada:
- `backend-protected-dev-session-continuity.js` protected-only;
- Firebase Auth `LOCAL` incluso si browser-auth solicita `SESSION`;
- protected config `persist:'local'` + `reuseAuthenticatedSession:true`;
- carga antes de browser-auth;
- sin credenciales/tokens/UID embebidos;
- sin bypass Auth/claims/Rules;
- logout explícito real.

Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida PASS.

Resultado remoto:
- exactamente1 Hosting DEV redeploy;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `sites/cxorbia-backend-dev/versions/1e8c37163e7451be`;
- release `sites/cxorbia-backend-dev/releases/1785515981786000`;
- session continuity/persistence LOCAL verificados;
- protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI PASS;
- provider writes adicionales0; producción=false; merge=false.

## 5. Human visual Corte6 — gate vivo
Contrato esperado:
1. una primera autenticación real válida por navegador;
2. refresh sobre la misma ruta protegida;
3. no re-prompt mientras no exista logout explícito;
4. validar Admin/Coordinación con perfil completo, KPI e histórico;
5. validar Shopper con shopperId real.

## 6. 31 identity HOLD
Investigados por legacyShopperId, llaves técnicas exactas/únicas y Auth determinístico + claim:0 resueltos. No crear/deduplicar por nombre/teléfono/email.

## 7. Fuente/histórico
Export vigente = source-of-truth para perfil actual. Firebase Auth = autoridad de login.616 visitas y77 certificaciones canónicas prevalecen.

## 8. Gate vivo inmediato
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → ALTA/CONCILIACIÓN31 HOLD → FREEZE C6`.

## 9. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 10. Claude/prototipo
No rediseñar ni reescribir login/módulos por este P0. Es corrección backend/core de continuidad. Mantener UI aprobada.

## 11. Academia
Documentar diferencia entre autenticación inicial real y persistencia de sesión de QA, además de source-safe/protected, identity claims, one-shot gates, readback, smoke y validación humana.

## 12. Estado seguro
Autorizaciones de perfil y Hosting consumidas. Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys adicionales0; merge=false; producción=false.

# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_ONE_HOSTING_REDEPLOY_AUTH__NO_PRODUCTION`

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

## 4. Protected Hosting DEV anterior — PASS técnico, visual no cerrado
Un único redeploy protegido fue ejecutado/verificado. Version `df3b5ce0359bcadd`; release `1785513222990000`. La autorización está consumida.

## 5. P0 visual de continuidad de sesión
La visual humana demostró que al seleccionar Administración/Coordinación reaparece Usuario/Contraseña. Causa raíz: persistencia Auth `SESSION` tanto en el protected runtime como en browser-auth. El gate de credenciales real se estaba repitiendo en cada ciclo de QA.

Esto es un P0 de flujo de validación porque impide avanzar de forma estable a la comprobación de perfil/KPI/histórico y reproduce un problema ya observado.

## 6. Corrección de raíz preparada
- `backend-protected-dev-session-continuity.js` protected-only;
- fuerza Firebase Auth `LOCAL` incluso si browser-auth solicita `SESSION`;
- protected config declara `persist:'local'` + `reuseAuthenticatedSession:true`;
- carga antes de browser-auth;
- no credenciales/tokens/UID embebidos;
- no bypass Auth/claims/Rules;
- logout explícito sigue cerrando la sesión real.

Contrato esperado: una autenticación real válida por navegador; luego refresh/redeploys restauran silenciosamente la sesión mientras no exista logout explícito.

## 7. 31 identity HOLD
Investigados por legacyShopperId, llaves técnicas exactas/únicas y Auth determinístico + claim:0 resueltos. No crear/deduplicar por nombre/teléfono/email.

## 8. Fuente/histórico
Export vigente = source-of-truth para perfil actual. Firebase Auth = autoridad de login.616 visitas y77 certificaciones canónicas prevalecen.

## 9. Gate vivo inmediato
`NUEVA AUTORIZACIÓN 1x HOSTING DEV SESSION CONTINUITY → REMOTE SMOKE → LOGIN REAL 1 VEZ → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN31 HOLD → FREEZE C6`.

## 10. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 11. Claude/prototipo
No rediseñar ni reescribir login/módulos por este P0. Es corrección backend/core de continuidad. Mantener UI aprobada.

## 12. Academia
Documentar diferencia entre autenticación inicial real y persistencia de sesión de QA, además de source-safe/protected, identity claims, one-shot gates, readback, smoke y validación humana.

## 13. Estado seguro
Fix preparado únicamente en repo. Desde el último deploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; merge=false; producción=false.

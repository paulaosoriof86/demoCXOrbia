# CAMBIOS BACKEND — Corte 6 login repetitivo · corrección de raíz + redeploy PASS

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

## Hallazgo visual
La visual protegida volvió a pedir Usuario/Contraseña al seleccionar Administración/Coordinación. No era un problema de Firestore ni de los 120 perfiles: el runtime protegido estaba configurado con persistencia Firebase Auth `SESSION` y `backend-browser-auth.js` también forzaba `SESSION`, por lo que el flujo de QA podía volver a caer en el gate interactivo.

## Causa raíz
Se mezcló el gate de autenticación real con cada iteración de validación visual. La autenticación debe seguir siendo real y gobernada por Firebase Auth/claims/Rules, pero una sesión DEV ya validada debe reutilizarse entre refresh/redeploys mientras el usuario no haga logout explícito.

## Corrección aplicada
- `app/core/backend-protected-dev-session-continuity.js` actúa solo con `cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`;
- fuerza persistencia Firebase Auth `LOCAL` en ese carril, incluso si el bridge legacy solicita `SESSION`;
- `app/index-backend-dev.html` carga continuidad antes de `backend-browser-auth.js`;
- `app/core/backend-protected-dev-mode.js` declara `persist:'local'` y `reuseAuthenticatedSession:true`;
- no embebe usuario, password, token ni UID;
- no omite claims ni Rules;
- logout explícito sigue cerrando la sesión real.

## Gate de deploy endurecido
El workflow ya no observa cambios ordinarios del request. Solo dispara con `backend/config/corte6-protected-session-continuity-hosting-execute.json`, creado después de autorización explícita y obligado a coincidir con requestId+authorizationId. Esto evita falsos intentos de deploy al preparar requests deshabilitados.

## Redeploy autorizado — PASS
AuthorizationId `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida.

Resultado remoto:
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- exactamente 1 Hosting DEV redeploy sobre `cxorbia-backend-dev/cxorbia-dev`;
- version `sites/cxorbia-backend-dev/versions/1e8c37163e7451be`;
- release `sites/cxorbia-backend-dev/releases/1785515981786000`;
- runtime protegido PASS;
- Auth bridge PASS;
- Firestore adapter PASS;
- profile bridge PASS;
- KPI/histórico incluyendo `submitida` PASS;
- asset de continuidad de sesión PASS;
- persistencia `LOCAL` PASS;
- credenciales embebidas=false.

Request y execute marker quedaron `consumed_pass`, `enabled=false`, `consumed=true`.

## Seguridad/provider state
Durante este redeploy: Firestore writes0; Auth writes/resets0; Rules0; Cloud Run0; Storage0; HR/legacy writes0; Make/Gemini0; pagos0; merge=false; producción=false.

## Contrato visual siguiente
Se espera exactamente este comportamiento:
1. primera autenticación real válida una sola vez en el navegador;
2. refresh sobre la misma ruta protegida;
3. no volver a pedir usuario/contraseña mientras no haya logout explícito;
4. continuar validación Admin/Shopper de perfil completo, KPI e histórico.

## Clasificación
- **Reusable CXOrbia:** persistencia de sesión QA protegida + execute marker one-shot.
- **Exclusivo cliente:** ninguno.
- **Claude/prototipo:** no rediseño; no tocar módulos UI.
- **Academia:** separar autenticación inicial de continuidad de sesión de validación.
- **Sin impacto Claude:** overlay/core, gate y redeploy Hosting DEV.

## Siguiente gate
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

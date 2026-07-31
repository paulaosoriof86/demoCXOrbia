# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_ONE_REAL_LOGIN_REFRESH_NO_REPROMPT_HUMAN_VISUAL__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- PR#7 draft/open/no merge; producción intacta.

## 2. Login repetitivo — causa y corrección
La visual protegida del31-jul volvió a mostrar Usuario/Contraseña al seleccionar Administración/Coordinación. Causa raíz: protected runtime + browser-auth usaban persistencia `SESSION`, por lo que cada ciclo visual podía regresar al gate interactivo.

Fix aplicado:
- `app/core/backend-protected-dev-session-continuity.js` fuerza Firebase Auth `LOCAL` solo en protected DEV;
- `backend-protected-dev-mode.js`: `persist:'local'` + `reuseAuthenticatedSession:true`;
- `index-backend-dev.html`: continuidad cargada antes de browser-auth;
- ninguna credencial/token/UID embebida; no bypass claims/Rules; logout explícito sigue siendo real.

Claude no debe rediseñar login ni módulos UI por este hallazgo. Es corrección backend/core de continuidad de sesión.

## 3. Protected session continuity Hosting DEV — PASS
Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida.

- exactamente1 redeploy del Hosting DEV existente;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `sites/cxorbia-backend-dev/versions/1e8c37163e7451be`;
- release `sites/cxorbia-backend-dev/releases/1785515981786000`;
- session continuity asset + persistencia LOCAL verificados remotamente;
- protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI PASS;
- Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0.

## 4. Contrato visual vigente
Primera autenticación real válida una sola vez por navegador. Después, refresh/nuevas visualizaciones deben restaurar sesión sin re-prompt mientras no se haga logout.

Luego validar:
- Admin/Coordinación con perfil completo, username/password legacy real cuando exista y teléfonos/WhatsApp;
- KPI de shoppers con detalle;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper con Auth + custom claim shopperId real y módulos propios.

## 5. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. No usar nombre/teléfono/email ni creación silenciosa.

## 6. Siguiente gate
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

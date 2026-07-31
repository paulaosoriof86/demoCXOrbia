# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_ONE_HOSTING_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual nuevo — login repetitivo
La visual protegida del31-jul volvió a mostrar Usuario/Contraseña al seleccionar Administración/Coordinación. Causa raíz backend/core: protected runtime + browser-auth usaban persistencia `SESSION`, por lo que cada ciclo visual podía regresar al gate interactivo.

## 3. Fix preparado — no deploy todavía
- `app/core/backend-protected-dev-session-continuity.js`: protected DEV only, fuerza Firebase Auth `LOCAL` incluso si browser-auth solicita `SESSION`;
- `backend-protected-dev-mode.js`: `persist:'local'` + `reuseAuthenticatedSession:true`;
- `index-backend-dev.html`: carga continuidad antes de browser-auth;
- ninguna credencial/token/UID embebida; no bypass claims/Rules; logout explícito sigue siendo real.

Claude no debe rediseñar login ni módulos UI por este hallazgo. Es corrección backend/core de continuidad de sesión.

## 4. Contrato visual después del redeploy
Primera autenticación real válida una sola vez por navegador. Después, refresh/nuevas visualizaciones deben restaurar sesión sin re-prompt mientras no se haga logout. Luego validar Admin/Coordinación con perfil completo, KPI/histórico y Shopper con shopperId real.

## 5. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. No usar nombre/teléfono/email ni creación silenciosa.

## 6. Siguiente gate
`NUEVA AUTORIZACIÓN 1x HOSTING DEV SESSION CONTINUITY → REMOTE SMOKE → 1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_ONE_HOSTING_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.

## 3. Protected Hosting anterior — PASS técnico
Authorization `chat-20260731-corte6-protected-runtime-redeploy-01` consumida. Versión `df3b5ce0359bcadd`; release `1785513222990000`.

## 4. Human visual — nuevo P0 comprobado
Las capturas del31-jul muestran que al seleccionar Administración/Coordinación vuelve a desplegarse Usuario/Contraseña. En ese instante el badge indica Firestore activo pero Auth pendiente y datos0, por lo que la visual no llegó a la validación de perfil.

Causa raíz: el protected runtime declaraba `persist:'session'` y `backend-browser-auth.js` forzaba Firebase `SESSION`. Se estaba repitiendo el gate de credenciales en el ciclo de QA en lugar de reutilizar una sesión ya validada.

## 5. Corrección preparada — no desplegada
- nuevo `app/core/backend-protected-dev-session-continuity.js`;
- protected DEV únicamente;
- coerción de cualquier `SESSION` a Firebase `LOCAL`;
- `backend-protected-dev-mode.js`: `persist:'local'`, `reuseAuthenticatedSession:true`;
- `index-backend-dev.html` carga continuidad antes de browser-auth;
- no credenciales/tokens/UID embebidos;
- no bypass Auth/claims/Rules;
- logout explícito sigue cerrando sesión real.

Esto corrige el reproceso: una vez autenticado correctamente en ese navegador, refresh y nuevas visualizaciones restauran la sesión silenciosamente mientras no se haga logout.

## 6. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 7. Siguiente bloque exacto
`NUEVA AUTORIZACIÓN 1x HOSTING DEV PARA SESSION CONTINUITY → REMOTE SMOKE → LOGIN REAL UNA SOLA VEZ → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

## 8. Estado seguro
La autorización Hosting anterior está consumida y no se reutiliza. Desde ese deploy no hubo Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys. PR#7 draft/open/no merge; producción intacta.

# CAMBIOS BACKEND — Corte 6 login repetitivo · corrección de raíz preparada

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__VISUAL_LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__NO_NEW_DEPLOY__NO_PRODUCTION`

## Hallazgo visual
La visual protegida volvió a pedir Usuario/Contraseña al seleccionar Administración/Coordinación. Esto no es un problema de Firestore ni de los120 perfiles: el runtime protegido estaba configurado con persistencia Firebase Auth `SESSION` y `backend-browser-auth.js` también forzaba `SESSION`, por lo que el flujo de QA podía volver a caer en el gate interactivo.

## Causa raíz
Se mezcló el gate de autenticación real con cada iteración de validación visual. La autenticación debe seguir siendo real y gobernada por Firebase Auth/claims/Rules, pero una sesión DEV ya validada debe reutilizarse entre refresh/redeploys mientras el usuario no haga logout explícito.

## Corrección preparada
- nuevo `app/core/backend-protected-dev-session-continuity.js`;
- solo actúa con `cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`;
- fuerza persistencia Firebase Auth `LOCAL` en ese carril, incluso si el bridge legacy solicita `SESSION`;
- no embebe usuario, password, token ni UID;
- no omite claims ni Rules;
- logout explícito conserva el comportamiento real de cerrar la sesión;
- `app/index-backend-dev.html` carga el overlay antes de `backend-browser-auth.js`;
- `backend-protected-dev-mode.js` declara `persist:'local'` y `reuseAuthenticatedSession:true`.

## Alcance
Este cambio evita pedir credenciales otra vez en cada visualización después de la primera autenticación válida. No convierte la ruta protegida en pública y no expone PII/contraseñas sin Auth.

## Provider state
No se ejecutó otro Hosting deploy. Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; producción=false; merge=false.

## Siguiente gate
Se requiere una nueva autorización one-shot únicamente para redeploy del mismo Hosting DEV, porque la autorización anterior ya fue consumida. Después: login real una sola vez → refresh/visualizaciones repetidas sin re-prompt → Admin/Shopper visual.

## Clasificación
- **Reusable CXOrbia:** persistencia de sesión de QA protegida sin debilitar Auth/RBAC.
- **Exclusivo cliente:** ninguno.
- **Claude/prototipo:** no rediseño; no tocar módulos UI.
- **Academia:** separar autenticación inicial de continuidad de sesión de validación.
- **Sin impacto Claude:** overlay/core y gate de Hosting DEV.

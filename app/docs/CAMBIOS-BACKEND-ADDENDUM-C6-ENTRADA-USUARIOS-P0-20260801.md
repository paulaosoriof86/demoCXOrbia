# CAMBIOS BACKEND — C6 ENTRADA/USUARIOS P0

**Fecha:** 2026-08-01  
**Clasificación:** Reusable CXOrbia · Claude/prototipo · Academia · Sin impacto producción  
**Estado al preparar:** `P0_PROVEN__FIX_PREPARED__AUTHORIZED_1X_HOSTING_DEV__NO_PRODUCTION`

## 1. Evidencia humana reproducible
Paula abrió el Hosting DEV y obtuvo dos regresiones sucesivas:

1. con la ruta base, `connected` persistido quedó `Bloqueado` y apareció `Fuente de datos no disponible`;
2. con la ruta protegida, volvió el selector genérico `Selecciona un perfil` con botones de rol, en lugar de restaurar sesión o presentar directamente el login real de Usuario + Contraseña.

No fue un problema del navegador ni de Firebase. Fue un defecto de entrada y orden de arranque que el smoke anterior no cubría.

## 2. Causa raíz
- `index-backend-dev.html` no normalizaba la ruta base al carril DEV protegido.
- `core/data-source.js` recuperaba correctamente `connected` desde localStorage y bloqueaba de forma fail-closed si el carril no quedaba activo.
- el bridge de Auth preservaba el login único, pero el login real seguía oculto detrás del selector genérico de roles;
- una sesión CX persistida sin `currentContext` Firebase hacía que el wrapper `enter()` llamara al `showLogin()` original capturado, saltándose cualquier corrección posterior del login;
- los gates remotos comparaban assets y API, pero no ejecutaban un navegador limpio con `localStorage=connected`.

La corrección anterior había eliminado la segunda pantalla técnica, pero no había cerrado la entrada humana completa. El error quedó trasladado, no eliminado de raíz.

## 3. Fix preparado en rama viva
Sin tocar `app/modules/*` ni `app/core/*`:

- `app/index-backend-dev.html`
  - bootstrap temprano `cxDevEntryCanonicalBootstrap`;
  - la ruta base normaliza preview + protected runtime + proyecto `cinepolis` antes de cargar configuraciones;
  - un carril source-safe solicitado explícitamente no es sobreescrito.
- `app/adapters/tya-dev-entry-auth-gate-v1.js`
  - oculta el selector genérico en el carril protegido;
  - presenta un único login de producto: Tipo de acceso + Usuario + Contraseña;
  - preserva Firebase Auth/claims/Rules y restauración de sesión;
  - no incrusta ni persiste credenciales;
  - cubre tanto `showLogin()` como la ruta `enter()` con sesión CX sin contexto Firebase.
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs`
  - valida ruta canónica, orden de scripts, ausencia de credenciales y preservación del carril source-safe.
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`
  - navegador Chromium real y limpio;
  - pre-siembra `localStorage=connected`;
  - exige ruta canónica, formulario directo, ausencia del selector genérico, ausencia de segunda pantalla técnica y ausencia de la tarjeta bloqueada.
- workflow existente actualizado; no se creó rama, PR ni proyecto nuevo.

## 4. Autorización vigente
Texto exacto de Paula:

`Autorizo fix P0 de entrada visual DEV y un solo redeploy del Hosting DEV existente cxorbia-backend-dev; sin datos, Auth, Rules, Cloud Run, merge ni producción.`

Alcance:
- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`: máximo 1 deploy;
- Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes: 0;
- Cloud Run deploys: 0;
- nuevos Firebase/Hosting: 0;
- merge: false;
- producción: false.

## 5. Gates obligatorios
Antes del deploy:
1. gates acumulados de dominio, Finanzas, Shopper y Reservas;
2. gate estático de entrada;
3. navegador local limpio real.

Después del deploy:
1. paridad exacta de `index-backend-dev.html` y adapter;
2. navegador remoto limpio real sobre la ruta base;
3. HR viva preservada en 616 visitas;
4. full-profile sin autorización continúa 401/fail-closed.

## 6. Claude/prototipo
Claude no debe:
- reinstalar selector genérico antes del login real;
- crear segunda pantalla técnica;
- resolver credenciales desde localStorage;
- modificar módulos para compensar la entrada;
- eliminar la separación `staff`/`shopper`.

## 7. Academia/manuales
Documentar:
- diferencia entre rol visible y namespace de autenticación;
- login único de producto;
- restauración de sesión sin persistir credenciales;
- fail-closed de datos no equivale a error de usuario;
- una validación de Hosting requiere navegador real, no solo paridad de archivos.

## 8. Estado seguro
Fix en GitHub; deploy aún no ejecutado al crear este addendum. Producción intacta.

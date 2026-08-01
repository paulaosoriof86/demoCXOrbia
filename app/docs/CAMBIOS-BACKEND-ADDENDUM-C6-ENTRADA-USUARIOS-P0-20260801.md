# CAMBIOS BACKEND — C6 ENTRADA/USUARIOS P0

**Fecha:** 2026-08-01  
**Clasificación:** Reusable CXOrbia · Claude/prototipo · Academia · Sin impacto producción  
**Estado final:** `PASS_C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_EXISTING_HOSTING_REMOTE_BROWSER`

## 1. Evidencia humana reproducible
Paula encontró dos regresiones sucesivas en el Hosting DEV:

1. la ruta base, con `connected` persistido, mostró `Fuente de datos no disponible / Conectado · Bloqueado`;
2. la ruta protegida volvió a mostrar `Selecciona un perfil`, aunque el login real de Usuario + Contraseña existía detrás.

No fue un problema del navegador ni de Firebase. Fue un defecto de entrada y autenticación visible que los smokes anteriores no cubrían.

## 2. Causa raíz
- `index-backend-dev.html` no normalizaba la ruta base al carril protegido.
- `core/data-source.js` hacía correctamente fail-closed cuando el carril no quedaba activo.
- la corrección anterior eliminó una segunda pantalla técnica, pero dejó el selector genérico como paso previo;
- una sesión CX sin `currentContext` Firebase podía volver al `showLogin()` original;
- el selector se intentó ocultar, pero el navegador real comprobó que botones `.role-btn/.role-alt` seguían visibles;
- los smokes previos comparaban assets y API, no el arranque real con `localStorage=connected`.

El error había sido trasladado, no cerrado de raíz.

## 3. Corrección aplicada
Sin tocar `app/modules/*` ni `app/core/*`:

### `app/index-backend-dev.html`
- bootstrap temprano `cxDevEntryCanonicalBootstrap`;
- la URL base normaliza preview + protected runtime + proyecto `cinepolis` antes de cargar configuraciones;
- un carril source-safe solicitado expresamente no es sobreescrito.

### `app/adapters/tya-dev-entry-auth-gate-v1.js`
- cubre `showLogin()` y `enter()`;
- elimina físicamente del DOM el selector genérico, sus botones, accesos alternativos, registro e invitados;
- presenta un único login de producto: Tipo de acceso + Usuario + Contraseña;
- conserva namespaces `staff` y `shopper`;
- preserva Firebase Auth/claims/Rules y restauración de sesión;
- no incrusta ni persiste credenciales.

### Gates
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs` valida contrato, orden y ausencia de credenciales.
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs` usa Chromium limpio y pre-siembra `localStorage=connected`.
- el gate de navegador detectó antes del deploy que ocultar el selector no era suficiente: `local_browser__assert_no_generic_roles`.
- se reemplazó “ocultar” por eliminación del DOM y el mismo gate pasó.
- el workflow existente registra la etapa exacta de cualquier fallo antes de proveedor.

## 4. Autorización y ejecución
Autorización exacta de Paula:

`Autorizo fix P0 de entrada visual DEV y un solo redeploy del Hosting DEV existente cxorbia-backend-dev; sin datos, Auth, Rules, Cloud Run, merge ni producción.`

Resultado:
- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev` desplegado `1/1`;
- autorización consumida;
- decisión `PASS_C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_EXISTING_HOSTING_REMOTE_BROWSER`;
- evidencia `app/docs/evidence/CORTE6-DEV-ENTRY-P0-HOSTING-LATEST.json`.

## 5. Evidencia remota PASS
Chromium remoto comprobó:
- URL base canónica;
- `connected` persistido no produce tarjeta bloqueada;
- login directo visible;
- selector genérico ausente;
- segunda pantalla técnica ausente;
- Tipo de acceso, Usuario y Contraseña presentes;
- Firebase session reuse preservado;
- credenciales embebidas=false.

También se preservaron:
- gates canónicos de dominio, Finanzas, portal Shopper y Reservas;
- HR viva con616 visitas;
- full-profile sin autorización 401/fail-closed.

## 6. Claude/prototipo
Claude no debe:
- reinstalar selector genérico antes del login real;
- crear segunda pantalla técnica;
- resolver credenciales desde localStorage;
- mezclar namespaces `staff` y `shopper`;
- modificar módulos para compensar la entrada;
- considerar PASS una prueba que no use navegador real.

## 7. Academia/manuales
Documentar:
- diferencia entre rol visible y namespace de autenticación;
- login único de producto;
- restauración de sesión sin persistir credenciales;
- fail-closed de datos no equivale a error de usuario;
- ocultar un control no equivale a removerlo del flujo;
- todo gate de Hosting humano requiere navegador limpio y estado persistido representativo.

## 8. Pendiente
La entrada queda cerrada técnicamente. Corte6 sigue pendiente únicamente de validación humana acumulativa de entrada, Dashboard/fases, histórico, estabilidad, Shoppers, Finanzas, Reportes y Reservas.

## 9. Estado seguro
Hosting deploy1; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.

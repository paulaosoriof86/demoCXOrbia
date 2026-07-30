# Corte 6 — P0 reproducible: doble login / gate Auth visible en DEV

**Fecha:** 2026-07-30  
**Estado:** `P0_PROVEN_C6_DOUBLE_LOGIN_FORCED_AUTH_GATE__NO_RUNTIME_WRITE__NO_DEPLOY`

## Hecho observado por Paula

En el Hosting DEV `cxorbia-backend-dev` aparece primero una pantalla separada **“Acceso seguro”** con `Tipo de acceso + Usuario + Contraseña`. Paula reporta que este paso no existía en el flujo habitual: anteriormente el acceso DEV llegaba directamente al login normal del proyecto. Al intentar las credenciales operativas conocidas, el gate puede mostrar el error genérico de validación y, además, el flujo termina exponiendo el login normal del producto como segundo paso.

La captura humana de 2026-07-30 es evidencia suficiente para declarar **NO APROBADO** el gate visual actual. No se requiere pedir contraseña por chat ni repetir el intento para probar el problema de doble login.

## Evidencia de código — causa raíz

### 1. `app/core/backend-browser-auth.js`

El archivo crea deliberadamente un overlay full-screen `#cxBackendAuthGate` con el formulario `Tipo de acceso + Usuario + Contraseña`.

Además:

- reemplaza `CX.app.showLogin()` en preview para mostrar el overlay en lugar del login original;
- limpia `CX.session` al cargar el DOM;
- fuerza `ensureOverlay()` cuando `previewMode=true`;
- autentica con Firebase antes de permitir el contexto protegido.

Por tanto, el nuevo paso visual no viene de Firebase por obligación ni del navegador: fue introducido por la capa backend-browser.

### 2. `app/core/backend-config-preview-dev.js`

El preview fija `devPreviewAuth.mode='interactive-session'` y `storedCredentialFallback=false`, por lo que el flujo exige interacción visible cuando no existe una sesión Firebase restaurable.

### 3. `app/core/backend-firebase.js`

`start()` ejecuta `ensurePreviewAuth()` antes de `refresh()`. Como `ensurePreviewAuth()` delega en `CX.backendAuth.ensureAuthenticated()`, el gate Auth queda por delante del flujo normal del producto.

### 4. El login normal sigue existiendo

`app/index-backend-dev.html` conserva `<div id="login"></div>` y `app/app.js` conserva `CX.app.init() → CX.session.load() → enter()/showLogin()` con el login tenant-aware de Administración/Coordinación, Cliente, Shopper y roles configurados.

Conclusión: hoy existen dos capas de acceso visual que compiten entre sí. El segundo gate es redundante desde UX y contradice el objetivo de mantener **Firebase Auth detrás del adapter**, no como una pantalla adicional.

## Qué NO se reabre

Este P0 no invalida ni autoriza repetir:

- import Auth `91/91` y readback PASS;
- hashes/contraseñas legacy ya migrados;
- namespaces `staff/shopper`;
- claims/Rules ya validados;
- 1,406 writes históricos R17N;
- Corte 5 `CX.data` Firestore PASS;
- Corte 3 frozen;
- materialización histórica hasta julio.

Tampoco autoriza reset de contraseña, nuevos usuarios, nuevo Firebase/Hosting, Firestore data writes, Rules, Storage, HR, legacy writes, Make/Gemini, pagos, merge ni producción.

## Corrección de raíz requerida

Debe existir **un solo flujo de acceso visible**.

1. Firebase Auth continúa siendo la autoridad real y permanece detrás del adapter.
2. Se elimina la obligación de atravesar una pantalla backend separada antes del login del proyecto.
3. El acceso visible del tenant/proyecto debe ser el único punto de entrada y conservar la semántica aprobada de usuario/perfil.
4. Una sesión Firebase válida debe restaurarse silenciosamente; no se debe limpiar por rutina al cargar la página.
5. Si se requiere autenticación interactiva, debe integrarse en el mismo flujo normal de acceso del producto, no agregar un segundo login.
6. El usuario no debe autenticar dos veces ni conocer identificadores/provider internos.
7. El error de credenciales debe distinguir fallo de contraseña de fallo de namespace/scope sin revelar información sensible.

## Responsabilidad

- **Backend:** preservar Auth/claims/session y exponer contrato de autenticación sin UI paralela.
- **Claude/prototipo:** ajuste focalizado del login normal si necesita incorporar el input de credenciales reales; no rediseñar módulos ni abrir nueva candidata por rutina.
- **Academia:** documentar un único flujo de acceso; Firebase/provider no es un paso visible para el usuario.

## Siguiente bloque exacto

`P0 FOCAL LOGIN ROUTE → GATES LOCALES/ESTÁTICOS → AUTORIZACIÓN ÚNICA DE REDEPLOY DEV SI EL BUILD QUEDA PASS → SMOKE REMOTO → VALIDACIÓN VISUAL PAULA → FREEZE CORTE 6 → AGOSTO DELTA`.

Paula no debe repetir la prueba del gate actual ni ejecutar PowerShell.

## Estado seguro

Este diagnóstico/documento no ejecuta Auth writes, Firestore writes, Rules, Hosting deploy, Storage, HR/legacy writes, Make/Gemini, pagos, merge ni producción.

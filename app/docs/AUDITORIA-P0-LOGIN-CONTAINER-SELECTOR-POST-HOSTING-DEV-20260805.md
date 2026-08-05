# Auditoría P0 — selector del contenedor de Login posterior a Hosting DEV

**Fecha:** 2026-08-05  
**Decisión:** `P0_PROVEN`

## Evidencia runtime

Después del único Hosting DEV y de paridad remota PASS, el gate Staff registró:

```text
firebaseWrapper=true
backendAuthPresent=true
earlyGuardInstalled=true
earlyGuardIntercepts=0
integratedStep=false
integratedLogin=false
appOn=false
```

## Evidencia source

### Markup vigente V7.2

`app/app.js`:

```html
<form class="lg2-card" id="loginForm">
```

### Selector del bridge oficial

`app/core/backend-browser-auth.js`:

```js
const card = loginRoot && loginRoot.querySelector('.login-card');
if(!card) return;
```

### Selector del fallback Cliente

`app/adapters/tya-c6-unified-human-runtime-v1.js`:

```js
const card=loginRoot&&loginRoot.querySelector('.login-card');
if(!card||!CX.backendAuth)return;
```

## Cadena causal

1. el botón Staff llama al wrapper oficial;
2. el wrapper oficial está instalado, por lo que el guard temprano no intercepta;
3. `showCredentialStep()` busca `.login-card`;
4. V7.2 solo tiene `.lg2-card`;
5. el método retorna sin crear `#cxIntegratedAuthStep`;
6. Staff no puede iniciar autenticación;
7. el gate cierra correctamente en STOP_RETRY.

## Root fix exacto

En ambos archivos:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

## Alcance

- dos cambios focales source-only;
- sin rediseño;
- sin modificar `app/app.js` ni CSS;
- sin Auth, Firestore, HR o credenciales;
- requiere nuevo deploy DEV para hacerse observable;
- producción permanece intacta.

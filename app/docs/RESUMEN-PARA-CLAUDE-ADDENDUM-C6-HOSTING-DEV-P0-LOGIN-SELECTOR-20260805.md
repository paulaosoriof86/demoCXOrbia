# Resumen para Claude — Hosting DEV desplegado y P0 selector de Login

- V7.2-P0F1 permanece como candidata acumulativa única.
- La membresía Cliente fue reparada con un solo write y todos sus gates pasaron.
- El único Hosting DEV autorizado fue desplegado y la paridad remota pasó.
- No crear V7.3, shell paralelo, rama o PR.
- No rediseñar Login ni módulos.

## P0 exacto

V7.2 renderiza el contenedor como `.lg2-card`, pero los bridges de Auth aún buscan `.login-card`:

- `app/core/backend-browser-auth.js` → `showCredentialStep()`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js` → `clientCredentialStep()`.

Por eso Staff no abre el formulario integrado y el gate cierra con `integratedStep=false`.

## Delta frontend autorizado a proponer

Cambio acumulativo mínimo en ambos archivos:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

No alterar markup, estilos, roles, credenciales, Auth, navegación ni lógica de módulos.

El segundo Hosting DEV todavía no está autorizado.

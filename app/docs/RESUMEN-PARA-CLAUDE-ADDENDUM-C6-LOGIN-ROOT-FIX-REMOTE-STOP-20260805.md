# RESUMEN PARA CLAUDE — Addendum C6 Login root fix y STOP remoto

**Fecha:** 2026-08-05  
**Estado:** `LOGIN_AUTH_FIXED_AND_DEPLOYED__CLIENT_ROUTE_RENDER_PREDICATE_PENDING_DIAGNOSTIC`

## Conectado y validado

- Login V7.2 conserva `<form class="lg2-card" id="loginForm">`.
- Los dos bridges autorizados aceptan `.lg2-card, .login-card`.
- Source/static y contrato de Laboratorio: PASS.
- Segundo Hosting DEV correctivo: release completa.
- Paridad remota de assets y HR viva: PASS.
- Staff: Login real, recargas y nueva pestaña PASS.
- Shopper: Login real, recargas, nueva pestaña y visita propia PASS.
- Cliente: Login real con credencial existente, recarga y nueva pestaña PASS.
- Finanzas: modelo delegado, sin regalías locales ni valores inventados.
- Reservas: fail-closed y sin mutaciones reales.

## No modificar

- No rediseñar el Login.
- No reemplazar `.lg2-card`.
- No retirar compatibilidad `.login-card`.
- No cambiar el wrapper oficial, credenciales, Auth, memberships, HR, Finanzas o Reservas por este hallazgo.
- No crear shell paralelo ni ruta alternativa para Cliente.

## Pendiente focal de interfaz

El gate acumulativo llamó:

```js
CX.router.nav('cli_dashboard')
```

La evidencia comprobó:

```text
clientModule=true
routerAvailable=true
requested=true
routeAfterRequest=cli_dashboard
```

Sin embargo, el gate agotó 30 segundos esperando simultáneamente:

```text
session.view === cli_dashboard
#nav-cli_dashboard.active === true
#view .ph existe
#view contiene texto
```

La evidencia no aisló cuál de las últimas tres condiciones quedó falsa. No asumir que el módulo, router o Login falló: el módulo existe, el router respondió y la autenticación Cliente pasó en un gate independiente.

## Ajuste futuro, solo si el diagnóstico lo demuestra

Revisar por archivo/módulo:

- `app/core/router.js`: activación del rail y render de `cli_dashboard`;
- `app/modules/cliente.js`: registro y salida HTML de `cli_dashboard`;
- `app/core/ui.js`: helper `ph()`;
- `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`: predicado combinado y captura de subcondiciones.

Primero debe ejecutarse diagnóstico read-only que registre por separado:

```text
routeId
navElementExists
navActive
viewExists
pageHeaderExists
viewTextLength
renderException
```

Solo con evidencia reproducible debe clasificarse como defecto de producto o falso negativo/timing del harness.

## Academia

Actualizar manuales y cursos para reflejar que el Login integrado ya funciona para Staff, Shopper y Cliente. No declarar todavía validado el recorrido visual completo del Panorama Cliente hasta cerrar `client_route_wait`.

## Seguridad

No hubo cambios de Auth, contraseñas, Firestore, Rules, Storage, HR, Make, Gemini, pagos, merge o producción. No existe autorización para otro deploy.

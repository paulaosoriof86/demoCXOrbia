# RESUMEN PARA CLAUDE — C6 Login selector source/static HOLD

Fecha: 2026-08-05

## Conectado y preservado

- V7.2 usa el contenedor visible `.lg2-card`.
- Los dos bridges de autenticación ya reconocen `.lg2-card, .login-card`.
- Se preservaron la composición acumulativa Phase A, módulos, HR, Finanzas, portales, Reservas y Academia.

## Ajuste frontend

No se requiere rediseño ni nueva candidata. Claude debe preservar:

```html
<form class="lg2-card" id="loginForm">
```

y no debe revertir el selector acumulativo de los bridges.

## Pendiente técnico no frontend

El manifiesto/build-lock activo sigue fijando los blobs anteriores de:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

La reconciliación corresponde a control de composición/backend, no a Claude.

## Validación pendiente

Después de reconciliar los dos pins y pasar source/static, deben validarse remotamente Staff, Shopper con tres recargas y nueva pestaña, Cliente, dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas.
